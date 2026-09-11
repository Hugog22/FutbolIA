"""
match_evaluator.py
------------------
Evaluates upcoming football matches and computes pure probabilities.

Supports one evaluator path:
  - Club football (La Liga): _evaluate_match()
"""

import math
import random
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from db.models import Match, Team


# ---------------------------------------------------------------------------
# Poisson-based AI probability helpers for totals
# ---------------------------------------------------------------------------

def _poisson_pmf(lam: float, k: int) -> float:
    """Poisson probability mass function P(X = k). Safe against overflow."""
    if k < 0 or lam <= 0:
        return 0.0
    try:
        return math.exp(-lam) * (lam ** k) / math.factorial(k)
    except (OverflowError, ValueError):
        return 0.0


def _prob_over_goals(lam_home: float, lam_away: float, threshold: float) -> float:
    """
    P(total goals > threshold) using independent Poisson distributions.
    Works for any threshold: 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.5, 4.0...
    """
    n = int(math.floor(threshold))
    prob_le = 0.0
    for total in range(n + 1):
        for h in range(total + 1):
            a = total - h
            prob_le += _poisson_pmf(lam_home, h) * _poisson_pmf(lam_away, a)
    return max(0.0, min(1.0, 1.0 - prob_le))


def _fit_lambdas_from_1x2_probs(
    p_home_win: float,
    p_away_win: float,
    base_total: float = 2.50,
    max_iter: int = 80,
) -> tuple[float, float]:
    """
    Fit Poisson expected-goal lambdas (lam_home, lam_away) so that the
    implied P(home win) matches the predictor's output.
    """
    p_home_win = max(0.05, min(0.90, p_home_win))

    def _p_home(ratio: float) -> float:
        lh = base_total * ratio / (1.0 + ratio)
        la = base_total / (1.0 + ratio)
        p = 0.0
        for h in range(16):
            for a in range(16):
                if h > a:
                    p += _poisson_pmf(lh, h) * _poisson_pmf(la, a)
        return p

    lo, hi = 0.05, 30.0
    for _ in range(max_iter):
        mid = (lo + hi) / 2.0
        if _p_home(mid) < p_home_win:
            lo = mid
        else:
            hi = mid

    ratio = (lo + hi) / 2.0
    lam_home = round(base_total * ratio / (1.0 + ratio), 4)
    lam_away = round(base_total / (1.0 + ratio), 4)
    return lam_home, lam_away


def _normalize_team_name(name: str) -> str:
    """Lowercase + strip for fuzzy team name matching."""
    return name.lower().strip().replace("-", " ")


# ---------------------------------------------------------------------------
# Feature engineering — club football
# ---------------------------------------------------------------------------

def _build_match_features(match: Match, db: Session | None = None) -> dict:
    """Build ELO-based proxy features for club football matches."""
    home, away = match.home_team.name, match.away_team.name

    def get_elo(team_name: str) -> int:
        t = team_name.lower()
        if any(x in t for x in ["madrid", "barcelona", "bellingham", "vinicius", "atletico"]):
            return 2100
        if any(x in t for x in ["girona", "sociedad", "athletic", "betis"]):
            return 1850
        if any(x in t for x in ["mallorca", "almeria", "granada", "cadiz"]):
            return 1300
        return 1500

    home_elo = get_elo(home)
    away_elo = get_elo(away)
    
    admin_feats = {
        "home_offensive_strength": 5.0,
        "away_offensive_strength": 5.0,
        "admin_offensive_diff": 0.0,
        "home_defensive_solidity": 5.0,
        "away_defensive_solidity": 5.0,
        "admin_defensive_diff": 0.0,
        "home_motivation": 5.0,
        "away_motivation": 5.0,
        "admin_motivation_diff": 0.0,
        "home_momentum": 5.0,
        "away_momentum": 5.0,
        "admin_momentum_diff": 0.0,
    }

    if db is not None:
        from db.models import TeamCharacteristic
        h_char = db.query(TeamCharacteristic).filter(TeamCharacteristic.team_id == match.home_team_id).first()
        a_char = db.query(TeamCharacteristic).filter(TeamCharacteristic.team_id == match.away_team_id).first()

        if h_char:
            admin_feats["home_offensive_strength"] = h_char.offensive_strength
            admin_feats["home_defensive_solidity"] = h_char.defensive_solidity
            admin_feats["home_motivation"] = h_char.motivation
            admin_feats["home_momentum"] = h_char.momentum
        
        if a_char:
            admin_feats["away_offensive_strength"] = a_char.offensive_strength
            admin_feats["away_defensive_solidity"] = a_char.defensive_solidity
            admin_feats["away_motivation"] = a_char.motivation
            admin_feats["away_momentum"] = a_char.momentum

        admin_feats["admin_offensive_diff"] = admin_feats["home_offensive_strength"] - admin_feats["away_offensive_strength"]
        admin_feats["admin_defensive_diff"] = admin_feats["home_defensive_solidity"] - admin_feats["away_defensive_solidity"]
        admin_feats["admin_motivation_diff"] = admin_feats["home_motivation"] - admin_feats["away_motivation"]
        admin_feats["admin_momentum_diff"] = admin_feats["home_momentum"] - admin_feats["away_momentum"]

    base_feats = {
        "home_elo":          home_elo,
        "away_elo":          away_elo,
        "elo_diff":          home_elo - away_elo,
        "home_goals_for_avg10": 1.45,
        "home_goals_ag_avg10": 1.45,
        "away_goals_for_avg10": 1.10,
        "away_goals_ag_avg10": 1.45,
        "home_xg_for_avg10": 1.45,
        "home_xg_ag_avg10": 1.45,
        "away_xg_for_avg10": 1.10,
        "away_xg_ag_avg10": 1.45,
        "xg_diff":           0.35,
        "home_absences":     0,
        "away_absences":     0,
        "absence_severity":  0,
        "rest_days_home":    7.0,
        "rest_days_away":    7.0,
    }

    if db is not None:
        def get_team_avg(team_id: int):
            past_matches = db.query(Match).filter(
                (Match.home_team_id == team_id) | (Match.away_team_id == team_id),
                Match.status == "Finished",
                Match.date < match.date
            ).order_by(Match.date.desc()).limit(10).all()
            
            if not past_matches:
                return 1.45, 1.45, 1.45, 1.45
                
            gf, ga, xgf, xga = 0.0, 0.0, 0.0, 0.0
            n = len(past_matches)
            for m in past_matches:
                if m.home_team_id == team_id:
                    gf += m.home_goals or 0
                    ga += m.away_goals or 0
                    xgf += m.home_xg or m.home_goals or 0
                    xga += m.away_xg or m.away_goals or 0
                else:
                    gf += m.away_goals or 0
                    ga += m.home_goals or 0
                    xgf += m.away_xg or m.away_goals or 0
                    xga += m.home_xg or m.home_goals or 0
            
            return gf/n, ga/n, xgf/n, xga/n
        
        h_gf, h_ga, h_xgf, h_xga = get_team_avg(match.home_team_id)
        a_gf, a_ga, a_xgf, a_xga = get_team_avg(match.away_team_id)
        
        base_feats["home_goals_for_avg10"] = h_gf
        base_feats["home_goals_ag_avg10"] = h_ga
        base_feats["home_xg_for_avg10"] = h_xgf
        base_feats["home_xg_ag_avg10"] = h_xga
        
        base_feats["away_goals_for_avg10"] = a_gf
        base_feats["away_goals_ag_avg10"] = a_ga
        base_feats["away_xg_for_avg10"] = a_xgf
        base_feats["away_xg_ag_avg10"] = a_xga
        
        base_feats["xg_diff"] = h_xgf - a_xgf
    
    return base_feats, admin_feats


# ---------------------------------------------------------------------------
# Dynamic AI Justification Generator
# ---------------------------------------------------------------------------

def _generate_justification(best_pred: dict, home: str, away: str, base_feats: dict, admin_feats: dict, importances: dict) -> str:
    """Generate a natural-language explanation using actual feature importances without mentioning odds."""
    prob_pct = int(best_pred["probability"] * 100)
    
    text = f"Nuestro modelo predictivo otorga una probabilidad del {prob_pct}% a '{best_pred['label']}'. "
    
    if importances:
        top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        primary_reason = ""
        for feat, imp in top_features:
            val = base_feats.get(feat, admin_feats.get(feat, 0))
            if np.isnan(val): continue
                
            if feat == "xg_diff" and val > 0.5 and best_pred["outcome"] == "home":
                primary_reason = f"En los datos estadísticos puros, el xG (Goles Esperados) es claramente superior para el local ({home}), lo que le otorga una ventaja competitiva evidente. "
                break
            elif feat == "xg_diff" and val < -0.5 and best_pred["outcome"] == "away":
                primary_reason = f"En los datos estadísticos puros, el xG (Goles Esperados) favorece al visitante ({away}), respaldando fuertemente esta predicción. "
                break
            elif feat == "elo_diff" and val > 100 and best_pred["outcome"] == "home":
                primary_reason = f"En el análisis histórico, el Elo dinámico confirma una superioridad estructural del equipo local. "
                break
            elif feat == "elo_diff" and val < -100 and best_pred["outcome"] == "away":
                primary_reason = f"En el análisis histórico, el Elo dinámico demuestra que el visitante tiene un nivel competitivo considerablemente mayor. "
                break
            elif feat == "possession_diff" and val > 10 and best_pred["outcome"] == "home":
                primary_reason = f"En el control del juego, el dominio de la posesión del equipo local minimiza las opciones del rival. "
                break
            elif feat == "admin_offensive_diff" and val > 1 and best_pred["outcome"] == "home":
                primary_reason = f"En el análisis de las métricas manuales, {home} presenta una fuerza ofensiva muy superior a la defensa de {away}. "
                break
            elif feat == "admin_motivation_diff" and abs(val) > 1:
                fav_team = home if val > 0 else away
                if (val > 0 and best_pred["outcome"] == "home") or (val < 0 and best_pred["outcome"] == "away"):
                    primary_reason = f"En el plano psicológico, {fav_team} llega con un plus de motivación y momentum determinante. "
                    break
                    
        if primary_reason:
            text += primary_reason
        else:
            text += "En los datos analizados, la combinación de múltiples factores tácticos y de forma reciente justifican la predicción. "
    else:
        text += "En la simulación táctica, el equilibrio de fuerzas se rompe a favor de esta selección debido a la solidez estructural evaluada. "
        
    return text


# ---------------------------------------------------------------------------
# Club football evaluator
# ---------------------------------------------------------------------------

def _evaluate_match(match: Match, predictor, db: Session | None = None) -> dict:
    """
    Evaluate a club football match and return a structured prediction dict based ONLY on probabilities.
    """
    home, away = match.home_team.name, match.away_team.name
    base_feats, admin_feats = _build_match_features(match, db)
    features = {**base_feats, **admin_feats}

    predict_features = {k: v for k, v in features.items() if not k.startswith("_")}
    pred = predictor.predict_match(predict_features)

    lam_home, lam_away = _fit_lambdas_from_1x2_probs(
        pred["probabilities"]["home"],
        pred["probabilities"]["away"],
        base_total=2.60,
    )

    candidates = []

    # 1x2 markets
    for outcome, label in [("home", "Victoria Local"), ("draw", "Empate"), ("away", "Victoria Visitante")]:
        candidates.append({
            "market": "1x2",
            "outcome": outcome,
            "label": label,
            "probability": float(pred["probabilities"][outcome]),
        })

    # Over/Under 2.5 markets
    prob_over = pred["prob_over25"]
    for side, prob, label, key in [
        ("over",  prob_over,     "Más de 2.5",   "over25"),
        ("under", 1 - prob_over, "Menos de 2.5", "under25"),
    ]:
        candidates.append({
            "market": "ou25",
            "outcome": side,
            "label": label,
            "probability": round(prob, 4),
        })

    best_pred = max(candidates, key=lambda x: x["probability"])
    candidates.sort(key=lambda x: x["probability"], reverse=True)
    
    feats = {**base_feats, **admin_feats}
    importances = predictor.get_feature_importances() if hasattr(predictor, "get_feature_importances") else {}
    justification_text = _generate_justification(best_pred, home, away, feats, admin_feats, importances)

    return {
        "id": match.id,
        "homeTeam": home,
        "awayTeam": away,
        "date": match.date.isoformat() + "Z" if match.date else None,
        "status": match.status,
        "sport": "football",
        "bestPrediction": {
            "label": best_pred["label"],
            "market": best_pred["market"],
            "outcome": best_pred["outcome"],
            "probability": best_pred["probability"],
        },
        "allPredictions": candidates,
        "justification": justification_text,
    }


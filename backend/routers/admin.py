from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import os, json
try:
    from zoneinfo import ZoneInfo
    MADRID_TZ = ZoneInfo("Europe/Madrid")
except ImportError:
    MADRID_TZ = None

def format_trained_at(ts: str) -> str:
    if not ts or ts == "N/A": return "N/A"
    try:
        dt = datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            from datetime import timezone
            dt = dt.replace(tzinfo=timezone.utc)
        if MADRID_TZ:
            dt = dt.astimezone(MADRID_TZ)
        return dt.strftime("%Y-%m-%d %H:%M:%S (Madrid)")
    except Exception:
        return ts

from db.session import get_db
from db.models import Match, User, Team, MatchTeamStatistics, TeamCharacteristic
from routers.auth import get_current_user

ADMIN_EMAIL = "hugodesax123@gmail.com"

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/training-report")
def get_training_report(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the latest training report log as plain text.
    Only accessible to the admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta página."
        )

    log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs", "training_report.log")
    wc_meta_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "wc_training_meta.json")

    report_lines: list[str] = []

    # AI training log (last 500 lines)
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            report_lines += ["=== DETAILED AI LOG ==="] + lines[-500:]
        except Exception as e:
            report_lines.append(f"Error leyendo log de Clubes: {e}")

    if not report_lines:
        return PlainTextResponse(
            "No hay informes de entrenamiento aún.\nEl primer informe se generará esta madrugada a las 04:30.",
            status_code=200,
        )

    return PlainTextResponse("\n".join(str(l) for l in report_lines), status_code=200)

@router.get("/ai-info")
def get_ai_info(current_user: User = Depends(get_current_user)):
    """
    Returns metadata about the current AI models in use.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    import json
    meta_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "training_meta_v2.json")
    if not os.path.exists(meta_path):
        return {"model_name": "Ensemble V2 (XGBoost + RF)", "trained_at": "No disponible", "in_use_since": "No disponible"}
        
    try:
        with open(meta_path, "r") as f:
            data = json.load(f)
            
            raw_date = data.get("completed_at", "")
            formatted_date = "No disponible"
            if raw_date:
                try:
                    dt = datetime.fromisoformat(raw_date)
                    formatted_date = dt.strftime("%d/%m/%Y %H:%M")
                except:
                    formatted_date = raw_date

            return {
                "model_name": data.get("pipeline", "Ensemble V2 (XGBoost + RF)"),
                "trained_at": formatted_date,
                "in_use_since": formatted_date
            }
    except Exception as e:
        return {"model_name": "Ensemble V2 (XGBoost + RF)", "trained_at": "Error", "in_use_since": "Error"}

@router.post("/clean-duplicates")
def trigger_duplicate_cleanup(
    current_user: User = Depends(get_current_user)
):
    """
    Triggers the one-time duplicate team/match cleanup script.
    Moved from startup background task to manual trigger to prevent
    OOM memory spikes on Render free tier.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta página."
        )
    
    import sys, os
    scripts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts")
    if scripts_dir not in sys.path:
        sys.path.insert(0, scripts_dir)
        
    try:
        from scripts.fix_duplicate_teams import fix_duplicate_teams
        fix_duplicate_teams()
        return {"status": "ok", "message": "Limpieza de duplicados ejecutada con éxito."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante limpieza: {str(e)}")

class TeamStatResponse(BaseModel):
    team_name: str
    matches_played: int
    goals_for: int


    goals_against: int
    wins: int
    draws: int
    losses: int
    last_updated: str
    avg_xg: Optional[float] = None
    avg_possession: Optional[float] = None
    avg_shots_on_target: Optional[float] = None

class TeamCharacteristicDTO(BaseModel):
    team_id: int
    team_name: str
    offensive_strength: float
    defensive_solidity: float
    motivation: float
    momentum: float

class UpdateTeamCharacteristicsRequest(BaseModel):
    characteristics: List[TeamCharacteristicDTO]

@router.get("/team-characteristics", response_model=List[TeamCharacteristicDTO])
def get_team_characteristics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the list of teams and their manual characteristics.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta página."
        )

    # Only return the 20 active La Liga teams
    CURRENT_LALIGA_TEAMS = [
        "Alavés", "Athletic Bilbao", "Atlético Madrid", "Barcelona", "Celta Vigo",
        "Deportivo La Coruña", "Elche", "Espanyol", "Getafe", "Levante", "Málaga",
        "CA Osasuna", "Rayo Vallecano", "Real Betis", "Real Madrid", "Real Sociedad",
        "Racing de Santander", "Sevilla", "Valencia", "Villarreal"
    ]
    
    teams = db.query(Team).filter(Team.name.in_(CURRENT_LALIGA_TEAMS)).order_by(Team.name).all()
    results = []
    for team in teams:
        char = team.characteristic
        if not char:
            char = TeamCharacteristic(
                team_id=team.id,
                offensive_strength=5.0,
                defensive_solidity=5.0,
                motivation=5.0,
                momentum=5.0
            )
            db.add(char)
            db.commit()
            db.refresh(char)
        
        results.append(TeamCharacteristicDTO(
            team_id=team.id,
            team_name=team.name,
            offensive_strength=char.offensive_strength,
            defensive_solidity=char.defensive_solidity,
            motivation=char.motivation,
            momentum=char.momentum
        ))
    return results

@router.put("/team-characteristics")
def update_team_characteristics(
    request: UpdateTeamCharacteristicsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the manual characteristics for multiple teams.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta página."
        )

    for item in request.characteristics:
        char = db.query(TeamCharacteristic).filter(TeamCharacteristic.team_id == item.team_id).first()
        if char:
            char.offensive_strength = item.offensive_strength
            char.defensive_solidity = item.defensive_solidity
            char.motivation = item.motivation
            char.momentum = item.momentum
        else:
            char = TeamCharacteristic(
                team_id=item.team_id,
                offensive_strength=item.offensive_strength,
                defensive_solidity=item.defensive_solidity,
                motivation=item.motivation,
                momentum=item.momentum
            )
            db.add(char)
    db.commit()
    return {"status": "ok", "message": "Team characteristics updated."}

from fastapi import BackgroundTasks
import subprocess
import sys

@router.post("/retrain-model")
def trigger_model_retrain(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Manually triggers the AI model retraining pipeline.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta página."
        )

    def run_retrain():
        train_script = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts", "train_model_v2.py")
        subprocess.run([sys.executable, train_script])

    background_tasks.add_task(run_retrain)
    return {"status": "ok", "message": "El reentrenamiento de La Liga ha comenzado en segundo plano."}

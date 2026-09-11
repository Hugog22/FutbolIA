'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BentoCard from '@/components/BentoCard';
import AnalysisModal from '@/components/AnalysisModal';

import LaLigaBanner from '@/components/LaLigaBanner';
import { getFlag, getEsName } from '@/utils/translations';

const API = '/api/proxy';

// ── Sport Config ─────────────────────────────────────────────────────────────

const LALIGA_CONFIG = {
  key:      'laliga',
  label:    'La Liga',
  subtitle: 'España',
  flag:     '🇪🇸',
  image:    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&h=400&auto=format&fit=crop',
  isOffSeason: false, // La Liga 2026/27 is active
};

type SportKey = 'laliga';

// ── Types ─────────────────────────────────────────────────────────────────────


interface PickData {
  market: string;
  outcome: string;
  label: string;
  probability?: number;
}


interface Match {
  id: number; date: string;
  homeTeam: string; awayTeam: string;
  sport?: string;
  locked?: boolean;
  bestPrediction?: PickData;
  allPredictions?: PickData[];
  justification?: string;
}

interface Props {
  initialMatches: Match[];
  initialParlay: any | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatchesDashboard({ initialMatches }: Props) {
  const { token, user } = useAuth();
  const isPro = user?.subscription_status === 'active';

  const activeSport = 'laliga';
  const [activeMatches, setActiveMatches] = useState<Match[]>(initialMatches || []);
  
  useEffect(() => {
    setActiveMatches(initialMatches || []);
  }, [initialMatches]);

  const [isUnlocking, setIsUnlocking] = useState<number | null>(null);

  const handleUnlock = async (matchId: number) => {
    if (!token) {
        window.location.href = '/register';
        return;
    }
    setIsUnlocking(matchId);
    try {
      const res = await fetch(`${API}/matches/${matchId}/unlock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
         window.location.reload();
      } else {
         const err = await res.json();
         alert(err.detail || "Error al desbloquear");
      }
    } catch (e) {
      alert("Error al desbloquear");
    } finally {
      setIsUnlocking(null);
    }
  };

  // Modals state
  const [activeAnalysisMatch, setActiveAnalysisMatch] = useState<Match | null>(null);

  const activeSportConfig = LALIGA_CONFIG;
  const filteredMatches   = activeMatches;
  const isLaLigaActive  = true;

  return (
    <>
      {/* ── LALIGA BANNER ───────────────────────────────────────────────── */}
      {isLaLigaActive && (
        <section className="mb-16">
          <LaLigaBanner matchCount={activeMatches.length} />
        </section>
      )}

      {/* ── FREE TIER BANNER ─────────────────────────────────────────────── */}
      {user && !isPro && (() => {
        const usedCount = user.free_analyses_used || 0;
        const lockedCount = activeMatches.filter(m => m.locked).length;
        const remaining = Math.max(0, 4 - usedCount);
        if (lockedCount === 0 && usedCount === 0) return null; // nothing locked and none used, don't show
        return (
          <div className="mb-8 px-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-[#C8A252]/10 border border-[#C8A252]/25">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#C8A252] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-white">
                    Plan Free · {usedCount} de 4 análisis usados este mes
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {remaining > 0
                      ? `Te quedan ${remaining} token${remaining !== 1 ? 's' : ''} gratuitos para desbloquear partidos.`
                      : `Has alcanzado el límite mensual.`}
                  </p>
                </div>
              </div>
              <Link
                href="/register"
                className="shrink-0 px-4 py-2 rounded-full bg-[#C8A252] text-[#0D1117] text-xs font-black uppercase tracking-widest hover:bg-[#d4b06a] transition-all whitespace-nowrap"
              >
                Activar Pro →
              </Link>
            </div>
          </div>
        );
      })()}


      {/* ── DASHBOARD ───────────────────────────────────────────────── */}
      <section id="dashboard" className="py-24">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-[#E5E7EB] pb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeSportConfig.flag}</span>
            <h2 className="text-3xl font-editorial font-bold text-[#1A1C1E]">
              Predicciones de Partido —{' '}
              <span className={'text-orange-600'}>
                {activeSportConfig.label}
              </span>
            </h2>
          </div>
        </div>

        {/* Off-season state */}
        {activeSportConfig.isOffSeason ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="badge-off-season inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <span>💤</span>
              <span>Temporada Finalizada</span>
            </div>
            <span className="text-6xl mb-6">{activeSportConfig.flag}</span>
            <h3 className="text-[#1A1C1E] font-editorial text-2xl font-bold mb-3">
              {activeSportConfig.label} en pausa
            </h3>
            <p className="text-[#64748B] font-medium text-base mb-2 max-w-sm">
              La temporada ha finalizado. La IA está recopilando datos de esta temporada
              y preparándose para la siguiente.
            </p>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-8">
              Próxima temporada: Agosto 2026
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">{activeSportConfig.flag}</span>
            <p className="text-[#64748B] font-medium text-lg mb-2">Sin partidos disponibles</p>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
              Los datos se sincronizan periódicamente
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className={'ll-card rounded-[2rem] overflow-hidden relative'}
              >
                <BentoCard key={match.id} className={`flex flex-col h-full ${
                  '!bg-transparent !border-none'
                }`}>
                  {/* LaLiga match header */}
                  {isLaLigaActive ? (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(255,69,0,0.8)' }}>
                        {new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-editorial font-bold text-white">{getEsName(match.homeTeam)} vs {getEsName(match.awayTeam)}</h3>
                        </div>
                        {match.sport && (
                          <span className="text-xs uppercase tracking-wider text-white/50 bg-white/5 px-2 py-1 rounded mt-2 sm:mt-0 self-start sm:self-auto">
                            {match.sport}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mb-1">
                        {new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-editorial font-bold text-[#1A1C1E]">{getEsName(match.homeTeam)} vs {getEsName(match.awayTeam)}</h3>
                        </div>
                        {match.sport && (
                          <span className="text-xs uppercase tracking-wider text-[#63686D] bg-[#F1F4F8] px-2 py-1 rounded mt-2 sm:mt-0 self-start sm:self-auto">
                            {match.sport}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {match.locked ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 mt-4 border-t border-white/5 relative">
                      <div className="w-12 h-12 rounded-full bg-[#C8A252]/10 border border-[#C8A252]/20 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-[#C8A252]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-sm mb-1">Análisis bloqueado</p>
                      
                      {(() => {
                        const rem = Math.max(0, 4 - (user?.free_analyses_used || 0));
                        return rem > 0 ? (
                          <>
                            <p className="text-white/50 text-xs mb-4 text-center max-w-[200px]">Usa 1 de tus {rem} token{rem !== 1 ? 's' : ''} para ver el pronóstico de este partido.</p>
                            <button onClick={() => handleUnlock(match.id)} disabled={isUnlocking === match.id} className="px-5 py-2.5 rounded-full bg-[#C8A252] text-[#0D1117] text-xs font-black uppercase tracking-widest hover:bg-[#d4b06a] transition-all shadow-[0_0_20px_rgba(200,162,82,0.25)] disabled:opacity-50">
                                {isUnlocking === match.id ? 'Desbloqueando...' : 'Desbloquear Gratis'}
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-white/50 text-xs mb-4 text-center max-w-[200px]">Has consumido tus 4 análisis gratuitos este mes.</p>
                            <Link href="/register" className="px-5 py-2.5 rounded-full bg-[#C8A252] text-[#0D1117] text-xs font-black uppercase tracking-widest hover:bg-[#d4b06a] transition-all shadow-[0_0_20px_rgba(200,162,82,0.25)]">
                                Desbloquear con Pro →
                            </Link>
                            <p className="text-white/25 text-[10px] mt-3">Se renueva el 1 de cada mes</p>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      {/* LaLiga probability bar */}
                  {isLaLigaActive && (
                    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="ll-rank-bar absolute left-0 top-0 h-full transition-all duration-1000"
                        style={{ width: `${(match.bestPrediction?.probability ?? 0) * 100}%` }}
                      />
                    </div>
                  )}



                  <div className="mt-auto space-y-4">
                    {(match.bestPrediction ? [match.bestPrediction] : []).map((pick, pi) => (
                      <div key={pi} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            'text-orange-400/80'
                          }`}>{pick.market}</span>
                          <span className={`text-xs font-bold ${
                            'text-orange-400'
                          }`}>
                            {((pick.probability ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                          <div className={`text-base md:text-lg font-editorial font-bold pr-2 ${
                            'text-white'
                          }`}>
                            {pick.label}
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
                            {match.justification && (
                              <button
                                onClick={() => setActiveAnalysisMatch(match)}
                                className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                                  'border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                Análisis IA
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                    </>
                  )}
                </BentoCard>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ANALYSIS MODAL ───────────────────────────────────────────────── */}
      {activeAnalysisMatch && (
        <AnalysisModal
          homeTeam={getEsName(activeAnalysisMatch.homeTeam)}
          awayTeam={getEsName(activeAnalysisMatch.awayTeam)}
          justification={activeAnalysisMatch.justification || ''}
          onClose={() => setActiveAnalysisMatch(null)}
        />
      )}
    </>
  );
}

import React, { useMemo, useState, useCallback } from 'react';
import {
  JornadaQuinielaData,
  StrategyType,
  ReductionConfig,
  QuinielaTicketPick,
  PlenoSelection,
  Sign1X2
} from '../../types/quiniela';
import {
  JornadaStrategyComparison,
  MatchStrategyPrediction,
  generateStrategyComparison
} from '../../services/quinielaEngine';
import { STRATEGIES_LIST } from '../../services/quinielaData';
import {
  Copy,
  CheckCheck,
  Sparkles,
  TrendingUp,
  Minus,
  AlertTriangle,
  Target
} from 'lucide-react';

interface Props {
  jornadaData: JornadaQuinielaData;
  reduction: ReductionConfig;
  selectedStrategy: StrategyType;
  basePicks: QuinielaTicketPick[];
  plenoPick: PlenoSelection;
  generatedBets: Sign1X2[][];
}

const STRATEGY_SHORT: Record<StrategyType, string> = {
  conservative: 'Cons.',
  balanced: 'Bal.',
  draw_specialist: 'Emp.',
  poisson_dixon: 'Poi.',
  expected_value: 'EV+'
};

const SIGN_COLORS: Record<Sign1X2, string> = {
  '1': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'X': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '2': 'bg-purple-500/20 text-purple-300 border-purple-500/30'
};

const CONFIDENCE_CONFIG = {
  high: { label: 'Alta', icon: TrendingUp, class: 'text-emerald-400', dot: 'bg-emerald-400' },
  medium: { label: 'Media', icon: Minus, class: 'text-amber-400', dot: 'bg-amber-400' },
  low: { label: 'Baja', icon: AlertTriangle, class: 'text-rose-400', dot: 'bg-rose-400' }
};

export const QuinielaBetPredictionPanel: React.FC<Props> = ({
  jornadaData,
  reduction,
  selectedStrategy,
  basePicks,
  plenoPick,
  generatedBets: _generatedBets
}) => {
  const [copied, setCopied] = useState(false);
  const [showAllStrategies, setShowAllStrategies] = useState(true);

  const comparison = useMemo<JornadaStrategyComparison>(
    () => generateStrategyComparison(jornadaData, reduction),
    [jornadaData, reduction]
  );

  const strategies: StrategyType[] = [
    'conservative', 'balanced', 'draw_specialist', 'poisson_dixon', 'expected_value'
  ];

  const betString = useMemo(() => {
    const signs = basePicks.slice(0, 14).map(p => p.selectedSigns.join('/'));
    return signs.join(' - ') + ` | P15: ${plenoPick.home}-${plenoPick.away}`;
  }, [basePicks, plenoPick]);

  const simpleBetString = useMemo(() => {
    return basePicks.slice(0, 14).map(p => p.selectedSigns[0]).join('-') + `-P15:${plenoPick.home}${plenoPick.away}`;
  }, [basePicks, plenoPick]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `Quiniela Jornada ${jornadaData.jornadaNumber} · ${selectedStrategy.toUpperCase()}\n${betString}\n\nReduccion: ${reduction.name} (${reduction.apuestas} apuestas · ${reduction.coste.toFixed(2)} EUR)\nGarantia: ${reduction.garantia}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(betString);
    }
  }, [betString, jornadaData.jornadaNumber, selectedStrategy, reduction]);

  const selectedStrategyInfo = STRATEGIES_LIST.find(s => s.id === selectedStrategy);
  const highConfidenceMatches = comparison.matches.filter(m => m.confidence === 'high');
  const lowConfidenceMatches = comparison.matches.filter(m => m.confidence === 'low');

  return (
    <div className="space-y-5">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Modo Prediccion · Jornada {jornadaData.jornadaNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {jornadaData.dateRange}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Apuesta Generada: {selectedStrategyInfo?.name}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Pronostico basado en xG, forma reciente y el modelo <strong className="text-slate-200">{selectedStrategyInfo?.name}</strong>.
              La tabla de consenso muestra en que partidos coinciden varias estrategias.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 shadow-lg active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
            }`}
          >
            {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar Apuesta'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-lg font-black text-emerald-400">{highConfidenceMatches.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Alta confianza</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-lg font-black text-amber-400">{comparison.matches.filter(m => m.confidence === 'medium').length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Media confianza</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-lg font-black text-rose-400">{lowConfidenceMatches.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Baja confianza</div>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold text-white">Tabla de Consenso — 5 Estrategias × 14 Partidos</span>
          </div>
          <button
            onClick={() => setShowAllStrategies(prev => !prev)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg bg-slate-800/60"
          >
            {showAllStrategies ? 'Compactar' : 'Expandir estrategias'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40">
                <th className="text-left px-3 py-2.5 text-slate-400 font-semibold w-6">#</th>
                <th className="text-left px-2 py-2.5 text-slate-400 font-semibold min-w-[160px]">Partido</th>
                <th className="text-center px-2 py-2.5 text-slate-400 font-semibold">1·X·2</th>
                {showAllStrategies && strategies.map(st => (
                  <th
                    key={st}
                    className={`text-center px-2 py-2.5 font-bold ${st === selectedStrategy ? 'text-sky-300' : 'text-slate-500'}`}
                  >
                    {STRATEGY_SHORT[st]}
                    {st === selectedStrategy && <span className="block text-[9px] text-sky-400 font-normal">activa</span>}
                  </th>
                ))}
                <th className="text-center px-2 py-2.5 text-slate-300 font-bold">Consenso</th>
                <th className="text-center px-2 py-2.5 text-slate-300 font-bold">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparison.matches.map((m: MatchStrategyPrediction) => {
                const conf = CONFIDENCE_CONFIG[m.confidence];
                const activePick = basePicks.find(p => p.matchOrder === m.matchOrder);
                const activeSigns = activePick?.selectedSigns ?? [];

                return (
                  <tr
                    key={m.matchOrder}
                    className={`transition-colors ${
                      m.confidence === 'high' ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                        : m.confidence === 'low' ? 'bg-rose-950/5 hover:bg-rose-950/10'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-slate-500 font-bold">{m.matchOrder}</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-200 truncate max-w-[150px]">{m.homeTeam}</span>
                        <span className="text-slate-500 text-[10px]">vs {m.awayTeam}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-0.5 font-mono text-[10px] justify-center">
                        <span className={m.probabilities.p1 >= 50 ? 'text-sky-300 font-bold' : 'text-slate-500'}>{m.probabilities.p1}</span>
                        <span className="text-slate-700">·</span>
                        <span className={m.probabilities.px >= 33 ? 'text-amber-300 font-bold' : 'text-slate-500'}>{m.probabilities.px}</span>
                        <span className="text-slate-700">·</span>
                        <span className={m.probabilities.p2 >= 40 ? 'text-purple-300 font-bold' : 'text-slate-500'}>{m.probabilities.p2}</span>
                      </div>
                    </td>
                    {showAllStrategies && strategies.map(st => {
                      const sign = m.predictions[st];
                      const isActive = st === selectedStrategy;
                      return (
                        <td key={st} className="px-2 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${
                            isActive
                              ? sign === '1' ? 'bg-sky-500/30 text-sky-200 border-sky-500/50 shadow-sm shadow-sky-500/20'
                                : sign === 'X' ? 'bg-amber-500/30 text-amber-200 border-amber-500/50'
                                : 'bg-purple-500/30 text-purple-200 border-purple-500/50'
                              : SIGN_COLORS[sign]
                          } ${isActive ? 'ring-1 ring-sky-400/40' : ''}`}>
                            {sign}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2.5 text-center">
                      {m.consensusSign ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black border-2 ${
                            m.consensusSign === '1' ? 'bg-sky-500/25 text-sky-200 border-sky-500/60'
                              : m.consensusSign === 'X' ? 'bg-amber-500/25 text-amber-200 border-amber-500/60'
                              : 'bg-purple-500/25 text-purple-200 border-purple-500/60'
                          }`}>
                            {m.consensusSign}
                          </span>
                          <span className="text-[9px] text-slate-500">{m.consensusCount}/5</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs text-slate-600 border border-dashed border-slate-700">—</span>
                          <span className="text-[9px] text-slate-600">dividido</span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                        <span className={`text-[10px] font-semibold ${conf.class}`}>{conf.label}</span>
                      </div>
                      {activeSigns.length > 1 && (
                        <div className="flex gap-0.5 justify-center mt-1">
                          {activeSigns.map(s => (
                            <span key={s} className={`text-[9px] font-bold px-1 rounded ${SIGN_COLORS[s]}`}>{s}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pleno al 15 */}
        <div className="border-t-2 border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400">P15</span>
              Pleno al 15:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {strategies.map(st => {
                const pp = comparison.plenoPredictions[st];
                const isActive = st === selectedStrategy;
                return (
                  <div key={st} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                    isActive ? 'bg-sky-500/15 border-sky-500/40 text-sky-200' : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}>
                    <span className={`font-bold ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>{STRATEGY_SHORT[st]}</span>
                    <span className="font-mono font-black text-amber-300">{pp.home}-{pp.away}</span>
                  </div>
                );
              })}
              <div className="text-[11px] text-slate-500">
                Tu pick: <span className="font-mono font-bold text-amber-300">{plenoPick.home}-{plenoPick.away}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bet Summary Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <Copy className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">Tu Apuesta Final — Lista para Jugar</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Visual ticket */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] text-slate-400 mb-3 font-semibold uppercase tracking-wide">
              Estrategia: {selectedStrategyInfo?.name} · {reduction.name}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {basePicks.slice(0, 14).map((pick, idx) => {
                const signs = pick.selectedSigns;
                return (
                  <div key={idx} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-slate-600 font-mono">{idx + 1}</span>
                    <div className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg border ${
                      pick.isTriple ? 'bg-purple-500/15 border-purple-500/30'
                        : pick.isDouble ? 'bg-sky-500/15 border-sky-500/30'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}>
                      {signs.map((s, si) => (
                        <React.Fragment key={si}>
                          <span className={`text-xs font-black ${s === '1' ? 'text-sky-300' : s === 'X' ? 'text-amber-300' : 'text-purple-300'}`}>{s}</span>
                          {si < signs.length - 1 && <span className="text-slate-600 text-[10px]">/</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-amber-500/70 font-mono">P15</span>
                <div className="flex items-center px-1.5 py-1 rounded-lg border bg-amber-500/10 border-amber-500/30">
                  <span className="text-xs font-black text-amber-300">{plenoPick.home}-{plenoPick.away}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyable string */}
          <div className="bg-slate-950/60 border border-slate-700/50 rounded-xl p-3 font-mono text-xs text-slate-300 break-all leading-relaxed select-all">
            {simpleBetString}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                copied
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
              }`}
            >
              {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Copiar apuesta completa'}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
              <span>Coste:</span>
              <span className="font-black text-rose-400">{reduction.coste.toFixed(2)} EUR</span>
              <span className="text-slate-600">·</span>
              <span>{reduction.apuestas} apuestas</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-semibold">Garantia {reduction.garantia}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
            <span className="font-semibold text-slate-400">Confianza:</span>
            {(['high', 'medium', 'low'] as const).map(lvl => {
              const c = CONFIDENCE_CONFIG[lvl];
              return (
                <span key={lvl} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className={c.class}>{c.label}</span>
                  <span>= {lvl === 'high' ? '>=4 estrategias coinciden' : lvl === 'medium' ? '3 coinciden o prob >=40%' : 'divergencia alta'}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  JornadaQuinielaData,
  StrategyType,
  ReductionConfig,
  QuinielaTicketPick,
  QuinielaTicket as QuinielaTicketType,
  PlenoSelection,
  Sign1X2,
  PlenoScore,
  BacktestResult
} from '../../types/quiniela';
import {
  getAllQuinielaJornadas,
  getJornadaQuiniela,
  STRATEGIES_LIST,
  OFFICIAL_REDUCTIONS
} from '../../services/quinielaData';
import {
  generateStrategyPicks,
  generateBetsFromReduction,
  createReductionForBudget,
  evaluateBacktest,
  calculateStrategiesAccumulatedPerformance
} from '../../services/quinielaEngine';
import { QuinielaTicket } from './QuinielaTicket';
import { QuinielaResultsModal } from './QuinielaResultsModal';
import { QuinielaBetsModal } from './QuinielaBetsModal';
import { QuinielaBetPredictionPanel } from './QuinielaBetPredictionPanel';
import {
  Trophy,
  Sliders,
  ShieldCheck,
  RotateCcw,
  Layers,
  Wifi,
  WifiOff,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { fetchJornadas, fetchJornada, fetchAllJornadasFull, isBackendOnline, JornadaInfo } from '../../services/apiService';



export const QuinielaView: React.FC = () => {
  // Static fallback data
  const staticJornadas = useMemo(() => getAllQuinielaJornadas(), []);

  // Live data state
  const [liveJornadas, setLiveJornadas] = useState<JornadaInfo[] | null>(null);
  const [allLiveJornadas, setAllLiveJornadas] = useState<JornadaQuinielaData[] | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loadingJornada, setLoadingJornada] = useState(false);
  const [liveJornadaData, setLiveJornadaData] = useState<JornadaQuinielaData | null>(null);

  // Active full collection of jornadas (live if available, else static)
  const activeJornadasCollection = useMemo(() => {
    return (allLiveJornadas && allLiveJornadas.length > 0) ? allLiveJornadas : staticJornadas;
  }, [allLiveJornadas, staticJornadas]);

  // Available jornadas for the buttons list
  const availableJornadasList = useMemo(() => {
    if (liveJornadas && liveJornadas.length > 0) {
      return liveJornadas;
    }
    return staticJornadas.map(j => ({
      jornadaNumber: j.jornadaNumber,
      season: j.season,
      title: j.title,
      dateRange: j.dateRange,
      isCompleted: j.isCompleted,
    }));
  }, [liveJornadas, staticJornadas]);

  // State
  const [selectedJornadaNumber, setSelectedJornadaNumber] = useState<number>(12);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('balanced');
  const [currentReduction, setCurrentReduction] = useState<ReductionConfig>(OFFICIAL_REDUCTIONS[1]);
  const [budgetEur, setBudgetEur] = useState<number>(12.00);

  // Ticket Picks State
  const [basePicks, setBasePicks] = useState<QuinielaTicketPick[]>([]);
  const [plenoPick, setPlenoPick] = useState<PlenoSelection>({ home: '2', away: '1' });
  const [generatedBets, setGeneratedBets] = useState<Sign1X2[][]>([]);

  // Backtest / Simulation State
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [isBetsModalOpen, setIsBetsModalOpen] = useState<boolean>(false);

  // Calculate accumulated profit and performance for each strategy with the current reduction across all completed matchdays
  const strategiesPerformance = useMemo(() => {
    return calculateStrategiesAccumulatedPerformance(activeJornadasCollection, currentReduction);
  }, [activeJornadasCollection, currentReduction]);

  // Quick evaluation map of all jornadas for the current strategy & reduction
  const jornadasStatusMap = useMemo(() => {
    const map = new Map<number, { hits: number; won: number; profit: number; isProfitable: boolean }>();
    for (const j of activeJornadasCollection) {
      if (!j.isCompleted || !j.scrutiny) continue;
      const { picks, plenoPick } = generateStrategyPicks(j.matches, selectedStrategy, currentReduction);
      const bets = generateBetsFromReduction(picks, currentReduction);
      const ticket = {
        jornadaNumber: j.jornadaNumber,
        strategy: selectedStrategy,
        reduction: currentReduction,
        basePicks: picks,
        generatedBets: bets,
        plenoBet: plenoPick,
        totalBets: bets.length,
        totalCost: currentReduction.coste
      };
      const res = evaluateBacktest(ticket, j);
      if (res) {
        map.set(j.jornadaNumber, {
          hits: res.bestHits,
          won: res.totalWon,
          profit: res.netProfit,
          isProfitable: res.netProfit > 0
        });
      }
    }
    return map;
  }, [activeJornadasCollection, selectedStrategy, currentReduction]);

  // Check backend availability on mount and load jornada list + all full data
  useEffect(() => {
    isBackendOnline().then(online => {
      setBackendOnline(online);
      if (online) {
        fetchJornadas()
          .then(list => {
            setLiveJornadas(list);
            if (list.length > 0) {
              // Auto-select the first upcoming (non-completed) jornada, or last one
              const nextUpcoming = list.find(item => !item.isCompleted);
              setSelectedJornadaNumber(
                nextUpcoming ? nextUpcoming.jornadaNumber : list[list.length - 1].jornadaNumber
              );
            }
          })
          .catch(err => console.warn('Could not fetch live jornadas list:', err));

        fetchAllJornadasFull()
          .then(fullList => setAllLiveJornadas(fullList))
          .catch(err => console.warn('Could not fetch all live full jornadas:', err));
      } else {
        // Static fallback: auto-select the first upcoming (non-completed) jornada
        const nextUpcomingStatic = staticJornadas.find(j => !j.isCompleted);
        if (nextUpcomingStatic) {
          setSelectedJornadaNumber(nextUpcomingStatic.jornadaNumber);
        }
      }
    });
  }, [staticJornadas]);


  // Fetch live jornada data when matchday selection changes
  useEffect(() => {
    if (!backendOnline) return;
    setLoadingJornada(true);
    fetchJornada(selectedJornadaNumber)
      .then(data => setLiveJornadaData(data))
      .catch(err => {
        console.warn('Live fetch failed, falling back to static:', err);
        setLiveJornadaData(null);
      })
      .finally(() => setLoadingJornada(false));
  }, [selectedJornadaNumber, backendOnline]);

  // Active Jornada Data — prefer live, fall back to static
  const currentJornadaData = useMemo<JornadaQuinielaData>(() => {
    if (liveJornadaData && liveJornadaData.jornadaNumber === selectedJornadaNumber) {
      return liveJornadaData;
    }
    return getJornadaQuiniela(selectedJornadaNumber) || staticJornadas[0];
  }, [selectedJornadaNumber, liveJornadaData, staticJornadas]);

  // Re-generate ticket whenever Jornada, Strategy or Reduction changes
  const regenerateTicket = useCallback((
    jData: JornadaQuinielaData,
    strat: StrategyType,
    reduc: ReductionConfig
  ) => {
    const { picks, plenoPick: initialPleno } = generateStrategyPicks(jData.matches, strat, reduc);
    setBasePicks(picks);
    setPlenoPick(initialPleno);
    const bets = generateBetsFromReduction(picks, reduc);
    setGeneratedBets(bets);
    setBacktestResult(null);
  }, []);

  useEffect(() => {
    if (!loadingJornada) {
      regenerateTicket(currentJornadaData, selectedStrategy, currentReduction);
    }
  }, [currentJornadaData, selectedStrategy, currentReduction, regenerateTicket, loadingJornada]);

  // Handle Manual Sign Toggle
  const handleToggleSign = (matchOrder: number, sign: Sign1X2) => {
    setBasePicks(prev => {
      const next = prev.map(pick => {
        if (pick.matchOrder !== matchOrder) return pick;

        const currentSigns = pick.selectedSigns;
        let newSigns: Sign1X2[];

        if (currentSigns.includes(sign)) {
          // Cannot remove if it's the only sign
          if (currentSigns.length <= 1) return pick;
          newSigns = currentSigns.filter(s => s !== sign);
        } else {
          newSigns = [...currentSigns, sign];
        }

        const isTriple = newSigns.length === 3;
        const isDouble = newSigns.length === 2;
        const isSingle = newSigns.length === 1;

        return {
          ...pick,
          selectedSigns: newSigns,
          isTriple,
          isDouble,
          isSingle
        };
      });

      // Recalculate bets with modified picks
      const bets = generateBetsFromReduction(next, currentReduction);
      setGeneratedBets(bets);
      setBacktestResult(null);
      return next;
    });
  };

  // Handle Pleno al 15 Change
  const handleSelectPleno = (team: 'home' | 'away', score: PlenoScore) => {
    setPlenoPick(prev => {
      const updated = {
        ...prev,
        [team]: score
      };
      setBacktestResult(null);
      return updated;
    });
  };

  // Handle Official Preset Selection
  const handleSelectOfficialReduction = (red: ReductionConfig) => {
    setCurrentReduction(red);
    setBudgetEur(red.coste);
  };

  // Handle Budget Slider Change
  const handleBudgetSlider = (newBudget: number) => {
    setBudgetEur(newBudget);
    const optimized = createReductionForBudget(newBudget);
    setCurrentReduction(optimized);
  };

  // Run Backtest / Simulation
  const handleSimulateScrutiny = () => {
    if (!currentJornadaData.isCompleted) return;

    const fullTicket: QuinielaTicketType = {
      jornadaNumber: currentJornadaData.jornadaNumber,
      strategy: selectedStrategy,
      reduction: currentReduction,
      basePicks,
      generatedBets,
      plenoBet: plenoPick,
      totalBets: generatedBets.length,
      totalCost: currentReduction.coste
    };

    const res = evaluateBacktest(fullTicket, currentJornadaData);
    if (res) {
      setBacktestResult(res);
      setIsResultsModalOpen(true);
    }
  };

  const fullTicketObj: QuinielaTicketType = {
    jornadaNumber: currentJornadaData.jornadaNumber,
    strategy: selectedStrategy,
    reduction: currentReduction,
    basePicks,
    generatedBets,
    plenoBet: plenoPick,
    totalBets: generatedBets.length,
    totalCost: currentReduction.coste
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-fade-in">

      {/* Live data status banner */}
      {backendOnline !== null && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border w-fit
          ${backendOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
          {backendOnline
            ? <><Wifi className="w-3.5 h-3.5" /><span>Datos reales en vivo · Temporada 2026/27 (LaLiga + Segunda)</span></>
            : <><WifiOff className="w-3.5 h-3.5" /><span>Datos de muestra · Arranca el backend para datos reales</span></>
          }
          {loadingJornada && <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />}
        </div>
      )}

      {/* Top Banner / Heading */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/20 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">

                Motor de Inteligencia & Reducidas
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Solo Liga de este año
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Boleto Reducido de Quiniela con Backtesting Histórico
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Selecciona cualquier jornada de LaLiga, ajusta tu presupuesto y estrategia para generar un boleto matemáticamente optimizado, y simula en segundos los premios oficiales que habrías conseguido con el escrutinio real.
            </p>
          </div>

          {/* Quick Action Button */}
          {currentJornadaData.isCompleted && (
            <button
              onClick={handleSimulateScrutiny}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-rose-400 transition-all flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Simular Escrutinio Real</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Selector de Jornadas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            1. Seleccionar Jornada de LaLiga
          </span>
          <span className="text-[11px] text-slate-500">
            {availableJornadasList.length} jornadas disponibles
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {availableJornadasList.map(j => {
            const isSelected = j.jornadaNumber === selectedJornadaNumber;
            return (
              <button
                key={j.jornadaNumber}
                onClick={() => setSelectedJornadaNumber(j.jornadaNumber)}
                className={`px-3.5 py-2.5 rounded-xl text-left transition-all border flex-shrink-0 min-w-[130px] ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/15'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs">Jornada {j.jornadaNumber}</span>
                  {j.isCompleted ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Finalizada con premios"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="En juego"></span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {j.dateRange}
                </div>

                {/* Pre-evaluation badge for currently selected strategy */}
                {jornadasStatusMap.has(j.jornadaNumber) && (() => {
                  const st = jornadasStatusMap.get(j.jornadaNumber)!;
                  if (st.isProfitable) {
                    return (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                          {st.hits} ac. (+{st.profit.toFixed(0)}€)
                        </span>
                      </div>
                    );
                  }
                  if (st.hits === 10) {
                    return (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          10 ac. ({st.won.toFixed(1)}€)
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-1.5">
                      <span className="text-[9px] font-medium text-slate-500">
                        {st.hits} aciertos (0€)
                      </span>
                    </div>
                  );
                })()}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector de Estrategia */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            2. Seleccionar Estrategia Algorítmica
          </span>
          <span className="text-[11px] text-slate-500">
            Basada en resultados y rendimiento previo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {STRATEGIES_LIST.map(st => {
            const isSelected = st.id === selectedStrategy;
            const perf = strategiesPerformance[st.id];

            return (
              <div
                key={st.id}
                onClick={() => setSelectedStrategy(st.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">
                      {st.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      st.riskLevel === 'Bajo'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : st.riskLevel === 'Medio'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {st.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {st.description}
                  </p>
                </div>

                {/* Ganancias Acumuladas & Métricas */}
                {perf && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Ganancia acum.:
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded ${
                        perf.netProfit > 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : perf.netProfit < 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {perf.netProfit > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : perf.netProfit < 0 ? (
                          <TrendingDown className="w-3 h-3 text-rose-400" />
                        ) : null}
                        {perf.netProfit > 0 ? `+${perf.netProfit.toFixed(2)} €` : `${perf.netProfit.toFixed(2)} €`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>ROI: <strong className={perf.roiPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{perf.roiPercentage > 0 ? `+${perf.roiPercentage}%` : `${perf.roiPercentage}%`}</strong></span>
                      <span>Media: <strong className="text-slate-200">{perf.avgHits} aciertos</strong></span>
                    </div>

                    <div className="text-[9px] text-slate-500 text-right">
                      Premios: {perf.totalWon.toFixed(2)} € · Invertido: {perf.totalInvested.toFixed(2)} €
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Ajuste de Presupuesto y Reducciones */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              3. Ajustar Presupuesto y Combinaciones Reducidas
            </span>
            <p className="text-[11px] text-slate-400">
              Ahorra hasta un 90% del coste respecto al método directo manteniendo garantías de acierto al 13 o 12.
            </p>
          </div>

          {/* Current Cost Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Coste boleto:</span>
            <span className="text-base font-black text-rose-400">{currentReduction.coste.toFixed(2)} €</span>
            <span className="text-[11px] text-slate-500">({currentReduction.apuestas} ap.)</span>
          </div>
        </div>

        {/* Quick Reduction Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Reducidas Oficiales de Loterías del Estado (SELAE):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {OFFICIAL_REDUCTIONS.map(red => {
              const isSelected = currentReduction.id === red.id;
              return (
                <button
                  key={red.id}
                  onClick={() => handleSelectOfficialReduction(red)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25 border-rose-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black truncate">{red.name.split(' (')[0]}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className={isSelected ? 'text-rose-100' : 'text-rose-400 font-bold'}>
                      {red.coste.toFixed(2)} €
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {red.apuestas} ap.
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Budget Slider */}
        <div className="pt-2 border-t border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Ajustar presupuesto libre:</span>
            <span className="text-rose-400 font-bold">{budgetEur.toFixed(2)} €</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="100.00"
            step="0.75"
            value={budgetEur}
            onChange={(e) => handleBudgetSlider(parseFloat(e.target.value))}
            className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0,75 € (1 ap.)</span>
            <span>25,00 €</span>
            <span>50,00 €</span>
            <span>75,00 €</span>
            <span>100,00 €</span>
          </div>
        </div>

        {/* Reduction Details Alert */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5 text-slate-300">
            <span className="font-bold text-white">
              Garantía Matemática: {currentReduction.garantia}
            </span>
            <p className="text-[11px] text-slate-400">
              {currentReduction.description} Si tus {14 - currentReduction.dobles - currentReduction.triples} fijos y los dobles/triples contienen los resultados reales, aseguras matemáticamente premio de {currentReduction.garantia}.
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => regenerateTicket(currentJornadaData, selectedStrategy, currentReduction)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Recalcular pronósticos según la estrategia y estadísticas previas"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Regenerar Pronóstico</span>
          </button>

          <button
            onClick={() => setIsBetsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver Apuestas Desplegadas ({generatedBets.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentJornadaData.isCompleted ? (
            <button
              onClick={handleSimulateScrutiny}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-400 transition-all flex items-center gap-2 active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>{backtestResult ? 'Ver Resultado Escrutinio' : 'Simular Premios Reales'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Modo predicción — apuesta generada lista abajo</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Ticket Table */}
      <QuinielaTicket
        matches={currentJornadaData.matches}
        picks={basePicks}
        plenoPick={plenoPick}
        onToggleSign={handleToggleSign}
        onSelectPleno={handleSelectPleno}
        backtestResult={backtestResult}
      />

      {/* 5. Prediction Panel — only for upcoming (non-completed) jornadas */}
      {!currentJornadaData.isCompleted && basePicks.length > 0 && (
        <QuinielaBetPredictionPanel
          jornadaData={currentJornadaData}
          reduction={currentReduction}
          selectedStrategy={selectedStrategy}
          basePicks={basePicks}
          plenoPick={plenoPick}
          generatedBets={generatedBets}
        />
      )}

      {/* Modals */}
      {backtestResult && (
        <QuinielaResultsModal
          isOpen={isResultsModalOpen}
          onClose={() => setIsResultsModalOpen(false)}
          result={backtestResult}
          jornadaData={currentJornadaData}
          onOpenBetsModal={() => {
            setIsResultsModalOpen(false);
            setIsBetsModalOpen(true);
          }}
        />
      )}

      <QuinielaBetsModal
        isOpen={isBetsModalOpen}
        onClose={() => setIsBetsModalOpen(false)}
        ticket={fullTicketObj}
        jornadaData={currentJornadaData}
        evaluations={backtestResult?.allEvaluations}
      />
    </div>
  );
};

import React from 'react';
import { BacktestResult, JornadaQuinielaData } from '../../types/quiniela';
import { X, Trophy, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface QuinielaResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BacktestResult;
  jornadaData: JornadaQuinielaData;
  onOpenBetsModal: () => void;
}

export const QuinielaResultsModal: React.FC<QuinielaResultsModalProps> = ({
  isOpen,
  onClose,
  result,
  jornadaData,
  onOpenBetsModal
}) => {
  if (!isOpen) return null;

  const isProfitable = result.netProfit > 0;
  const isBreakEven = result.netProfit === 0;
  const scrutiny = jornadaData.scrutiny;

  const categoryRows = [
    { cat: '15', name: 'Pleno al 15', hits: result.categoryHitsSummary.c15, prize: scrutiny?.categories.p15.prizePerWinner || 0, total: result.categoryPrizesSummary.c15 },
    { cat: '14', name: '14 Aciertos', hits: result.categoryHitsSummary.c14, prize: scrutiny?.categories.p14.prizePerWinner || 0, total: result.categoryPrizesSummary.c14 },
    { cat: '13', name: '13 Aciertos', hits: result.categoryHitsSummary.c13, prize: scrutiny?.categories.p13.prizePerWinner || 0, total: result.categoryPrizesSummary.c13 },
    { cat: '12', name: '12 Aciertos', hits: result.categoryHitsSummary.c12, prize: scrutiny?.categories.p12.prizePerWinner || 0, total: result.categoryPrizesSummary.c12 },
    { cat: '11', name: '11 Aciertos', hits: result.categoryHitsSummary.c11, prize: scrutiny?.categories.p11.prizePerWinner || 0, total: result.categoryPrizesSummary.c11 },
    { cat: '10', name: '10 Aciertos', hits: result.categoryHitsSummary.c10, prize: scrutiny?.categories.p10.prizePerWinner || 0, total: result.categoryPrizesSummary.c10 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isProfitable
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/30'
            : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isProfitable
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Escrutinio Real y Balance de Premios
              </h2>
              <p className="text-xs text-slate-400">
                {jornadaData.title} ({jornadaData.dateRange})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Invertido */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Invertido
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-slate-200">
                  {result.totalInvested.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400">€</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {result.totalBets} apuestas a 0,75€
              </span>
            </div>

            {/* Ganancias Totales */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Premios Cobrados
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-lg sm:text-xl font-black ${
                  result.totalWon > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {result.totalWon.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-slate-400">€</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Suma de categorías premiadas
              </span>
            </div>

            {/* Beneficio Neto */}
            <div className={`rounded-xl p-3 border ${
              isProfitable
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : isBreakEven
                ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Balance Neto
                </span>
                {isProfitable ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black">
                  {result.netProfit > 0 ? `+${result.netProfit.toFixed(2)}` : result.netProfit.toFixed(2)}
                </span>
                <span className="text-xs font-bold">€</span>
              </div>
              <span className="text-[10px] opacity-80 block mt-0.5">
                {isProfitable ? '¡Rentabilidad Positiva!' : 'Pérdida en la jornada'}
              </span>
            </div>

            {/* ROI */}
            <div className={`rounded-xl p-3 border ${
              isProfitable
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/70 border-slate-800 text-slate-400'
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider block">
                Retorno (ROI)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-lg sm:text-xl font-black ${
                  result.roiPercentage > 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {result.roiPercentage > 0 ? `+${result.roiPercentage.toFixed(1)}%` : `${result.roiPercentage.toFixed(1)}%`}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Mejor apuesta: {result.bestHits} aciertos
              </span>
            </div>
          </div>

          {/* Explanation if < 10 hits */}
          {result.bestHits < 10 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
              <span className="text-base select-none">ℹ️</span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300">
                  Sin premios en esta jornada ({result.bestHits} de 14 aciertos)
                </span>
                <p className="text-[11px] text-amber-200/80">
                  La normativa oficial de La Quiniela (SELAE) exige un mínimo de <strong>10 aciertos</strong> para entrar en el reparto de premios. Por eso, cualquier jornada que obtenga 9 o menos aciertos cobra 0,00 €.
                </p>
              </div>
            </div>
          )}

          {/* Official Scrutiny Breakdown Table */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Reparto Oficial de Premios (Loterías y Apuestas)
              </span>
              <span className="text-[10px] text-slate-400">
                Recaudación: {scrutiny?.recaudacion.toLocaleString('es-ES')} €
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {categoryRows.map(row => {
                const hasWonInRow = row.hits > 0;
                return (
                  <div
                    key={row.cat}
                    className={`px-4 py-2 flex items-center justify-between text-xs transition-colors ${
                      hasWonInRow ? 'bg-emerald-950/20 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] ${
                        hasWonInRow ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {row.cat}
                      </span>
                      <span className={hasWonInRow ? 'text-white' : 'text-slate-300'}>
                        {row.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block text-[11px] text-slate-500">
                        Premio oficial: {row.prize > 0 ? `${row.prize.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : 'Bote / 0 €'}
                      </div>
                      <div className="w-16 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          hasWonInRow ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-500'
                        }`}>
                          {row.hits} {row.hits === 1 ? 'acierto' : 'aciertos'}
                        </span>
                      </div>
                      <div className="w-20 text-right font-mono font-bold">
                        <span className={hasWonInRow ? 'text-emerald-400' : 'text-slate-600'}>
                          {row.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Bet Summary Pill */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Mejor Apuesta Simpe de tu Reducción
                </span>
                <span className="text-[11px] text-slate-400">
                  Apuesta #{result.bestBet.betIndex} alcanzó {result.bestHits} de 14 aciertos
                  {result.wonPleno ? ' ¡Y además acertó el Pleno al 15!' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenBetsModal}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold"
            >
              Ver todas ({result.totalBets})
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    </div>
  );
};

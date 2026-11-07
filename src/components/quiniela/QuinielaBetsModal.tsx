import React, { useState } from 'react';
import { BetEvaluationDetail, JornadaQuinielaData, QuinielaTicket } from '../../types/quiniela';
import { X, Copy, Check } from 'lucide-react';

interface QuinielaBetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: QuinielaTicket;
  jornadaData: JornadaQuinielaData;
  evaluations?: BetEvaluationDetail[];
}

export const QuinielaBetsModal: React.FC<QuinielaBetsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  jornadaData,
  evaluations
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    let text = `Boleto Reducido Quiniela - ${jornadaData.title}\n`;
    text += `Estrategia: ${ticket.strategy} | Apuestas: ${ticket.totalBets} (${ticket.totalCost.toFixed(2)} €)\n\n`;

    ticket.generatedBets.forEach((bet, idx) => {
      text += `Apuesta ${idx + 1}: ${bet.join(' ')}\n`;
    });
    text += `Pleno al 15: ${ticket.plenoBet.home} - ${ticket.plenoBet.away}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Desglose de Apuestas Reducidas</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {ticket.totalBets} apuestas
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Desarrollo exacto de las apuestas simples generadas por la matriz de reducción
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copiar apuestas"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bets Grid / Table */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {ticket.generatedBets.map((betSigns, index) => {
            const evalDetail = evaluations?.find(e => e.betIndex === index + 1);
            const hasHits = evalDetail !== undefined;
            const categoryWon = evalDetail?.categoryWon;

            return (
              <div
                key={index}
                className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                  categoryWon
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Bet Index & Hits Badge */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-400 w-16">
                    #{index + 1}
                  </span>
                  {hasHits && (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      categoryWon
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : evalDetail.hitsCount >= 10
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {evalDetail.hitsCount} aciertos
                      {categoryWon ? ` (Premio ${categoryWon})` : ''}
                    </span>
                  )}
                </div>

                {/* 14 Signs Badges */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {betSigns.map((sign, mIdx) => {
                    const isHit = evalDetail?.hitsBreakdown[mIdx];
                    let badgeClass = 'bg-slate-800 text-slate-300';
                    if (hasHits) {
                      badgeClass = isHit
                        ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-500';
                    }

                    return (
                      <div
                        key={mIdx}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${badgeClass}`}
                        title={`Partido ${mIdx + 1}: ${sign}`}
                      >
                        {sign}
                      </div>
                    );
                  })}
                </div>

                {/* Pleno al 15 indicator */}
                <div className="text-[11px] font-mono text-slate-400 flex-shrink-0 text-right">
                  P15: <span className="text-amber-400 font-bold">{ticket.plenoBet.home}-{ticket.plenoBet.away}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Coste total: {ticket.totalCost.toFixed(2)} € ({ticket.totalBets} apuestas)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

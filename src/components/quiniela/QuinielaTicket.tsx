import React from 'react';
import { QuinielaMatch, QuinielaTicketPick, PlenoSelection, Sign1X2, PlenoScore, BacktestResult } from '../../types/quiniela';
import { Check } from 'lucide-react';

interface QuinielaTicketProps {
  matches: QuinielaMatch[];
  picks: QuinielaTicketPick[];
  plenoPick: PlenoSelection;
  onToggleSign: (matchOrder: number, sign: Sign1X2) => void;
  onSelectPleno: (team: 'home' | 'away', score: PlenoScore) => void;
  backtestResult?: BacktestResult | null;
}

export const QuinielaTicket: React.FC<QuinielaTicketProps> = ({
  matches,
  picks,
  plenoPick,
  onToggleSign,
  onSelectPleno,
  backtestResult
}) => {
  const regularMatches = matches.filter(m => !m.isPleno).slice(0, 14);
  const plenoMatch = matches.find(m => m.isPleno) || matches[14];

  const plenoScores: PlenoScore[] = ['0', '1', '2', 'M'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-sm">
            15
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Pronóstico Oficial de la Jornada</h3>
            <p className="text-[11px] text-slate-400">14 partidos 1X2 + Pleno al 15</p>
          </div>
        </div>

        {backtestResult && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              Escrutinio Real: {backtestResult.bestHits} aciertos max.
            </span>
          </div>
        )}
      </div>

      {/* 14 Matches Table */}
      <div className="divide-y divide-slate-800/80">
        {regularMatches.map(match => {
          const pick = picks.find(p => p.matchOrder === match.order);
          const selectedSigns = pick ? pick.selectedSigns : [];
          const isDouble = pick?.isDouble;
          const isTriple = pick?.isTriple;

          // Real outcome check
          const hasRealResult = match.realSign !== undefined;
          const bestBetHit = backtestResult ? backtestResult.bestBet.hitsBreakdown[match.order - 1] : null;

          return (
            <div
              key={match.id}
              className={`px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                hasRealResult && backtestResult
                  ? bestBetHit
                    ? 'bg-emerald-950/15'
                    : 'bg-rose-950/10'
                  : 'hover:bg-slate-800/40'
              }`}
            >
              {/* Match Info & Teams */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-5 text-center text-xs font-bold text-slate-400 select-none">
                  {match.order}
                </span>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Home Team */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate text-right">
                      {match.homeTeam.shortName}
                    </span>
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png';
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-500 px-0.5">-</span>

                  {/* Away Team */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-start">
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo.png';
                      }}
                    />
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate text-left">
                      {match.awayTeam.shortName}
                    </span>
                  </div>
                </div>

                {/* Real Result Badge (if completed) */}
                {match.realScore && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 font-mono text-[11px] font-bold border border-slate-700/60 flex-shrink-0">
                    <span>{match.realScore.home}</span>
                    <span>-</span>
                    <span>{match.realScore.away}</span>
                    <span className="ml-1 px-1 rounded bg-slate-700 text-rose-400 text-[10px]">
                      {match.realSign}
                    </span>
                  </div>
                )}
              </div>

              {/* Probabilities & 1X2 Selector Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                {/* AI Probabilities Bar */}
                <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <span title={`Probabilidad 1: ${match.probabilities.p1}%`} className={match.probabilities.p1 >= 50 ? 'text-amber-400 font-bold' : ''}>
                    1: {match.probabilities.p1}%
                  </span>
                  <span>|</span>
                  <span title={`Probabilidad X: ${match.probabilities.px}%`} className={match.probabilities.px >= 33 ? 'text-amber-400 font-bold' : ''}>
                    X: {match.probabilities.px}%
                  </span>
                  <span>|</span>
                  <span title={`Probabilidad 2: ${match.probabilities.p2}%`} className={match.probabilities.p2 >= 45 ? 'text-amber-400 font-bold' : ''}>
                    2: {match.probabilities.p2}%
                  </span>
                </div>

                {/* Multiple Type Badge */}
                {isTriple && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Triple
                  </span>
                )}
                {isDouble && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Doble
                  </span>
                )}

                {/* 1 X 2 Buttons */}
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                  {(['1', 'X', '2'] as Sign1X2[]).map(sign => {
                    const isSelected = selectedSigns.includes(sign);
                    const isRealMatchSign = match.realSign === sign;
                    const isHit = isSelected && isRealMatchSign;

                    let btnClass = 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60';

                    if (isSelected) {
                      if (backtestResult && hasRealResult) {
                        btnClass = isHit
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 font-black'
                          : 'bg-rose-600/80 text-rose-200 line-through opacity-75';
                      } else {
                        btnClass = isTriple
                          ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30'
                          : isDouble
                          ? 'bg-sky-600 text-white font-black shadow-md shadow-sky-600/30'
                          : 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/30';
                      }
                    } else if (backtestResult && isRealMatchSign) {
                      // Highlight what actually hit if the user missed
                      btnClass = 'border border-dashed border-emerald-500 text-emerald-400 font-bold';
                    }

                    return (
                      <button
                        key={sign}
                        onClick={() => onToggleSign(match.order, sign)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center active:scale-95 ${btnClass}`}
                      >
                        {sign}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Match 15: Pleno al 15 */}
        {plenoMatch && (
          <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 px-3 sm:px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase">
                P15
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <span>{plenoMatch.homeTeam.shortName}</span>
                  <span className="text-slate-500">vs</span>
                  <span>{plenoMatch.awayTeam.shortName}</span>
                </div>
                <p className="text-[10px] text-amber-300/80">Pleno al 15: Pronostica el número exacto de goles (0, 1, 2, M = 3+)</p>
              </div>

              {plenoMatch.realPleno && (
                <div className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                  Real: {plenoMatch.realPleno.home} - {plenoMatch.realPleno.away}
                </div>
              )}
            </div>

            {/* Pleno al 15 Selectors */}
            <div className="flex items-center gap-4">
              {/* Home Goals */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-300 mr-1 truncate max-w-[80px]">
                  {plenoMatch.homeTeam.shortName}:
                </span>
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  {plenoScores.map(score => {
                    const isSelected = plenoPick.home === score;
                    const isHit = plenoMatch.realPleno?.home === score;

                    let btnStyle = isSelected
                      ? backtestResult && plenoMatch.realPleno
                        ? isHit ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-black font-extrabold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white';

                    return (
                      <button
                        key={`home-${score}`}
                        onClick={() => onSelectPleno('home', score)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[11px] font-bold transition-all ${btnStyle}`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Away Goals */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-300 mr-1 truncate max-w-[80px]">
                  {plenoMatch.awayTeam.shortName}:
                </span>
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  {plenoScores.map(score => {
                    const isSelected = plenoPick.away === score;
                    const isHit = plenoMatch.realPleno?.away === score;

                    let btnStyle = isSelected
                      ? backtestResult && plenoMatch.realPleno
                        ? isHit ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-black font-extrabold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white';

                    return (
                      <button
                        key={`away-${score}`}
                        onClick={() => onSelectPleno('away', score)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[11px] font-bold transition-all ${btnStyle}`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

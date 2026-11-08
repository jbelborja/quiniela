import {
  Sign1X2,
  PlenoSelection,
  PlenoScore,
  QuinielaMatch,
  StrategyType,
  ReductionConfig,
  QuinielaTicketPick,
  QuinielaTicket,
  JornadaQuinielaData,
  BacktestResult,
  BetEvaluationDetail,
  StrategyAccumulatedStats
} from '../types/quiniela';
import { OFFICIAL_REDUCTIONS } from './quinielaData';

// -------------------------------------------------------------
// Official Reduction Matrices
// -------------------------------------------------------------

// Reducción 1: 4 Triples al 13 (9 apuestas)
const MATRIX_4T_9: number[][] = [
  [0, 0, 0, 0], // 1 1 1 1
  [0, 1, 1, 1], // 1 X X X
  [0, 2, 2, 2], // 1 2 2 2
  [1, 0, 1, 2], // X 1 X 2
  [1, 1, 2, 0], // X X 2 1
  [1, 2, 0, 1], // X 2 1 X
  [2, 0, 2, 1], // 2 1 2 X
  [2, 1, 0, 2], // 2 X 1 2
  [2, 2, 1, 0]  // 2 2 X 1
];

// Reducción 2: 7 Dobles al 13 (16 apuestas - Hadamard / Hamming dual code)
const MATRIX_7D_16: number[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1],
  [0, 1, 1, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 1, 0],
  [1, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 0],
  [1, 0, 0, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 1, 1],
  [0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0, 0, 1],
  [0, 0, 1, 0, 1, 1, 0]
];

// Reducción 3: 3 Dobles + 3 Triples al 13 (24 apuestas)
// Combina 3 dobles (4 combinaciones) x 3 triples (6 combinaciones) = 24
const MATRIX_3D3T_24: { dobles: number[]; triples: number[] }[] = [];
const D3_BLOCK = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0]
];
const T3_BLOCK = [
  [0, 0, 0],
  [1, 1, 1],
  [2, 2, 2],
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1]
];
for (let d = 0; d < D3_BLOCK.length; d++) {
  for (let t = 0; t < T3_BLOCK.length; t++) {
    MATRIX_3D3T_24.push({
      dobles: D3_BLOCK[d],
      triples: T3_BLOCK[t]
    });
  }
}

// -------------------------------------------------------------
// Strategy Pronostic Engine (evaluates past form & stats)
// -------------------------------------------------------------

export function rankMatchUncertainty(m: QuinielaMatch): number {
  // Higher value = higher uncertainty (ideal for doubles or triples)
  const maxP = Math.max(m.probabilities.p1, m.probabilities.px, m.probabilities.p2);
  return 100 - maxP; // e.g. maxP=38 -> uncertainty 62
}

export function generateStrategyPicks(
  matches: QuinielaMatch[],
  strategy: StrategyType,
  reduction: ReductionConfig
): {
  picks: QuinielaTicketPick[];
  plenoPick: PlenoSelection;
} {
  // 14 regular matches
  const regularMatches = matches.filter(m => !m.isPleno).slice(0, 14);
  const plenoMatch = matches.find(m => m.isPleno) || matches[14];

  // Rank matches by uncertainty to decide where to place triples and dobles
  const sortedByUncertainty = [...regularMatches].sort((a, b) => {
    return rankMatchUncertainty(b) - rankMatchUncertainty(a);
  });

  const tripleMatchesOrders = new Set<number>();
  const doubleMatchesOrders = new Set<number>();

  for (let i = 0; i < reduction.triples && i < sortedByUncertainty.length; i++) {
    tripleMatchesOrders.add(sortedByUncertainty[i].order);
  }

  for (let i = reduction.triples; i < reduction.triples + reduction.dobles && i < sortedByUncertainty.length; i++) {
    doubleMatchesOrders.add(sortedByUncertainty[i].order);
  }

  const picks: QuinielaTicketPick[] = regularMatches.map(m => {
    const isTriple = tripleMatchesOrders.has(m.order);
    const isDouble = doubleMatchesOrders.has(m.order);

    const signs = getSignsForMatch(m, strategy, isTriple, isDouble);

    return {
      matchOrder: m.order,
      selectedSigns: signs,
      isTriple,
      isDouble,
      isSingle: !isTriple && !isDouble
    };
  });

  // Pleno al 15 pick according to strategy and probabilities
  const plenoPick = getPlenoPickForMatch(plenoMatch, strategy);

  return { picks, plenoPick };
}

// -------------------------------------------------------------
// Poisson Bivariate & Dixon-Coles Model
// -------------------------------------------------------------

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poissonPmf(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export interface PoissonDixonResult {
  p1: number;
  px: number;
  p2: number;
  mostProbableScore: { home: number; away: number; prob: number };
  plenoPick: PlenoSelection;
}

export function calculatePoissonDixonProbabilities(m: QuinielaMatch): PoissonDixonResult {
  const homeGoalsAvg = m.stats?.homeGoalsAvg ?? 1.35;
  const awayGoalsAvg = m.stats?.awayGoalsAvg ?? 1.05;

  const lambda = Math.max(0.3, Math.min(4.0, homeGoalsAvg * 1.15));
  const mu = Math.max(0.2, Math.min(3.5, awayGoalsAvg * 0.95));

  // Dixon-Coles low-score correlation adjustment
  const rho = -0.11;

  let sumHomeWin = 0;
  let sumDraw = 0;
  let sumAwayWin = 0;
  let maxScoreProb = -1;
  let bestH = 1;
  let bestA = 0;

  const MAX_GOALS = 6;

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      let tau = 1.0;
      if (h === 0 && a === 0) {
        tau = 1.0 - lambda * mu * rho;
      } else if (h === 0 && a === 1) {
        tau = 1.0 + lambda * rho;
      } else if (h === 1 && a === 0) {
        tau = 1.0 + mu * rho;
      } else if (h === 1 && a === 1) {
        tau = 1.0 - rho;
      }

      const pHome = poissonPmf(h, lambda);
      const pAway = poissonPmf(a, mu);
      const prob = Math.max(0, tau * pHome * pAway);

      if (prob > maxScoreProb) {
        maxScoreProb = prob;
        bestH = h;
        bestA = a;
      }

      if (h > a) sumHomeWin += prob;
      else if (h === a) sumDraw += prob;
      else sumAwayWin += prob;
    }
  }

  const total = sumHomeWin + sumDraw + sumAwayWin || 1.0;
  const p1 = Math.round((sumHomeWin / total) * 100);
  const p2 = Math.round((sumAwayWin / total) * 100);
  const px = Math.max(0, 100 - p1 - p2);

  const toPlenoScore = (score: number): PlenoScore => {
    if (score <= 0) return '0';
    if (score === 1) return '1';
    if (score === 2) return '2';
    return 'M';
  };

  return {
    p1,
    px,
    p2,
    mostProbableScore: { home: bestH, away: bestA, prob: maxScoreProb },
    plenoPick: {
      home: toPlenoScore(bestH),
      away: toPlenoScore(bestA)
    }
  };
}

// -------------------------------------------------------------
// Expected Value (EV+ / Smart Money) Model
// -------------------------------------------------------------

export interface EvAnalysis {
  primary: Sign1X2;
  secondary: Sign1X2;
  evRatios: { sign: Sign1X2; ratio: number; modelP: number; publicP: number }[];
}

export function calculateExpectedValueSigns(m: QuinielaMatch): EvAnalysis {
  const { p1, px, p2 } = m.probabilities;

  // Model the general public betting percentage distribution
  // Public has strong home bias and severe underestimation of draws
  let pub1 = p1 * 1.25;
  let pub2 = p2 * 0.90;
  let pubX = px * 0.80;

  const homeName = m.homeTeam.name.toLowerCase();
  const awayName = m.awayTeam.name.toLowerCase();
  if (homeName.includes('madrid') || homeName.includes('barcelona') || homeName.includes('atletico')) {
    pub1 += 12;
  }
  if (awayName.includes('madrid') || awayName.includes('barcelona') || awayName.includes('atletico')) {
    pub2 += 10;
  }

  const pubTotal = pub1 + pubX + pub2 || 100;
  pub1 = (pub1 / pubTotal) * 100;
  pubX = (pubX / pubTotal) * 100;
  pub2 = (pub2 / pubTotal) * 100;

  // EV Ratio = Model Probability / Public Estimated Probability
  const ev1 = Number((p1 / Math.max(5, pub1)).toFixed(2));
  const evX = Number((px / Math.max(5, pubX)).toFixed(2));
  const ev2 = Number((p2 / Math.max(5, pub2)).toFixed(2));

  const sortedByEv = [
    { sign: '1' as Sign1X2, ratio: ev1, modelP: p1, publicP: pub1 },
    { sign: 'X' as Sign1X2, ratio: evX, modelP: px, publicP: pubX },
    { sign: '2' as Sign1X2, ratio: ev2, modelP: p2, publicP: pub2 }
  ].sort((a, b) => b.ratio - a.ratio);

  // Primary sign: Solid statistical anchor (highest probability)
  const highestP = [
    { sign: '1' as Sign1X2, p: p1 },
    { sign: 'X' as Sign1X2, p: px },
    { sign: '2' as Sign1X2, p: p2 }
  ].sort((a, b) => b.p - a.p)[0].sign;

  const primary = highestP;

  // Secondary sign (for Doubles / Triples): High-EV leverage underdog or draw that market underbets
  const bestEvAlternative = sortedByEv.find(s => s.sign !== primary);
  const secondary = bestEvAlternative ? bestEvAlternative.sign : (primary === '1' ? 'X' : '1');

  return {
    primary,
    secondary,
    evRatios: sortedByEv
  };
}

function getSignsForMatch(
  m: QuinielaMatch,
  strategy: StrategyType,
  isTriple: boolean,
  isDouble: boolean
): Sign1X2[] {
  if (isTriple) {
    return ['1', 'X', '2'];
  }

  const { p1, px, p2 } = m.probabilities;

  // Primary sign based on strategy
  let primary: Sign1X2 = '1';
  let secondary: Sign1X2 = 'X';

  switch (strategy) {
    case 'conservative':
      // Straightforward highest probability
      if (p1 >= px && p1 >= p2) {
        primary = '1';
        secondary = px >= p2 ? 'X' : '2';
      } else if (p2 >= p1 && p2 >= px) {
        primary = '2';
        secondary = px >= p1 ? 'X' : '1';
      } else {
        primary = 'X';
        secondary = p1 >= p2 ? '1' : '2';
      }
      break;

    case 'balanced':
      // Value & momentum: favor home unless away has strong away win form
      if (p1 >= 45) {
        primary = '1';
        secondary = px >= p2 ? 'X' : '2';
      } else if (p2 >= 40) {
        primary = '2';
        secondary = px >= p1 ? 'X' : '1';
      } else {
        // Close game: cover with draw
        primary = p1 >= p2 ? '1' : 'X';
        secondary = primary === '1' ? 'X' : (p1 >= p2 ? '1' : '2');
      }
      break;

    case 'draw_specialist':
      // Prioritize draws on tight matchups
      if (Math.abs(p1 - p2) <= 15 || px >= 33) {
        primary = 'X';
        secondary = p1 >= p2 ? '1' : '2';
      } else if (p1 > p2) {
        primary = '1';
        secondary = 'X';
      } else {
        primary = '2';
        secondary = 'X';
      }
      break;

    case 'poisson_dixon': {
      const pd = calculatePoissonDixonProbabilities(m);
      if (pd.p1 >= pd.px && pd.p1 >= pd.p2) {
        primary = '1';
        secondary = pd.px >= pd.p2 ? 'X' : '2';
      } else if (pd.p2 >= pd.p1 && pd.p2 >= pd.px) {
        primary = '2';
        secondary = pd.px >= pd.p1 ? 'X' : '1';
      } else {
        primary = 'X';
        secondary = pd.p1 >= pd.p2 ? '1' : '2';
      }
      break;
    }

    case 'expected_value': {
      const ev = calculateExpectedValueSigns(m);
      primary = ev.primary;
      secondary = ev.secondary;
      break;
    }
  }

  if (isDouble) {
    // Return primary + secondary, sorted standardly ['1', 'X'] or ['1', '2'] or ['X', '2']
    const set = new Set<Sign1X2>([primary, secondary]);
    const res: Sign1X2[] = [];
    if (set.has('1')) res.push('1');
    if (set.has('X')) res.push('X');
    if (set.has('2')) res.push('2');
    return res;
  }

  return [primary];
}

function getPlenoPickForMatch(m: QuinielaMatch, strategy: StrategyType): PlenoSelection {
  if (strategy === 'poisson_dixon') {
    const pd = calculatePoissonDixonProbabilities(m);
    return pd.plenoPick;
  }

  if (strategy === 'expected_value') {
    const { p1, p2 } = m.probabilities;
    if (p1 >= 55) return { home: '2', away: '1' };
    if (p2 >= 45) return { home: '1', away: '2' };
    return { home: '1', away: '1' };
  }

  const { p1, p2 } = m.probabilities;
  if (p1 >= 60) {
    return { home: '2', away: '0' };
  } else if (p1 >= 45) {
    return { home: '2', away: '1' };
  } else if (p2 >= 45) {
    return { home: '1', away: '2' };
  } else {
    return { home: '1', away: '1' };
  }
}

// -------------------------------------------------------------
// Unfolding / Developing the Reduced Bets into Simple Bets
// -------------------------------------------------------------

export function generateBetsFromReduction(
  basePicks: QuinielaTicketPick[],
  reduction: ReductionConfig
): Sign1X2[][] {
  const tripleIndices: number[] = [];
  const doubleIndices: number[] = [];
  const fixedIndices: number[] = [];

  basePicks.forEach((p, idx) => {
    if (p.isTriple) tripleIndices.push(idx);
    else if (p.isDouble) doubleIndices.push(idx);
    else fixedIndices.push(idx);
  });

  // 1. Official Reduction 1: 4 Triples (9 apuestas)
  if (reduction.id === 'red_4T_13' && tripleIndices.length === 4) {
    return MATRIX_4T_9.map(row => {
      const bet: Sign1X2[] = new Array(14).fill('1');
      fixedIndices.forEach(idx => {
        bet[idx] = basePicks[idx].selectedSigns[0];
      });
      doubleIndices.forEach(idx => {
        bet[idx] = basePicks[idx].selectedSigns[0];
      });
      tripleIndices.forEach((matchIdx, tPos) => {
        const signIdx = row[tPos]; // 0 -> 1, 1 -> X, 2 -> 2
        const signs = basePicks[matchIdx].selectedSigns;
        bet[matchIdx] = signs[signIdx] || '1';
      });
      return bet;
    });
  }

  // 2. Official Reduction 2: 7 Dobles (16 apuestas)
  if (reduction.id === 'red_7D_13' && doubleIndices.length === 7) {
    return MATRIX_7D_16.map(row => {
      const bet: Sign1X2[] = new Array(14).fill('1');
      fixedIndices.forEach(idx => {
        bet[idx] = basePicks[idx].selectedSigns[0];
      });
      tripleIndices.forEach(idx => {
        bet[idx] = basePicks[idx].selectedSigns[0];
      });
      doubleIndices.forEach((matchIdx, dPos) => {
        const bit = row[dPos]; // 0 or 1
        const signs = basePicks[matchIdx].selectedSigns;
        bet[matchIdx] = signs[bit] || signs[0];
      });
      return bet;
    });
  }

  // 3. Official Reduction 3: 3 Dobles + 3 Triples (24 apuestas)
  if (reduction.id === 'red_3D3T_13' && doubleIndices.length === 3 && tripleIndices.length === 3) {
    return MATRIX_3D3T_24.map(combo => {
      const bet: Sign1X2[] = new Array(14).fill('1');
      fixedIndices.forEach(idx => {
        bet[idx] = basePicks[idx].selectedSigns[0];
      });
      doubleIndices.forEach((matchIdx, dPos) => {
        const bit = combo.dobles[dPos];
        const signs = basePicks[matchIdx].selectedSigns;
        bet[matchIdx] = signs[bit] || signs[0];
      });
      tripleIndices.forEach((matchIdx, tPos) => {
        const signIdx = combo.triples[tPos];
        const signs = basePicks[matchIdx].selectedSigns;
        bet[matchIdx] = signs[signIdx] || '1';
      });
      return bet;
    });
  }

  // 4. Fallback / Custom Reduction: Combinatorial covering designed to maximize coverage up to target bets
  const directCombos = generateFullCombinations(basePicks);
  if (directCombos.length <= reduction.apuestas) {
    return directCombos;
  }

  // Sample or reduce evenly to target number of bets
  const step = directCombos.length / reduction.apuestas;
  const reduced: Sign1X2[][] = [];
  for (let i = 0; i < reduction.apuestas; i++) {
    const idx = Math.min(Math.floor(i * step), directCombos.length - 1);
    reduced.push(directCombos[idx]);
  }
  return reduced;
}

function generateFullCombinations(picks: QuinielaTicketPick[]): Sign1X2[][] {
  let results: Sign1X2[][] = [[]];

  for (const pick of picks) {
    const nextResults: Sign1X2[][] = [];
    for (const current of results) {
      for (const sign of pick.selectedSigns) {
        nextResults.push([...current, sign]);
      }
    }
    results = nextResults;
    if (results.length > 5000) break; // safety ceiling
  }

  return results;
}

// -------------------------------------------------------------
// Dynamic Budget Configurator
// -------------------------------------------------------------

export function createReductionForBudget(budgetEur: number): ReductionConfig {
  const betCost = 0.75;
  const maxBets = Math.max(1, Math.floor(budgetEur / betCost));

  // Check if it matches an official preset closely
  const matchingOfficial = OFFICIAL_REDUCTIONS.find(r => r.coste <= budgetEur && r.coste >= budgetEur - 1.5);
  if (matchingOfficial && Math.abs(matchingOfficial.coste - budgetEur) < 0.5) {
    return matchingOfficial;
  }

  // Custom budget optimization: determine best mix of dobles and triples
  let bestTriples = 0;
  let bestDobles = 0;
  let bestBets = 1;

  if (maxBets >= 64) {
    bestTriples = 2;
    bestDobles = 6;
    bestBets = Math.min(maxBets, 64);
  } else if (maxBets >= 24) {
    bestTriples = 3;
    bestDobles = 3;
    bestBets = Math.min(maxBets, 24);
  } else if (maxBets >= 16) {
    bestTriples = 0;
    bestDobles = 7;
    bestBets = 16;
  } else if (maxBets >= 9) {
    bestTriples = 4;
    bestDobles = 0;
    bestBets = 9;
  } else if (maxBets >= 4) {
    bestTriples = 0;
    bestDobles = 2;
    bestBets = 4;
  } else if (maxBets >= 2) {
    bestTriples = 0;
    bestDobles = 1;
    bestBets = 2;
  } else {
    bestTriples = 0;
    bestDobles = 0;
    bestBets = 1;
  }

  const actualCost = Number((bestBets * betCost).toFixed(2));

  return {
    id: 'custom',
    name: `Personalizada (${bestBets} apuestas)`,
    triples: bestTriples,
    dobles: bestDobles,
    apuestas: bestBets,
    coste: actualCost,
    garantia: bestBets >= 9 ? 'Al 13' : 'Directa',
    prob14: Number((100 / Math.pow(2, bestDobles) / Math.pow(3, bestTriples) * bestBets).toFixed(1)),
    description: `Ajuste automático para ${budgetEur.toFixed(2)} €: ${bestBets} apuestas (${bestDobles} dobles, ${bestTriples} triples).`
  };
}

// -------------------------------------------------------------
// Backtesting & Scrutiny Evaluator
// -------------------------------------------------------------

export function evaluateBacktest(
  ticket: QuinielaTicket,
  jornadaData: JornadaQuinielaData
): BacktestResult | null {
  if (!jornadaData.isCompleted || !jornadaData.scrutiny) {
    return null;
  }

  const realSigns = jornadaData.matches.filter(m => !m.isPleno).slice(0, 14).map(m => m.realSign || '1');
  const realPlenoMatch = jornadaData.matches.find(m => m.isPleno) || jornadaData.matches[14];
  const realPleno = realPlenoMatch.realPleno || { home: '0', away: '0' };

  const scrutiny = jornadaData.scrutiny;
  const prizes = scrutiny.categories;

  const categoryHitsSummary = {
    c15: 0,
    c14: 0,
    c13: 0,
    c12: 0,
    c11: 0,
    c10: 0
  };

  const categoryPrizesSummary = {
    c15: 0,
    c14: 0,
    c13: 0,
    c12: 0,
    c11: 0,
    c10: 0
  };

  let bestHits = 0;
  let wonPlenoOverall = false;

  const allEvaluations: BetEvaluationDetail[] = ticket.generatedBets.map((betSigns, betIndex) => {
    let hitsCount = 0;
    const hitsBreakdown: boolean[] = [];

    for (let i = 0; i < 14; i++) {
      const isHit = betSigns[i] === realSigns[i];
      hitsBreakdown.push(isHit);
      if (isHit) hitsCount++;
    }

    const plenoHit = ticket.plenoBet.home === realPleno.home && ticket.plenoBet.away === realPleno.away;

    if (hitsCount > bestHits) {
      bestHits = hitsCount;
    }

    let categoryWon: '15' | '14' | '13' | '12' | '11' | '10' | null = null;
    let prizeAmount = 0;

    if (hitsCount === 14 && plenoHit) {
      categoryWon = '15';
      prizeAmount = prizes.p15.prizePerWinner;
      categoryHitsSummary.c15++;
      categoryPrizesSummary.c15 += prizeAmount;
      wonPlenoOverall = true;
    } else if (hitsCount === 14) {
      categoryWon = '14';
      prizeAmount = prizes.p14.prizePerWinner;
      categoryHitsSummary.c14++;
      categoryPrizesSummary.c14 += prizeAmount;
    } else if (hitsCount === 13) {
      categoryWon = '13';
      prizeAmount = prizes.p13.prizePerWinner;
      categoryHitsSummary.c13++;
      categoryPrizesSummary.c13 += prizeAmount;
    } else if (hitsCount === 12) {
      categoryWon = '12';
      prizeAmount = prizes.p12.prizePerWinner;
      categoryHitsSummary.c12++;
      categoryPrizesSummary.c12 += prizeAmount;
    } else if (hitsCount === 11) {
      categoryWon = '11';
      prizeAmount = prizes.p11.prizePerWinner;
      categoryHitsSummary.c11++;
      categoryPrizesSummary.c11 += prizeAmount;
    } else if (hitsCount === 10) {
      categoryWon = '10';
      prizeAmount = prizes.p10.prizePerWinner;
      categoryHitsSummary.c10++;
      categoryPrizesSummary.c10 += prizeAmount;
    }

    return {
      betIndex: betIndex + 1,
      hitsCount,
      signs: betSigns,
      plenoHit,
      hitsBreakdown,
      categoryWon,
      prizeAmount
    };
  });

  // Sort evaluations to find the best bet
  allEvaluations.sort((a, b) => b.hitsCount - a.hitsCount || b.prizeAmount - a.prizeAmount);
  const bestBet = allEvaluations[0];

  const totalWon = Number(
    (
      categoryPrizesSummary.c15 +
      categoryPrizesSummary.c14 +
      categoryPrizesSummary.c13 +
      categoryPrizesSummary.c12 +
      categoryPrizesSummary.c11 +
      categoryPrizesSummary.c10
    ).toFixed(2)
  );

  const totalInvested = ticket.totalCost;
  const netProfit = Number((totalWon - totalInvested).toFixed(2));
  const roiPercentage = totalInvested > 0 ? Number(((netProfit / totalInvested) * 100).toFixed(1)) : 0;

  return {
    jornadaNumber: jornadaData.jornadaNumber,
    totalInvested,
    totalWon,
    netProfit,
    roiPercentage,
    totalBets: ticket.totalBets,
    bestHits,
    wonPleno: wonPlenoOverall,
    categoryHitsSummary,
    categoryPrizesSummary,
    bestBet,
    allEvaluations
  };
}

// -------------------------------------------------------------
// Strategy Accumulated Performance Tracker
// -------------------------------------------------------------

export function calculateStrategiesAccumulatedPerformance(
  jornadas: JornadaQuinielaData[],
  reduction: ReductionConfig
): Record<StrategyType, StrategyAccumulatedStats> {
  const completedJornadas = jornadas.filter(j => j.isCompleted && j.scrutiny);
  const strategies: StrategyType[] = [
    'conservative',
    'balanced',
    'draw_specialist',
    'poisson_dixon',
    'expected_value'
  ];

  const statsMap: Record<StrategyType, StrategyAccumulatedStats> = {
    conservative: {
      strategyId: 'conservative',
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roiPercentage: 0,
      avgHits: 0,
      completedJornadasCount: completedJornadas.length
    },
    balanced: {
      strategyId: 'balanced',
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roiPercentage: 0,
      avgHits: 0,
      completedJornadasCount: completedJornadas.length
    },
    draw_specialist: {
      strategyId: 'draw_specialist',
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roiPercentage: 0,
      avgHits: 0,
      completedJornadasCount: completedJornadas.length
    },
    poisson_dixon: {
      strategyId: 'poisson_dixon',
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roiPercentage: 0,
      avgHits: 0,
      completedJornadasCount: completedJornadas.length
    },
    expected_value: {
      strategyId: 'expected_value',
      totalInvested: 0,
      totalWon: 0,
      netProfit: 0,
      roiPercentage: 0,
      avgHits: 0,
      completedJornadasCount: completedJornadas.length
    }
  };

  if (completedJornadas.length === 0) {
    return statsMap;
  }

  for (const st of strategies) {
    let sumHits = 0;
    for (const j of completedJornadas) {
      const { picks, plenoPick } = generateStrategyPicks(j.matches, st, reduction);
      const bets = generateBetsFromReduction(picks, reduction);
      const ticket: QuinielaTicket = {
        jornadaNumber: j.jornadaNumber,
        strategy: st,
        reduction,
        basePicks: picks,
        generatedBets: bets,
        plenoBet: plenoPick,
        totalBets: bets.length,
        totalCost: reduction.coste
      };

      const evalRes = evaluateBacktest(ticket, j);
      if (evalRes) {
        statsMap[st].totalInvested += evalRes.totalInvested;
        statsMap[st].totalWon += evalRes.totalWon;
        statsMap[st].netProfit += evalRes.netProfit;
        sumHits += evalRes.bestHits;
      }
    }

    statsMap[st].totalInvested = Number(statsMap[st].totalInvested.toFixed(2));
    statsMap[st].totalWon = Number(statsMap[st].totalWon.toFixed(2));
    statsMap[st].netProfit = Number(statsMap[st].netProfit.toFixed(2));
    statsMap[st].avgHits = Number((sumHits / completedJornadas.length).toFixed(1));
    statsMap[st].roiPercentage = statsMap[st].totalInvested > 0
      ? Number(((statsMap[st].netProfit / statsMap[st].totalInvested) * 100).toFixed(1))
      : 0;
  }

  return statsMap;
}

// -------------------------------------------------------------
// Strategy Comparison for Upcoming Jornada Prediction
// -------------------------------------------------------------

export interface MatchStrategyPrediction {
  matchOrder: number;
  homeTeam: string;
  awayTeam: string;
  probabilities: { p1: number; px: number; p2: number };
  predictions: Record<StrategyType, Sign1X2>; // primary sign per strategy
  consensusSign: Sign1X2 | null; // sign that >= 3 strategies agree on
  consensusCount: number; // how many strategies agree
  confidence: 'high' | 'medium' | 'low';
}

export interface JornadaStrategyComparison {
  jornadaNumber: number;
  matches: MatchStrategyPrediction[];
  plenoPredictions: Record<StrategyType, { home: string; away: string }>;
}

export function generateStrategyComparison(
  jornadaData: JornadaQuinielaData,
  reduction: ReductionConfig
): JornadaStrategyComparison {
  const strategies: StrategyType[] = [
    'conservative',
    'balanced',
    'draw_specialist',
    'poisson_dixon',
    'expected_value'
  ];

  const regularMatches = jornadaData.matches.filter(m => !m.isPleno).slice(0, 14);

  // Get picks per strategy
  const strategyPicksMap: Record<StrategyType, { picks: QuinielaTicketPick[]; plenoPick: { home: string; away: string } }> = {} as never;
  for (const st of strategies) {
    const { picks, plenoPick } = generateStrategyPicks(jornadaData.matches, st, reduction);
    strategyPicksMap[st] = { picks, plenoPick };
  }

  const matchPredictions: MatchStrategyPrediction[] = regularMatches.map(match => {
    const predictions: Record<StrategyType, Sign1X2> = {} as never;

    for (const st of strategies) {
      const pick = strategyPicksMap[st].picks.find(p => p.matchOrder === match.order);
      // Use the first (primary) sign for comparison
      predictions[st] = pick?.selectedSigns[0] ?? '1';
    }

    // Count sign frequencies
    const counts: Record<Sign1X2, number> = { '1': 0, 'X': 0, '2': 0 };
    for (const st of strategies) {
      counts[predictions[st]]++;
    }

    const sortedSigns = (['1', 'X', '2'] as Sign1X2[]).sort((a, b) => counts[b] - counts[a]);
    const topSign = sortedSigns[0];
    const topCount = counts[topSign];

    const consensusSign: Sign1X2 | null = topCount >= 3 ? topSign : null;
    const consensusCount = topCount;

    const maxProb = Math.max(match.probabilities.p1, match.probabilities.px, match.probabilities.p2);
    let confidence: 'high' | 'medium' | 'low';
    if (topCount >= 4 && maxProb >= 45) {
      confidence = 'high';
    } else if (topCount >= 3 || maxProb >= 40) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      matchOrder: match.order,
      homeTeam: match.homeTeam.shortName,
      awayTeam: match.awayTeam.shortName,
      probabilities: match.probabilities,
      predictions,
      consensusSign,
      consensusCount,
      confidence
    };
  });

  const plenoPredictions: Record<StrategyType, { home: string; away: string }> = {} as never;
  for (const st of strategies) {
    plenoPredictions[st] = strategyPicksMap[st].plenoPick;
  }

  return {
    jornadaNumber: jornadaData.jornadaNumber,
    matches: matchPredictions,
    plenoPredictions
  };
}

import {
  Sign1X2,
  PlenoSelection,
  QuinielaMatch,
  StrategyType,
  ReductionConfig,
  QuinielaTicketPick,
  QuinielaTicket,
  JornadaQuinielaData,
  BacktestResult,
  BetEvaluationDetail
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

    case 'high_yield':
      // Seek underdogs and surprises (high prize return when public heavily backs favorite)
      if (p1 >= 70) {
        // Overbet favorite: take the favorite as primary but double on the surprise draw
        primary = '1';
        secondary = 'X';
      } else if (p1 >= 50) {
        // Moderately favored: contrarian double X2!
        primary = 'X';
        secondary = '2';
      } else if (p2 >= 50) {
        primary = '2';
        secondary = 'X';
      } else {
        primary = 'X';
        secondary = p2 >= p1 ? '2' : '1';
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
  const { p1, p2 } = m.probabilities;

  if (strategy === 'high_yield') {
    return { home: '1', away: '1' };
  }

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

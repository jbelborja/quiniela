export type Sign1X2 = '1' | 'X' | '2';
export type PlenoScore = '0' | '1' | '2' | 'M';

export interface PlenoSelection {
  home: PlenoScore;
  away: PlenoScore;
}

export interface QuinielaMatch {
  id: string;
  order: number; // 1 to 15
  isPleno: boolean;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
  realScore?: {
    home: number;
    away: number;
  };
  realSign?: Sign1X2;
  realPleno?: PlenoSelection;
  // Historical stats prior to this matchday (evaluated from previous results)
  stats?: {
    homeRank: number;
    awayRank: number;
    homeForm: string[]; // e.g. ['W', 'D', 'W', 'L', 'W']
    awayForm: string[];
    homeGoalsAvg: number;
    awayGoalsAvg: number;
    h2hSummary?: string;
  };
  // Estimated probabilities calculated from previous matches
  probabilities: {
    p1: number; // e.g. 52 (%)
    px: number; // e.g. 26 (%)
    p2: number; // e.g. 22 (%)
  };
}

export type StrategyType = 'conservative' | 'balanced' | 'high_yield' | 'draw_specialist';

export interface StrategyInfo {
  id: StrategyType;
  name: string;
  shortDesc: string;
  badge: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  description: string;
}

export type OfficialReductionId = 
  | 'red_4T_13' 
  | 'red_7D_13' 
  | 'red_3D3T_13' 
  | 'red_6D2T_13' 
  | 'red_8T_12' 
  | 'red_11D_12'
  | 'custom';

export interface ReductionConfig {
  id: OfficialReductionId;
  name: string;
  triples: number;
  dobles: number;
  apuestas: number;
  coste: number; // en euros (apuestas * 0.75)
  garantia: 'Al 13' | 'Al 12' | 'Al 14' | 'Directa';
  prob14: number; // porcentaje estimado de llegar al 14 si se acierta la base
  description: string;
}

export interface QuinielaTicketPick {
  matchOrder: number;
  selectedSigns: Sign1X2[]; // e.g. ['1'] or ['1', 'X'] or ['1', 'X', '2']
  plenoPick?: PlenoSelection;
  isTriple: boolean;
  isDouble: boolean;
  isSingle: boolean;
}

export interface QuinielaTicket {
  jornadaNumber: number;
  strategy: StrategyType;
  reduction: ReductionConfig;
  basePicks: QuinielaTicketPick[];
  generatedBets: Sign1X2[][]; // Array of 14 signs for each bet
  plenoBet: PlenoSelection;
  totalBets: number;
  totalCost: number;
}

export interface PrizeCategory {
  category: '15' | '14' | '13' | '12' | '11' | '10';
  name: string;
  winners: number;
  prizePerWinner: number;
}

export interface JornadaScrutiny {
  recaudacion: number;
  bote: number;
  categories: {
    p15: PrizeCategory;
    p14: PrizeCategory;
    p13: PrizeCategory;
    p12: PrizeCategory;
    p11: PrizeCategory;
    p10: PrizeCategory;
  };
}

export interface JornadaQuinielaData {
  jornadaNumber: number;
  season: string;
  title: string;
  dateRange: string;
  isCompleted: boolean;
  matches: QuinielaMatch[];
  scrutiny?: JornadaScrutiny;
}

export interface BetEvaluationDetail {
  betIndex: number;
  hitsCount: number;
  signs: Sign1X2[];
  plenoHit: boolean;
  hitsBreakdown: boolean[]; // 14 booleans: hit or miss for each match
  categoryWon?: '15' | '14' | '13' | '12' | '11' | '10' | null;
  prizeAmount: number;
}

export interface BacktestResult {
  jornadaNumber: number;
  totalInvested: number;
  totalWon: number;
  netProfit: number;
  roiPercentage: number;
  totalBets: number;
  bestHits: number;
  wonPleno: boolean;
  categoryHitsSummary: {
    c15: number;
    c14: number;
    c13: number;
    c12: number;
    c11: number;
    c10: number;
  };
  categoryPrizesSummary: {
    c15: number;
    c14: number;
    c13: number;
    c12: number;
    c11: number;
    c10: number;
  };
  bestBet: BetEvaluationDetail;
  allEvaluations: BetEvaluationDetail[];
}

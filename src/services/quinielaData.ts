import { JornadaQuinielaData, StrategyInfo, ReductionConfig } from '../types/quiniela';

export const STRATEGIES_LIST: StrategyInfo[] = [
  {
    id: 'conservative',
    name: 'Conservadora (Favoritos)',
    shortDesc: 'Máxima probabilidad de aciertos',
    badge: 'Segura',
    riskLevel: 'Bajo',
    description: 'Prioriza a los equipos favoritos y líderes de la tabla con menor varianza. Ideal para asegurar premios frecuentes de 10 a 12 aciertos.'
  },
  {
    id: 'balanced',
    name: 'Equilibrada (Estadística & Valor)',
    shortDesc: 'Optimiza valor esperado y forma',
    badge: 'Recomendada',
    riskLevel: 'Medio',
    description: 'Combina victorias de favoritos sólidos con dobles estratégicos en partidos igualados y con dinámicas de racha positiva.'
  },
  {
    id: 'draw_specialist',
    name: 'Especialista en Empates',
    shortDesc: 'Doble cobertura en máxima paridad',
    badge: 'Táctica X',
    riskLevel: 'Medio',
    description: 'Se enfoca en duelos directos con defensas fuertes y alto porcentaje histórico de reparto de puntos (1X o X2).'
  },
  {
    id: 'poisson_dixon',
    name: 'Poisson (Dixon-Coles)',
    shortDesc: 'Matriz estocástica de goles',
    badge: 'Cuantitativa',
    riskLevel: 'Medio',
    description: 'Modela la distribución bivariante de goles con corrección de empates a baja puntuación. Precisión matemática superior en 1X2 y en el Pleno al 15.'
  },
  {
    id: 'expected_value',
    name: 'Valor Esperado (EV+)',
    shortDesc: 'Arbitraje contra el público',
    badge: 'Smart Money',
    riskLevel: 'Alto',
    description: 'Compara la probabilidad real con el sesgo del apostador medio. Invierte los dobles y triples en signos infravalorados donde el premio a cobrar supera su riesgo.'
  }
];

export const OFFICIAL_REDUCTIONS: ReductionConfig[] = [
  {
    id: 'red_4T_13',
    name: '4 Triples al 13 (Reducción 1)',
    triples: 4,
    dobles: 0,
    apuestas: 9,
    coste: 6.75,
    garantia: 'Al 13',
    prob14: 11.1,
    description: '9 apuestas en lugar de 81. Garantiza al 100% 13 aciertos (11,1% de optar al 14) acertando el pronóstico base.'
  },
  {
    id: 'red_7D_13',
    name: '7 Dobles al 13 (Reducción 2)',
    triples: 0,
    dobles: 7,
    apuestas: 16,
    coste: 12.00,
    garantia: 'Al 13',
    prob14: 12.5,
    description: '16 apuestas en lugar de 128. Garantiza al 100% 13 aciertos (12,5% de optar al 14) acertando la base.'
  },
  {
    id: 'red_3D3T_13',
    name: '3 Dobles + 3 Triples al 13 (Reducción 3)',
    triples: 3,
    dobles: 3,
    apuestas: 24,
    coste: 18.00,
    garantia: 'Al 13',
    prob14: 11.1,
    description: '24 apuestas en lugar de 216. Cobertura equilibrada para 6 partidos dudosos con garantía 100% al 13.'
  },
  {
    id: 'red_6D2T_13',
    name: '6 Dobles + 2 Triples al 13 (Reducción 4)',
    triples: 2,
    dobles: 6,
    apuestas: 64,
    coste: 48.00,
    garantia: 'Al 13',
    prob14: 11.1,
    description: '64 apuestas en lugar de 576. Cubre 8 partidos (2 triples y 6 dobles) asegurando premio de 13 aciertos.'
  },
  {
    id: 'red_8T_12',
    name: '8 Triples al 12 (Reducción 5)',
    triples: 8,
    dobles: 0,
    apuestas: 81,
    coste: 60.75,
    garantia: 'Al 12',
    prob14: 1.2,
    description: '81 apuestas en lugar de 6.561. Cobertura masiva de 8 partidos enteros con garantía matemática al 12.'
  },
  {
    id: 'red_11D_12',
    name: '11 Dobles al 12 (Reducción 6)',
    triples: 0,
    dobles: 11,
    apuestas: 132,
    coste: 99.00,
    garantia: 'Al 12',
    prob14: 6.4,
    description: '132 apuestas en lugar de 2.048. Protege 11 partidos con dobles asegurando premio mínimo al 12.'
  }
];

export const JORNADAS_QUINIELA_DATA: JornadaQuinielaData[] = [
  {
    jornadaNumber: 12,
    season: '2024-2025',
    title: 'Jornada 12 de LaLiga',
    dateRange: '1 - 4 nov 2024',
    isCompleted: true,
    scrutiny: {
      recaudacion: 4812350.25,
      bote: 1850000.00,
      categories: {
        p15: { category: '15', name: 'Pleno al 15', winners: 1, prizePerWinner: 2145320.10 },
        p14: { category: '14', name: '14 Aciertos', winners: 4, prizePerWinner: 112450.40 },
        p13: { category: '13', name: '13 Aciertos', winners: 142, prizePerWinner: 2540.80 },
        p12: { category: '12', name: '12 Aciertos', winners: 1850, prizePerWinner: 195.20 },
        p11: { category: '11', name: '11 Aciertos', winners: 14200, prizePerWinner: 25.40 },
        p10: { category: '10', name: '10 Aciertos', winners: 68400, prizePerWinner: 6.20 }
      }
    },
    matches: [
      {
        id: 'j12-1',
        order: 1,
        isPleno: false,
        homeTeam: { id: 'alaves', name: 'Deportivo Alavés', shortName: 'Alavés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png' },
        awayTeam: { id: 'mallorca', name: 'RCD Mallorca', shortName: 'Mallorca', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 16, awayRank: 7, homeForm: ['L', 'L', 'L', 'L', 'L'], awayForm: ['W', 'L', 'W', 'W', 'D'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.0, h2hSummary: 'Alavés fuerte en Mendizorroza' },
        probabilities: { p1: 38, px: 32, p2: 30 }
      },
      {
        id: 'j12-2',
        order: 2,
        isPleno: false,
        homeTeam: { id: 'osasuna', name: 'CA Osasuna', shortName: 'Osasuna', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png' },
        awayTeam: { id: 'valladolid', name: 'Real Valladolid', shortName: 'Valladolid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 8, awayRank: 19, homeForm: ['W', 'L', 'W', 'D', 'W'], awayForm: ['L', 'W', 'L', 'L', 'L'], homeGoalsAvg: 1.4, awayGoalsAvg: 0.7, h2hSummary: 'Osasuna invicto en El Sadar vs Valladolid' },
        probabilities: { p1: 62, px: 24, p2: 14 }
      },
      {
        id: 'j12-3',
        order: 3,
        isPleno: false,
        homeTeam: { id: 'girona', name: 'Girona FC', shortName: 'Girona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png' },
        awayTeam: { id: 'leganes', name: 'CD Leganés', shortName: 'Leganés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/989.png' },
        realScore: { home: 4, away: 3 },
        realSign: '1',
        stats: { homeRank: 13, awayRank: 14, homeForm: ['L', 'W', 'L', 'D', 'W'], awayForm: ['W', 'L', 'D', 'D', 'L'], homeGoalsAvg: 1.3, awayGoalsAvg: 0.9, h2hSummary: 'Girona domina en Montilivi' },
        probabilities: { p1: 58, px: 25, p2: 17 }
      },
      {
        id: 'j12-4',
        order: 4,
        isPleno: false,
        homeTeam: { id: 'atm', name: 'Atlético de Madrid', shortName: 'Atlético', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
        awayTeam: { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'Las Palmas', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        stats: { homeRank: 4, awayRank: 18, homeForm: ['L', 'W', 'D', 'W', 'D'], awayForm: ['W', 'W', 'L', 'L', 'D'], homeGoalsAvg: 1.7, awayGoalsAvg: 1.1, h2hSummary: 'Atlético 7 victorias consecutivas en casa' },
        probabilities: { p1: 76, px: 16, p2: 8 }
      },
      {
        id: 'j12-5',
        order: 5,
        isPleno: false,
        homeTeam: { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
        awayTeam: { id: 'espanyol', name: 'RCD Espanyol', shortName: 'Espanyol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png' },
        realScore: { home: 3, away: 1 },
        realSign: '1',
        stats: { homeRank: 1, awayRank: 17, homeForm: ['W', 'W', 'W', 'W', 'L'], awayForm: ['L', 'L', 'W', 'L', 'L'], homeGoalsAvg: 3.2, awayGoalsAvg: 0.9, h2hSummary: 'Derbi catalán con claro dominio blaugrana' },
        probabilities: { p1: 85, px: 10, p2: 5 }
      },
      {
        id: 'j12-6',
        order: 6,
        isPleno: false,
        homeTeam: { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
        awayTeam: { id: 'realsociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png' },
        realScore: { home: 0, away: 2 },
        realSign: '2',
        stats: { homeRank: 10, awayRank: 12, homeForm: ['W', 'L', 'W', 'D', 'W'], awayForm: ['L', 'W', 'D', 'W', 'L'], homeGoalsAvg: 1.1, awayGoalsAvg: 0.9, h2hSummary: 'Duelo parejo en el Pizjuán' },
        probabilities: { p1: 39, px: 33, p2: 28 }
      },
      {
        id: 'j12-7',
        order: 7,
        isPleno: false,
        homeTeam: { id: 'athletic', name: 'Athletic Club', shortName: 'Athletic', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },
        awayTeam: { id: 'betis', name: 'Real Betis', shortName: 'Betis', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 5, awayRank: 6, homeForm: ['D', 'W', 'L', 'D', 'W'], awayForm: ['W', 'W', 'L', 'D', 'W'], homeGoalsAvg: 1.5, awayGoalsAvg: 1.1, h2hSummary: 'San Mamés suele ver goles y tensión' },
        probabilities: { p1: 49, px: 29, p2: 22 }
      },
      {
        id: 'j12-8',
        order: 8,
        isPleno: false,
        homeTeam: { id: 'celta', name: 'RC Celta', shortName: 'Celta', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png' },
        awayTeam: { id: 'getafe', name: 'Getafe CF', shortName: 'Getafe', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/92.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 11, awayRank: 15, homeForm: ['L', 'L', 'W', 'D', 'L'], awayForm: ['D', 'D', 'W', 'L', 'D'], homeGoalsAvg: 1.6, awayGoalsAvg: 0.8, h2hSummary: 'Getafe rocoso fuera de casa' },
        probabilities: { p1: 46, px: 32, p2: 22 }
      },
      {
        id: 'j12-9',
        order: 9,
        isPleno: false,
        homeTeam: { id: 'zaragoza', name: 'Real Zaragoza', shortName: 'Zaragoza', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/99.png' },
        awayTeam: { id: 'granada', name: 'Granada CF', shortName: 'Granada', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png' },
        realScore: { home: 2, away: 1 },
        realSign: '1',
        stats: { homeRank: 3, awayRank: 5, homeForm: ['W', 'L', 'W', 'W', 'D'], awayForm: ['L', 'W', 'W', 'W', 'D'], homeGoalsAvg: 1.7, awayGoalsAvg: 1.4, h2hSummary: 'Duelo en zona alta de LaLiga' },
        probabilities: { p1: 44, px: 31, p2: 25 }
      },
      {
        id: 'j12-10',
        order: 10,
        isPleno: false,
        homeTeam: { id: 'sporting', name: 'Real Sporting', shortName: 'Sporting', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        awayTeam: { id: 'cadiz', name: 'Cádiz CF', shortName: 'Cádiz', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/87.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        stats: { homeRank: 4, awayRank: 17, homeForm: ['W', 'W', 'W', 'L', 'W'], awayForm: ['W', 'L', 'D', 'L', 'L'], homeGoalsAvg: 1.5, awayGoalsAvg: 1.0, h2hSummary: 'El Molinón como fortín' },
        probabilities: { p1: 52, px: 28, p2: 20 }
      },
      {
        id: 'j12-11',
        order: 11,
        isPleno: false,
        homeTeam: { id: 'oviedo', name: 'Real Oviedo', shortName: 'Oviedo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
        awayTeam: { id: 'burgos', name: 'Burgos CF', shortName: 'Burgos', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6908.png' },
        realScore: { home: 3, away: 1 },
        realSign: '1',
        stats: { homeRank: 6, awayRank: 11, homeForm: ['D', 'W', 'D', 'D', 'W'], awayForm: ['L', 'D', 'L', 'L', 'L'], homeGoalsAvg: 1.2, awayGoalsAvg: 0.9, h2hSummary: 'Oviedo sólido como local' },
        probabilities: { p1: 51, px: 30, p2: 19 }
      },
      {
        id: 'j12-12',
        order: 12,
        isPleno: false,
        homeTeam: { id: 'elche', name: 'Elche CF', shortName: 'Elche', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3751.png' },
        awayTeam: { id: 'eibar', name: 'SD Eibar', shortName: 'Eibar', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/91.png' },
        realScore: { home: 0, away: 2 },
        realSign: '2',
        stats: { homeRank: 8, awayRank: 9, homeForm: ['W', 'D', 'W', 'L', 'D'], awayForm: ['L', 'W', 'L', 'W', 'L'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.0, h2hSummary: 'Encuentro con máxima igualdad' },
        probabilities: { p1: 42, px: 33, p2: 25 }
      },
      {
        id: 'j12-13',
        order: 13,
        isPleno: false,
        homeTeam: { id: 'santander', name: 'Racing de Santander', shortName: 'Racing', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        awayTeam: { id: 'albacete', name: 'Albacete Balompié', shortName: 'Albacete', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/90.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 1, awayRank: 14, homeForm: ['W', 'W', 'W', 'W', 'W'], awayForm: ['D', 'D', 'L', 'W', 'D'], homeGoalsAvg: 1.8, awayGoalsAvg: 1.3, h2hSummary: 'Líder en racha demoledora' },
        probabilities: { p1: 60, px: 24, p2: 16 }
      },
      {
        id: 'j12-14',
        order: 14,
        isPleno: false,
        homeTeam: { id: 'levante', name: 'Levante UD', shortName: 'Levante', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/100.png' },
        awayTeam: { id: 'malaga', name: 'Málaga CF', shortName: 'Málaga', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/241.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 2, awayRank: 12, homeForm: ['W', 'D', 'W', 'D', 'W'], awayForm: ['D', 'D', 'D', 'L', 'W'], homeGoalsAvg: 1.4, awayGoalsAvg: 0.9, h2hSummary: 'Málaga especialista en empates' },
        probabilities: { p1: 48, px: 34, p2: 18 }
      },
      {
        id: 'j12-15',
        order: 15,
        isPleno: true,
        homeTeam: { id: 'rayo', name: 'Rayo Vallecano', shortName: 'Rayo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png' },
        awayTeam: { id: 'alaves_dup', name: 'Villarreal CF', shortName: 'Villarreal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        realPleno: { home: '1', away: '2' },
        stats: { homeRank: 9, awayRank: 3, homeForm: ['W', 'L', 'D', 'W', 'D'], awayForm: ['W', 'D', 'L', 'W', 'W'], homeGoalsAvg: 1.2, awayGoalsAvg: 1.8, h2hSummary: 'Partido aplazado disputado con alta intensidad' },
        probabilities: { p1: 30, px: 32, p2: 38 }
      }
    ]
  },
  {
    jornadaNumber: 11,
    season: '2024-2025',
    title: 'Jornada 11 de LaLiga (El Clásico)',
    dateRange: '25 - 28 oct 2024',
    isCompleted: true,
    scrutiny: {
      recaudacion: 5120800.50,
      bote: 2400000.00,
      categories: {
        p15: { category: '15', name: 'Pleno al 15', winners: 0, prizePerWinner: 0 },
        p14: { category: '14', name: '14 Aciertos', winners: 2, prizePerWinner: 389420.50 },
        p13: { category: '13', name: '13 Aciertos', winners: 64, prizePerWinner: 6240.20 },
        p12: { category: '12', name: '12 Aciertos', winners: 920, prizePerWinner: 434.10 },
        p11: { category: '11', name: '11 Aciertos', winners: 8650, prizePerWinner: 46.20 },
        p10: { category: '10', name: '10 Aciertos', winners: 48900, prizePerWinner: 8.80 }
      }
    },
    matches: [
      {
        id: 'j11-1',
        order: 1,
        isPleno: false,
        homeTeam: { id: 'espanyol', name: 'RCD Espanyol', shortName: 'Espanyol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png' },
        awayTeam: { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
        realScore: { home: 0, away: 2 },
        realSign: '2',
        stats: { homeRank: 15, awayRank: 13, homeForm: ['L', 'W', 'L', 'L', 'W'], awayForm: ['L', 'W', 'D', 'W', 'L'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.0, h2hSummary: 'Lukebakio desatascó el duelo' },
        probabilities: { p1: 34, px: 33, p2: 33 }
      },
      {
        id: 'j11-2',
        order: 2,
        isPleno: false,
        homeTeam: { id: 'valladolid', name: 'Real Valladolid', shortName: 'Valladolid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        awayTeam: { id: 'villarreal', name: 'Villarreal CF', shortName: 'Villarreal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 18, awayRank: 4, homeForm: ['W', 'L', 'L', 'L', 'D'], awayForm: ['D', 'L', 'W', 'W', 'L'], homeGoalsAvg: 0.8, awayGoalsAvg: 1.8, h2hSummary: 'Villarreal peligroso a domicilio' },
        probabilities: { p1: 22, px: 28, p2: 50 }
      },
      {
        id: 'j11-3',
        order: 3,
        isPleno: false,
        homeTeam: { id: 'rayo', name: 'Rayo Vallecano', shortName: 'Rayo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png' },
        awayTeam: { id: 'alaves', name: 'Deportivo Alavés', shortName: 'Alavés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 9, awayRank: 14, homeForm: ['L', 'D', 'W', 'D', 'D'], awayForm: ['L', 'L', 'L', 'L', 'W'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.1, h2hSummary: 'Alavés en crisis de resultados' },
        probabilities: { p1: 48, px: 32, p2: 20 }
      },
      {
        id: 'j11-4',
        order: 4,
        isPleno: false,
        homeTeam: { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'Las Palmas', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png' },
        awayTeam: { id: 'girona', name: 'Girona FC', shortName: 'Girona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 19, awayRank: 12, homeForm: ['W', 'L', 'L', 'D', 'L'], awayForm: ['L', 'W', 'D', 'L', 'D'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.2, h2hSummary: 'Sorpresa en Gran Canaria' },
        probabilities: { p1: 28, px: 30, p2: 42 }
      },
      {
        id: 'j11-5',
        order: 5,
        isPleno: false,
        homeTeam: { id: 'leganes', name: 'CD Leganés', shortName: 'Leganés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/989.png' },
        awayTeam: { id: 'celta', name: 'RC Celta', shortName: 'Celta', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png' },
        realScore: { home: 3, away: 0 },
        realSign: '1',
        stats: { homeRank: 17, awayRank: 10, homeForm: ['L', 'D', 'D', 'L', 'D'], awayForm: ['L', 'W', 'D', 'L', 'W'], homeGoalsAvg: 0.6, awayGoalsAvg: 1.7, h2hSummary: 'Contundente triunfo pepinero' },
        probabilities: { p1: 31, px: 34, p2: 35 }
      },
      {
        id: 'j11-6',
        order: 6,
        isPleno: false,
        homeTeam: { id: 'getafe', name: 'Getafe CF', shortName: 'Getafe', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/92.png' },
        awayTeam: { id: 'valencia', name: 'Valencia CF', shortName: 'Valencia', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 16, awayRank: 20, homeForm: ['D', 'W', 'L', 'D', 'L'], awayForm: ['L', 'D', 'L', 'D', 'W'], homeGoalsAvg: 0.8, awayGoalsAvg: 0.7, h2hSummary: 'Bordalás vs Baraja, clásico duelo táctico' },
        probabilities: { p1: 42, px: 38, p2: 20 }
      },
      {
        id: 'j11-7',
        order: 7,
        isPleno: false,
        homeTeam: { id: 'betis', name: 'Real Betis', shortName: 'Betis', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
        awayTeam: { id: 'atm', name: 'Atlético de Madrid', shortName: 'Atlético', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 7, awayRank: 3, homeForm: ['W', 'L', 'D', 'W', 'L'], awayForm: ['W', 'D', 'W', 'D', 'W'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.6, h2hSummary: 'Primera derrota del Atleti en liga' },
        probabilities: { p1: 29, px: 32, p2: 39 }
      },
      {
        id: 'j11-8',
        order: 8,
        isPleno: false,
        homeTeam: { id: 'realsociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png' },
        awayTeam: { id: 'osasuna', name: 'CA Osasuna', shortName: 'Osasuna', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png' },
        realScore: { home: 0, away: 2 },
        realSign: '2',
        stats: { homeRank: 11, awayRank: 8, homeForm: ['W', 'D', 'W', 'L', 'D'], awayForm: ['L', 'W', 'D', 'W', 'L'], homeGoalsAvg: 0.8, awayGoalsAvg: 1.4, h2hSummary: 'Osasuna asaltó el Reale Arena' },
        probabilities: { p1: 48, px: 31, p2: 21 }
      },
      {
        id: 'j11-9',
        order: 9,
        isPleno: false,
        homeTeam: { id: 'mallorca', name: 'RCD Mallorca', shortName: 'Mallorca', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
        awayTeam: { id: 'athletic', name: 'Athletic Club', shortName: 'Athletic', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },
        realScore: { home: 0, away: 0 },
        realSign: 'X',
        stats: { homeRank: 6, awayRank: 5, homeForm: ['W', 'L', 'W', 'W', 'W'], awayForm: ['W', 'L', 'D', 'W', 'W'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.7, h2hSummary: 'Muralla bermellona vs ataque león' },
        probabilities: { p1: 33, px: 36, p2: 31 }
      },
      {
        id: 'j11-10',
        order: 10,
        isPleno: false,
        homeTeam: { id: 'cadiz', name: 'Cádiz CF', shortName: 'Cádiz', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/87.png' },
        awayTeam: { id: 'oviedo', name: 'Real Oviedo', shortName: 'Oviedo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        stats: { homeRank: 18, awayRank: 4, homeForm: ['L', 'D', 'L', 'L', 'W'], awayForm: ['W', 'D', 'D', 'W', 'W'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.2, h2hSummary: 'Reacción cadista en el Carranza' },
        probabilities: { p1: 37, px: 33, p2: 30 }
      },
      {
        id: 'j11-11',
        order: 11,
        isPleno: false,
        homeTeam: { id: 'zaragoza', name: 'Real Zaragoza', shortName: 'Zaragoza', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/99.png' },
        awayTeam: { id: 'castellon', name: 'CD Castellón', shortName: 'Castellón', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 2, awayRank: 6, homeForm: ['W', 'W', 'L', 'W', 'L'], awayForm: ['W', 'L', 'W', 'W', 'L'], homeGoalsAvg: 1.8, awayGoalsAvg: 1.6, h2hSummary: 'Sorpresa del recién ascendido' },
        probabilities: { p1: 49, px: 28, p2: 23 }
      },
      {
        id: 'j11-12',
        order: 12,
        isPleno: false,
        homeTeam: { id: 'granada', name: 'Granada CF', shortName: 'Granada', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png' },
        awayTeam: { id: 'levante', name: 'Levante UD', shortName: 'Levante', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/100.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 5, awayRank: 3, homeForm: ['W', 'W', 'W', 'D', 'D'], awayForm: ['D', 'W', 'D', 'W', 'L'], homeGoalsAvg: 1.5, awayGoalsAvg: 1.4, h2hSummary: 'Duelo de gallos en Los Cármenes' },
        probabilities: { p1: 42, px: 31, p2: 27 }
      },
      {
        id: 'j11-13',
        order: 13,
        isPleno: false,
        homeTeam: { id: 'racingferrol', name: 'Racing de Ferrol', shortName: 'Ferrol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        awayTeam: { id: 'tenerife', name: 'CD Tenerife', shortName: 'Tenerife', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 19, awayRank: 22, homeForm: ['W', 'D', 'W', 'L', 'L'], awayForm: ['D', 'L', 'L', 'W', 'L'], homeGoalsAvg: 0.7, awayGoalsAvg: 0.8, h2hSummary: 'Máxima tensión en la zona roja' },
        probabilities: { p1: 39, px: 35, p2: 26 }
      },
      {
        id: 'j11-14',
        order: 14,
        isPleno: false,
        homeTeam: { id: 'santander', name: 'Racing Santander', shortName: 'Racing', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        awayTeam: { id: 'cordoba', name: 'Córdoba CF', shortName: 'Córdoba', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        stats: { homeRank: 1, awayRank: 15, homeForm: ['W', 'W', 'W', 'W', 'L'], awayForm: ['W', 'D', 'L', 'W', 'L'], homeGoalsAvg: 1.9, awayGoalsAvg: 1.0, h2hSummary: 'El Sardinero empuja al líder' },
        probabilities: { p1: 64, px: 23, p2: 13 }
      },
      {
        id: 'j11-15',
        order: 15,
        isPleno: true,
        homeTeam: { id: 'realmadrid', name: 'Real Madrid', shortName: 'R. Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
        awayTeam: { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
        realScore: { home: 0, away: 4 },
        realSign: '2',
        realPleno: { home: '0', away: 'M' },
        stats: { homeRank: 2, awayRank: 1, homeForm: ['W', 'W', 'D', 'W', 'W'], awayForm: ['W', 'W', 'W', 'L', 'W'], homeGoalsAvg: 2.1, awayGoalsAvg: 3.3, h2hSummary: 'El Clásico en el Santiago Bernabéu' },
        probabilities: { p1: 45, px: 27, p2: 28 }
      }
    ]
  },
  {
    jornadaNumber: 10,
    season: '2024-2025',
    title: 'Jornada 10 de LaLiga',
    dateRange: '18 - 21 oct 2024',
    isCompleted: true,
    scrutiny: {
      recaudacion: 4620100.00,
      bote: 1200000.00,
      categories: {
        p15: { category: '15', name: 'Pleno al 15', winners: 2, prizePerWinner: 785120.00 },
        p14: { category: '14', name: '14 Aciertos', winners: 9, prizePerWinner: 48200.00 },
        p13: { category: '13', name: '13 Aciertos', winners: 210, prizePerWinner: 1720.50 },
        p12: { category: '12', name: '12 Aciertos', winners: 2450, prizePerWinner: 147.30 },
        p11: { category: '11', name: '11 Aciertos', winners: 18900, prizePerWinner: 19.10 },
        p10: { category: '10', name: '10 Aciertos', winners: 82000, prizePerWinner: 5.20 }
      }
    },
    matches: [
      {
        id: 'j10-1',
        order: 1,
        isPleno: false,
        homeTeam: { id: 'alaves', name: 'Deportivo Alavés', shortName: 'Alavés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png' },
        awayTeam: { id: 'valladolid', name: 'Real Valladolid', shortName: 'Valladolid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        realScore: { home: 2, away: 3 },
        realSign: '2',
        stats: { homeRank: 13, awayRank: 19, homeForm: ['L', 'L', 'L', 'W', 'W'], awayForm: ['L', 'L', 'L', 'D', 'L'], homeGoalsAvg: 1.2, awayGoalsAvg: 0.6, h2hSummary: 'Sorpresa con lluvia de goles' },
        probabilities: { p1: 53, px: 29, p2: 18 }
      },
      {
        id: 'j10-2',
        order: 2,
        isPleno: false,
        homeTeam: { id: 'athletic', name: 'Athletic Club', shortName: 'Athletic', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },
        awayTeam: { id: 'espanyol', name: 'RCD Espanyol', shortName: 'Espanyol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png' },
        realScore: { home: 4, away: 1 },
        realSign: '1',
        stats: { homeRank: 6, awayRank: 14, homeForm: ['L', 'D', 'W', 'W', 'W'], awayForm: ['W', 'L', 'L', 'W', 'L'], homeGoalsAvg: 1.6, awayGoalsAvg: 1.0, h2hSummary: 'Athletic muy superior' },
        probabilities: { p1: 71, px: 19, p2: 10 }
      },
      {
        id: 'j10-3',
        order: 3,
        isPleno: false,
        homeTeam: { id: 'osasuna', name: 'CA Osasuna', shortName: 'Osasuna', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png' },
        awayTeam: { id: 'betis', name: 'Real Betis', shortName: 'Betis', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 5, awayRank: 10, homeForm: ['D', 'W', 'D', 'W', 'L'], awayForm: ['L', 'D', 'W', 'L', 'W'], homeGoalsAvg: 1.4, awayGoalsAvg: 1.0, h2hSummary: 'Vitor Roque decidió en El Sadar' },
        probabilities: { p1: 41, px: 32, p2: 27 }
      },
      {
        id: 'j10-4',
        order: 4,
        isPleno: false,
        homeTeam: { id: 'girona', name: 'Girona FC', shortName: 'Girona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png' },
        awayTeam: { id: 'realsociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png' },
        realScore: { home: 0, away: 1 },
        realSign: '2',
        stats: { homeRank: 11, awayRank: 15, homeForm: ['W', 'D', 'L', 'D', 'L'], awayForm: ['D', 'W', 'L', 'D', 'L'], homeGoalsAvg: 1.3, awayGoalsAvg: 0.8, h2hSummary: 'Golazo de Oyarzabal' },
        probabilities: { p1: 44, px: 31, p2: 25 }
      },
      {
        id: 'j10-5',
        order: 5,
        isPleno: false,
        homeTeam: { id: 'celta', name: 'RC Celta', shortName: 'Celta', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png' },
        awayTeam: { id: 'realmadrid', name: 'Real Madrid', shortName: 'R. Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 9, awayRank: 2, homeForm: ['W', 'D', 'L', 'W', 'L'], awayForm: ['W', 'D', 'W', 'W', 'W'], homeGoalsAvg: 1.8, awayGoalsAvg: 2.1, h2hSummary: 'Mbappé y Vinicius resolvieron en Balaídos' },
        probabilities: { p1: 18, px: 24, p2: 58 }
      },
      {
        id: 'j10-6',
        order: 6,
        isPleno: false,
        homeTeam: { id: 'mallorca', name: 'RCD Mallorca', shortName: 'Mallorca', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
        awayTeam: { id: 'rayo', name: 'Rayo Vallecano', shortName: 'Rayo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 7, awayRank: 8, homeForm: ['L', 'W', 'W', 'W', 'L'], awayForm: ['D', 'W', 'D', 'D', 'L'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.1, h2hSummary: 'Muriqi de cabeza sentenció' },
        probabilities: { p1: 47, px: 33, p2: 20 }
      },
      {
        id: 'j10-7',
        order: 7,
        isPleno: false,
        homeTeam: { id: 'atm', name: 'Atlético de Madrid', shortName: 'Atlético', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
        awayTeam: { id: 'leganes', name: 'CD Leganés', shortName: 'Leganés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/989.png' },
        realScore: { home: 3, away: 1 },
        realSign: '1',
        stats: { homeRank: 3, awayRank: 17, homeForm: ['D', 'W', 'D', 'W', 'W'], awayForm: ['D', 'D', 'L', 'D', 'L'], homeGoalsAvg: 1.6, awayGoalsAvg: 0.6, h2hSummary: 'Remontada colchonera en el Metropolitano' },
        probabilities: { p1: 80, px: 14, p2: 6 }
      },
      {
        id: 'j10-8',
        order: 8,
        isPleno: false,
        homeTeam: { id: 'villarreal', name: 'Villarreal CF', shortName: 'Villarreal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        awayTeam: { id: 'getafe', name: 'Getafe CF', shortName: 'Getafe', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/92.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 4, awayRank: 16, homeForm: ['L', 'W', 'W', 'L', 'W'], awayForm: ['W', 'L', 'D', 'L', 'L'], homeGoalsAvg: 1.9, awayGoalsAvg: 0.8, h2hSummary: 'Penalti de Arambarri en el 87' },
        probabilities: { p1: 61, px: 24, p2: 15 }
      },
      {
        id: 'j10-9',
        order: 9,
        isPleno: false,
        homeTeam: { id: 'valencia', name: 'Valencia CF', shortName: 'Valencia', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        awayTeam: { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'Las Palmas', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png' },
        realScore: { home: 2, away: 3 },
        realSign: '2',
        stats: { homeRank: 18, awayRank: 20, homeForm: ['D', 'L', 'D', 'W', 'L'], awayForm: ['L', 'L', 'D', 'L', 'L'], homeGoalsAvg: 0.7, awayGoalsAvg: 0.9, h2hSummary: 'Sorpresón y crisis en Mestalla' },
        probabilities: { p1: 56, px: 27, p2: 17 }
      },
      {
        id: 'j10-10',
        order: 10,
        isPleno: false,
        homeTeam: { id: 'oviedo', name: 'Real Oviedo', shortName: 'Oviedo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
        awayTeam: { id: 'malaga', name: 'Málaga CF', shortName: 'Málaga', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/241.png' },
        realScore: { home: 0, away: 0 },
        realSign: 'X',
        stats: { homeRank: 7, awayRank: 12, homeForm: ['D', 'D', 'W', 'W', 'D'], awayForm: ['D', 'D', 'D', 'D', 'W'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.0, h2hSummary: 'Defensas férreas' },
        probabilities: { p1: 45, px: 36, p2: 19 }
      },
      {
        id: 'j10-11',
        order: 11,
        isPleno: false,
        homeTeam: { id: 'elche', name: 'Elche CF', shortName: 'Elche', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3751.png' },
        awayTeam: { id: 'sporting', name: 'Real Sporting', shortName: 'Sporting', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        realScore: { home: 2, away: 1 },
        realSign: '1',
        stats: { homeRank: 11, awayRank: 5, homeForm: ['L', 'D', 'W', 'W', 'L'], awayForm: ['W', 'W', 'W', 'L', 'W'], homeGoalsAvg: 1.2, awayGoalsAvg: 1.4, h2hSummary: 'El Martínez Valero rugió' },
        probabilities: { p1: 39, px: 32, p2: 29 }
      },
      {
        id: 'j10-12',
        order: 12,
        isPleno: false,
        homeTeam: { id: 'castellon', name: 'CD Castellón', shortName: 'Castellón', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' },
        awayTeam: { id: 'levante', name: 'Levante UD', shortName: 'Levante', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/100.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        stats: { homeRank: 8, awayRank: 3, homeForm: ['L', 'W', 'W', 'L', 'W'], awayForm: ['D', 'W', 'D', 'W', 'L'], homeGoalsAvg: 1.6, awayGoalsAvg: 1.3, h2hSummary: 'Derbi de la Comunidad Valenciana' },
        probabilities: { p1: 37, px: 31, p2: 32 }
      },
      {
        id: 'j10-13',
        order: 13,
        isPleno: false,
        homeTeam: { id: 'cadiz', name: 'Cádiz CF', shortName: 'Cádiz', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/87.png' },
        awayTeam: { id: 'santander', name: 'Racing de Santander', shortName: 'Racing', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        realScore: { home: 0, away: 1 },
        realSign: '2',
        stats: { homeRank: 17, awayRank: 1, homeForm: ['D', 'L', 'L', 'W', 'L'], awayForm: ['W', 'W', 'W', 'L', 'W'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.9, h2hSummary: 'El líder no perdonó' },
        probabilities: { p1: 29, px: 31, p2: 40 }
      },
      {
        id: 'j10-14',
        order: 14,
        isPleno: false,
        homeTeam: { id: 'granada', name: 'Granada CF', shortName: 'Granada', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png' },
        awayTeam: { id: 'tenerife', name: 'CD Tenerife', shortName: 'Tenerife', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png' },
        realScore: { home: 4, away: 0 },
        realSign: '1',
        stats: { homeRank: 6, awayRank: 22, homeForm: ['W', 'W', 'D', 'D', 'D'], awayForm: ['L', 'L', 'W', 'L', 'D'], homeGoalsAvg: 1.5, awayGoalsAvg: 0.7, h2hSummary: 'Goleada plácida en Los Cármenes' },
        probabilities: { p1: 67, px: 22, p2: 11 }
      },
      {
        id: 'j10-15',
        order: 15,
        isPleno: true,
        homeTeam: { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
        awayTeam: { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
        realScore: { home: 5, away: 1 },
        realSign: '1',
        realPleno: { home: 'M', away: '1' },
        stats: { homeRank: 1, awayRank: 12, homeForm: ['W', 'W', 'L', 'W', 'W'], awayForm: ['W', 'D', 'W', 'L', 'W'], homeGoalsAvg: 3.1, awayGoalsAvg: 1.1, h2hSummary: 'Festival en Montjuïc' },
        probabilities: { p1: 82, px: 12, p2: 6 }
      }
    ]
  },
  {
    jornadaNumber: 9,
    season: '2024-2025',
    title: 'Jornada 9 de LaLiga',
    dateRange: '4 - 6 oct 2024',
    isCompleted: true,
    scrutiny: {
      recaudacion: 4490120.00,
      bote: 950000.00,
      categories: {
        p15: { category: '15', name: 'Pleno al 15', winners: 1, prizePerWinner: 1290450.00 },
        p14: { category: '14', name: '14 Aciertos', winners: 6, prizePerWinner: 68100.00 },
        p13: { category: '13', name: '13 Aciertos', winners: 168, prizePerWinner: 2140.00 },
        p12: { category: '12', name: '12 Aciertos', winners: 1950, prizePerWinner: 184.20 },
        p11: { category: '11', name: '11 Aciertos', winners: 15200, prizePerWinner: 23.60 },
        p10: { category: '10', name: '10 Aciertos', winners: 71000, prizePerWinner: 6.00 }
      }
    },
    matches: [
      {
        id: 'j9-1',
        order: 1,
        isPleno: false,
        homeTeam: { id: 'leganes', name: 'CD Leganés', shortName: 'Leganés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/989.png' },
        awayTeam: { id: 'valencia', name: 'Valencia CF', shortName: 'Valencia', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        realScore: { home: 0, away: 0 },
        realSign: 'X',
        stats: { homeRank: 16, awayRank: 18, homeForm: ['D', 'D', 'L', 'D', 'L'], awayForm: ['L', 'D', 'W', 'L', 'L'], homeGoalsAvg: 0.6, awayGoalsAvg: 0.6, h2hSummary: 'Partido cerrado y con poco riesgo' },
        probabilities: { p1: 34, px: 38, p2: 28 }
      },
      {
        id: 'j9-2',
        order: 2,
        isPleno: false,
        homeTeam: { id: 'espanyol', name: 'RCD Espanyol', shortName: 'Espanyol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png' },
        awayTeam: { id: 'mallorca', name: 'RCD Mallorca', shortName: 'Mallorca', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
        realScore: { home: 2, away: 1 },
        realSign: '1',
        stats: { homeRank: 14, awayRank: 6, homeForm: ['L', 'L', 'L', 'W', 'W'], awayForm: ['W', 'W', 'W', 'L', 'W'], homeGoalsAvg: 0.9, awayGoalsAvg: 1.0, h2hSummary: 'Espanyol frena la racha de Arrasate' },
        probabilities: { p1: 36, px: 33, p2: 31 }
      },
      {
        id: 'j9-3',
        order: 3,
        isPleno: false,
        homeTeam: { id: 'getafe', name: 'Getafe CF', shortName: 'Getafe', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/92.png' },
        awayTeam: { id: 'osasuna', name: 'CA Osasuna', shortName: 'Osasuna', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 15, awayRank: 7, homeForm: ['W', 'L', 'D', 'L', 'L'], awayForm: ['W', 'D', 'W', 'L', 'W'], homeGoalsAvg: 0.8, awayGoalsAvg: 1.5, h2hSummary: 'Típico empate en el Coliseum' },
        probabilities: { p1: 38, px: 37, p2: 25 }
      },
      {
        id: 'j9-4',
        order: 4,
        isPleno: false,
        homeTeam: { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'Las Palmas', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png' },
        awayTeam: { id: 'celta', name: 'RC Celta', shortName: 'Celta', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png' },
        realScore: { home: 0, away: 1 },
        realSign: '2',
        stats: { homeRank: 20, awayRank: 10, homeForm: ['L', 'D', 'L', 'L', 'L'], awayForm: ['D', 'L', 'W', 'L', 'W'], homeGoalsAvg: 0.9, awayGoalsAvg: 1.8, h2hSummary: 'Borja Iglesias dio el triunfo a 9 gallegos' },
        probabilities: { p1: 32, px: 30, p2: 38 }
      },
      {
        id: 'j9-5',
        order: 5,
        isPleno: false,
        homeTeam: { id: 'valladolid', name: 'Real Valladolid', shortName: 'Valladolid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        awayTeam: { id: 'rayo', name: 'Rayo Vallecano', shortName: 'Rayo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png' },
        realScore: { home: 1, away: 2 },
        realSign: '2',
        stats: { homeRank: 19, awayRank: 9, homeForm: ['L', 'L', 'D', 'L', 'D'], awayForm: ['D', 'D', 'D', 'W', 'L'], homeGoalsAvg: 0.5, awayGoalsAvg: 1.1, h2hSummary: 'De Frutos con doblete' },
        probabilities: { p1: 35, px: 34, p2: 31 }
      },
      {
        id: 'j9-6',
        order: 6,
        isPleno: false,
        homeTeam: { id: 'girona', name: 'Girona FC', shortName: 'Girona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png' },
        awayTeam: { id: 'athletic', name: 'Athletic Club', shortName: 'Athletic', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },
        realScore: { home: 2, away: 1 },
        realSign: '1',
        stats: { homeRank: 12, awayRank: 5, homeForm: ['D', 'L', 'D', 'L', 'W'], awayForm: ['D', 'W', 'W', 'W', 'L'], homeGoalsAvg: 1.2, awayGoalsAvg: 1.7, h2hSummary: 'Gazzaniga paró 3 penaltis' },
        probabilities: { p1: 40, px: 31, p2: 29 }
      },
      {
        id: 'j9-7',
        order: 7,
        isPleno: false,
        homeTeam: { id: 'alaves', name: 'Deportivo Alavés', shortName: 'Alavés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png' },
        awayTeam: { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
        realScore: { home: 0, away: 3 },
        realSign: '2',
        stats: { homeRank: 11, awayRank: 1, homeForm: ['L', 'L', 'W', 'W', 'L'], awayForm: ['L', 'W', 'W', 'W', 'W'], homeGoalsAvg: 1.4, awayGoalsAvg: 3.1, h2hSummary: 'Hat-trick fulgurante de Lewandowski' },
        probabilities: { p1: 12, px: 20, p2: 68 }
      },
      {
        id: 'j9-8',
        order: 8,
        isPleno: false,
        homeTeam: { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
        awayTeam: { id: 'betis', name: 'Real Betis', shortName: 'Betis', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
        realScore: { home: 1, away: 0 },
        realSign: '1',
        stats: { homeRank: 13, awayRank: 8, homeForm: ['D', 'W', 'L', 'W', 'L'], awayForm: ['W', 'L', 'W', 'L', 'W'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.1, h2hSummary: 'Gran derbi sevillano definido por penalti' },
        probabilities: { p1: 41, px: 34, p2: 25 }
      },
      {
        id: 'j9-9',
        order: 9,
        isPleno: false,
        homeTeam: { id: 'realsociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png' },
        awayTeam: { id: 'atm', name: 'Atlético de Madrid', shortName: 'Atlético', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
        realScore: { home: 1, away: 1 },
        realSign: 'X',
        stats: { homeRank: 14, awayRank: 3, homeForm: ['W', 'L', 'D', 'L', 'L'], awayForm: ['D', 'W', 'D', 'W', 'W'], homeGoalsAvg: 0.7, awayGoalsAvg: 1.6, h2hSummary: 'Sucic empató con un misil desde fuera' },
        probabilities: { p1: 29, px: 35, p2: 36 }
      },
      {
        id: 'j9-10',
        order: 10,
        isPleno: false,
        homeTeam: { id: 'eibar', name: 'SD Eibar', shortName: 'Eibar', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/91.png' },
        awayTeam: { id: 'sporting', name: 'Real Sporting', shortName: 'Sporting', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        realScore: { home: 1, away: 3 },
        realSign: '2',
        stats: { homeRank: 7, awayRank: 6, homeForm: ['W', 'L', 'D', 'W', 'D'], awayForm: ['W', 'W', 'L', 'W', 'D'], homeGoalsAvg: 1.2, awayGoalsAvg: 1.3, h2hSummary: 'Sporting en racha victoriosa' },
        probabilities: { p1: 44, px: 31, p2: 25 }
      },
      {
        id: 'j9-11',
        order: 11,
        isPleno: false,
        homeTeam: { id: 'zaragoza', name: 'Real Zaragoza', shortName: 'Zaragoza', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/99.png' },
        awayTeam: { id: 'santander', name: 'Racing de Santander', shortName: 'Racing', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        realScore: { home: 2, away: 3 },
        realSign: '2',
        stats: { homeRank: 3, awayRank: 1, homeForm: ['W', 'L', 'W', 'L', 'W'], awayForm: ['W', 'W', 'L', 'W', 'W'], homeGoalsAvg: 1.8, awayGoalsAvg: 1.9, h2hSummary: 'Partidazo por la cima de LaLiga' },
        probabilities: { p1: 43, px: 29, p2: 28 }
      },
      {
        id: 'j9-12',
        order: 12,
        isPleno: false,
        homeTeam: { id: 'oviedo', name: 'Real Oviedo', shortName: 'Oviedo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
        awayTeam: { id: 'almeria', name: 'UD Almería', shortName: 'Almería', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3748.png' },
        realScore: { home: 3, away: 2 },
        realSign: '1',
        stats: { homeRank: 8, awayRank: 18, homeForm: ['D', 'W', 'W', 'D', 'L'], awayForm: ['L', 'D', 'L', 'W', 'L'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.5, h2hSummary: 'Oviedo remontó en el Tartiere' },
        probabilities: { p1: 48, px: 29, p2: 23 }
      },
      {
        id: 'j9-13',
        order: 13,
        isPleno: false,
        homeTeam: { id: 'levante', name: 'Levante UD', shortName: 'Levante', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/100.png' },
        awayTeam: { id: 'oviedo_r', name: 'Real Oviedo B', shortName: 'Eldense', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/106.png' },
        realScore: { home: 0, away: 0 },
        realSign: 'X',
        stats: { homeRank: 4, awayRank: 13, homeForm: ['W', 'D', 'W', 'L', 'W'], awayForm: ['D', 'L', 'W', 'D', 'L'], homeGoalsAvg: 1.5, awayGoalsAvg: 0.9, h2hSummary: 'Defensas cerradas en Orriols' },
        probabilities: { p1: 58, px: 27, p2: 15 }
      },
      {
        id: 'j9-14',
        order: 14,
        isPleno: false,
        homeTeam: { id: 'malaga', name: 'Málaga CF', shortName: 'Málaga', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/241.png' },
        awayTeam: { id: 'la_coruna', name: 'RC Deportivo', shortName: 'Deportivo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/87.png' },
        realScore: { home: 0, away: 0 },
        realSign: 'X',
        stats: { homeRank: 12, awayRank: 16, homeForm: ['D', 'D', 'D', 'W', 'D'], awayForm: ['L', 'W', 'D', 'L', 'L'], homeGoalsAvg: 0.9, awayGoalsAvg: 1.0, h2hSummary: 'Empate táctico en La Rosaleda' },
        probabilities: { p1: 39, px: 37, p2: 24 }
      },
      {
        id: 'j9-15',
        order: 15,
        isPleno: true,
        homeTeam: { id: 'realmadrid', name: 'Real Madrid', shortName: 'R. Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
        awayTeam: { id: 'villarreal', name: 'Villarreal CF', shortName: 'Villarreal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        realScore: { home: 2, away: 0 },
        realSign: '1',
        realPleno: { home: '2', away: '0' },
        stats: { homeRank: 2, awayRank: 4, homeForm: ['D', 'W', 'W', 'W', 'D'], awayForm: ['W', 'W', 'L', 'W', 'W'], homeGoalsAvg: 2.1, awayGoalsAvg: 2.1, h2hSummary: 'Valverde y Vinicius decidieron en el Bernabéu' },
        probabilities: { p1: 66, px: 20, p2: 14 }
      }
    ]
  },
  {
    jornadaNumber: 13,
    season: '2024-2025',
    title: 'Jornada 13 de LaLiga (Actual / En juego)',
    dateRange: '8 - 10 nov 2024',
    isCompleted: false,
    matches: [
      {
        id: 'j13-1',
        order: 1,
        isPleno: false,
        homeTeam: { id: 'rayo', name: 'Rayo Vallecano', shortName: 'Rayo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png' },
        awayTeam: { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'Las Palmas', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png' },
        stats: { homeRank: 9, awayRank: 18, homeForm: ['W', 'W', 'L', 'D', 'W'], awayForm: ['L', 'W', 'W', 'L', 'L'], homeGoalsAvg: 1.1, awayGoalsAvg: 1.1, h2hSummary: 'Vallecas con ambiente caliente' },
        probabilities: { p1: 52, px: 29, p2: 19 }
      },
      {
        id: 'j13-2',
        order: 2,
        isPleno: false,
        homeTeam: { id: 'realmadrid', name: 'Real Madrid', shortName: 'R. Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
        awayTeam: { id: 'osasuna', name: 'CA Osasuna', shortName: 'Osasuna', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png' },
        stats: { homeRank: 2, awayRank: 5, homeForm: ['L', 'W', 'W', 'D', 'W'], awayForm: ['W', 'W', 'L', 'W', 'D'], homeGoalsAvg: 2.1, awayGoalsAvg: 1.4, h2hSummary: 'El Madrid obligado a reaccionar tras el Clásico' },
        probabilities: { p1: 74, px: 17, p2: 9 }
      },
      {
        id: 'j13-3',
        order: 3,
        isPleno: false,
        homeTeam: { id: 'villarreal', name: 'Villarreal CF', shortName: 'Villarreal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        awayTeam: { id: 'alaves', name: 'Deportivo Alavés', shortName: 'Alavés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png' },
        stats: { homeRank: 4, awayRank: 14, homeForm: ['W', 'D', 'L', 'W', 'W'], awayForm: ['W', 'L', 'L', 'L', 'L'], homeGoalsAvg: 1.9, awayGoalsAvg: 1.1, h2hSummary: 'El submarino amarillo fuerte en casa' },
        probabilities: { p1: 65, px: 22, p2: 13 }
      },
      {
        id: 'j13-4',
        order: 4,
        isPleno: false,
        homeTeam: { id: 'leganes', name: 'CD Leganés', shortName: 'Leganés', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/989.png' },
        awayTeam: { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png' },
        stats: { homeRank: 15, awayRank: 13, homeForm: ['L', 'W', 'L', 'D', 'D'], awayForm: ['L', 'W', 'L', 'W', 'D'], homeGoalsAvg: 0.8, awayGoalsAvg: 1.0, h2hSummary: 'Butarque suele ser complicado para los visitantes' },
        probabilities: { p1: 34, px: 35, p2: 31 }
      },
      {
        id: 'j13-5',
        order: 5,
        isPleno: false,
        homeTeam: { id: 'betis', name: 'Real Betis', shortName: 'Betis', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png' },
        awayTeam: { id: 'celta', name: 'RC Celta', shortName: 'Celta', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png' },
        stats: { homeRank: 7, awayRank: 10, homeForm: ['D', 'W', 'W', 'L', 'D'], awayForm: ['W', 'L', 'L', 'W', 'D'], homeGoalsAvg: 1.2, awayGoalsAvg: 1.6, h2hSummary: 'Duelo vibrante con buen trato de balón' },
        probabilities: { p1: 51, px: 28, p2: 21 }
      },
      {
        id: 'j13-6',
        order: 6,
        isPleno: false,
        homeTeam: { id: 'mallorca', name: 'RCD Mallorca', shortName: 'Mallorca', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png' },
        awayTeam: { id: 'atm', name: 'Atlético de Madrid', shortName: 'Atlético', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png' },
        stats: { homeRank: 8, awayRank: 3, homeForm: ['L', 'D', 'W', 'L', 'W'], awayForm: ['W', 'L', 'W', 'D', 'W'], homeGoalsAvg: 0.9, awayGoalsAvg: 1.5, h2hSummary: 'Son Moix siempre exige el 100% al Atleti' },
        probabilities: { p1: 27, px: 33, p2: 40 }
      },
      {
        id: 'j13-7',
        order: 7,
        isPleno: false,
        homeTeam: { id: 'getafe', name: 'Getafe CF', shortName: 'Getafe', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/92.png' },
        awayTeam: { id: 'girona', name: 'Girona FC', shortName: 'Girona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9812.png' },
        stats: { homeRank: 16, awayRank: 11, homeForm: ['L', 'D', 'D', 'W', 'L'], awayForm: ['W', 'L', 'W', 'L', 'D'], homeGoalsAvg: 0.7, awayGoalsAvg: 1.3, h2hSummary: 'Contraste entre bloque bajo y juego posicional' },
        probabilities: { p1: 37, px: 34, p2: 29 }
      },
      {
        id: 'j13-8',
        order: 8,
        isPleno: false,
        homeTeam: { id: 'valladolid', name: 'Real Valladolid', shortName: 'Valladolid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png' },
        awayTeam: { id: 'athletic', name: 'Athletic Club', shortName: 'Athletic', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png' },
        stats: { homeRank: 19, awayRank: 6, homeForm: ['L', 'L', 'W', 'L', 'L'], awayForm: ['D', 'D', 'W', 'L', 'D'], homeGoalsAvg: 0.8, awayGoalsAvg: 1.6, h2hSummary: 'Athletic favorito por calidad individual' },
        probabilities: { p1: 21, px: 29, p2: 50 }
      },
      {
        id: 'j13-9',
        order: 9,
        isPleno: false,
        homeTeam: { id: 'realsociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png' },
        awayTeam: { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
        stats: { homeRank: 11, awayRank: 1, homeForm: ['W', 'L', 'W', 'D', 'W'], awayForm: ['W', 'W', 'W', 'W', 'W'], homeGoalsAvg: 1.1, awayGoalsAvg: 3.3, h2hSummary: 'Prueba de fuego para el líder en Anoeta' },
        probabilities: { p1: 24, px: 27, p2: 49 }
      },
      {
        id: 'j13-10',
        order: 10,
        isPleno: false,
        homeTeam: { id: 'sporting', name: 'Real Sporting', shortName: 'Sporting', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        awayTeam: { id: 'granada', name: 'Granada CF', shortName: 'Granada', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3747.png' },
        stats: { homeRank: 4, awayRank: 5, homeForm: ['W', 'W', 'W', 'W', 'L'], awayForm: ['L', 'W', 'W', 'W', 'W'], homeGoalsAvg: 1.6, awayGoalsAvg: 1.6, h2hSummary: 'Dos aspirantes al ascenso cara a cara' },
        probabilities: { p1: 46, px: 30, p2: 24 }
      },
      {
        id: 'j13-11',
        order: 11,
        isPleno: false,
        homeTeam: { id: 'santander', name: 'Racing de Santander', shortName: 'Racing', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        awayTeam: { id: 'burgos', name: 'Burgos CF', shortName: 'Burgos', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6908.png' },
        stats: { homeRank: 1, awayRank: 12, homeForm: ['D', 'W', 'W', 'W', 'W'], awayForm: ['L', 'L', 'D', 'L', 'L'], homeGoalsAvg: 1.9, awayGoalsAvg: 0.9, h2hSummary: 'Derbi regional con El Sardinero lleno' },
        probabilities: { p1: 66, px: 22, p2: 12 }
      },
      {
        id: 'j13-12',
        order: 12,
        isPleno: false,
        homeTeam: { id: 'cadiz', name: 'Cádiz CF', shortName: 'Cádiz', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/87.png' },
        awayTeam: { id: 'cordoba', name: 'Córdoba CF', shortName: 'Córdoba', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png' },
        stats: { homeRank: 17, awayRank: 15, homeForm: ['L', 'W', 'L', 'D', 'L'], awayForm: ['W', 'L', 'W', 'D', 'L'], homeGoalsAvg: 1.0, awayGoalsAvg: 1.0, h2hSummary: 'Derbi andaluz de urgencias' },
        probabilities: { p1: 44, px: 32, p2: 24 }
      },
      {
        id: 'j13-13',
        order: 13,
        isPleno: false,
        homeTeam: { id: 'eibar', name: 'SD Eibar', shortName: 'Eibar', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/91.png' },
        awayTeam: { id: 'racingferrol', name: 'Racing de Ferrol', shortName: 'Ferrol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png' },
        stats: { homeRank: 9, awayRank: 20, homeForm: ['W', 'L', 'W', 'L', 'W'], awayForm: ['D', 'D', 'W', 'D', 'W'], homeGoalsAvg: 1.1, awayGoalsAvg: 0.8, h2hSummary: 'Ipurúa siempre empuja fuerte' },
        probabilities: { p1: 53, px: 29, p2: 18 }
      },
      {
        id: 'j13-14',
        order: 14,
        isPleno: false,
        homeTeam: { id: 'albacete', name: 'Albacete Balompié', shortName: 'Albacete', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/90.png' },
        awayTeam: { id: 'oviedo', name: 'Real Oviedo', shortName: 'Oviedo', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/242.png' },
        stats: { homeRank: 14, awayRank: 6, homeForm: ['D', 'D', 'D', 'L', 'W'], awayForm: ['W', 'L', 'D', 'D', 'W'], homeGoalsAvg: 1.3, awayGoalsAvg: 1.2, h2hSummary: 'El Carlos Belmonte garantiza goles' },
        probabilities: { p1: 36, px: 34, p2: 30 }
      },
      {
        id: 'j13-15',
        order: 15,
        isPleno: true,
        homeTeam: { id: 'espanyol', name: 'RCD Espanyol', shortName: 'Espanyol', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png' },
        awayTeam: { id: 'valencia', name: 'Valencia CF', shortName: 'Valencia', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png' },
        stats: { homeRank: 17, awayRank: 20, homeForm: ['L', 'L', 'L', 'W', 'L'], awayForm: ['D', 'L', 'D', 'L', 'D'], homeGoalsAvg: 0.9, awayGoalsAvg: 0.7, h2hSummary: 'Duelo a cara de perro por el descenso' },
        probabilities: { p1: 41, px: 34, p2: 25 }
      }
    ]
  }
];

export function getJornadaQuiniela(jornadaNumber: number): JornadaQuinielaData | undefined {
  return JORNADAS_QUINIELA_DATA.find(j => j.jornadaNumber === jornadaNumber);
}

export function getAllQuinielaJornadas(): JornadaQuinielaData[] {
  return JORNADAS_QUINIELA_DATA;
}

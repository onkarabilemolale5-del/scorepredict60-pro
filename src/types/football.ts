export type LeagueId =
  | 'PL'      // Premier League
  | 'PD'      // La Liga
  | 'SA'      // Serie A
  | 'BL1'     // Bundesliga
  | 'FL1'     // Ligue 1
  | 'SPL'     // Saudi Pro League
  | 'CL'      // Champions League
  | 'EL'      // Europa League
  | 'ECL';    // Conference League

export interface League {
  id: LeagueId;
  name: string;
  country: string;
  logo: string;
  shortName: string;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface InjurySuspension {
  player: string;
  team: 'home' | 'away';
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  reason: string;
  status: 'Out' | 'Doubtful' | 'Suspended';
  importance: 1 | 2 | 3; // 3 = Star player
}

export interface MatchFormItem {
  opponent: string;
  result: 'W' | 'D' | 'L';
  score: string;
  isHome: boolean;
  date: string;
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  winner: 'home' | 'away' | 'draw';
}

export interface RefereeStats {
  name: string;
  matchesOfficiated: number;
  avgYellowCardsPerGame: number;
  avgRedCardsPerGame: number;
  penaltiesAwardedPerGame: number;
  strictness: 'High' | 'Average' | 'Lenient';
}

export interface LineupPlayer {
  number: number;
  name: string;
  position: string;
}

export interface TeamLineup {
  formation: string; // e.g., '4-3-3', '4-2-3-1'
  startingXI: LineupPlayer[];
  dangerMan: string;
}

export interface AdvancedStatsPrediction {
  // Corners
  corners: {
    projectedTotal: number;
    over8_5Prob: number;
    over9_5Prob: number;
    over10_5Prob: number;
    bestPick: string;
  };
  // Cards
  cards: {
    projectedTotal: number;
    yellowCardsExpected: number;
    redCardProb: number;
    over3_5CardsProb: number;
    over4_5CardsProb: number;
    bestPick: string;
  };
  // Penalties
  penalties: {
    penaltyAwardedProb: number; // e.g. 42%
    recommendation: 'YES' | 'NO';
  };
  // Half time
  halves: {
    firstHalfResult: '1' | 'X' | '2';
    firstHalfResultProb: number;
    firstHalfOver0_5Prob: number;
    secondHalfHighestScoring: boolean;
  };
}

export interface WeightedBreakdown {
  teamFormScore: number;       // 30%
  h2hScore: number;             // 20%
  homeAwayPerformance: number;  // 15%
  injuriesImpactScore: number;  // 15%
  goalsConcededEfficiency: number; // 10%
  refereeTendencyScore: number; // 10%
  summary: string;
}

export interface MatchPrediction {
  scoreline: string;             // e.g. "2-1"
  scorelineProbability: number;  // e.g. 24%
  alternativeScores: { score: string; prob: number }[];
  result1X2: '1' | 'X' | '2';
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  doubleChance: '1X' | '12' | 'X2';
  doubleChanceProb: number;
  overUnder2_5: 'Over 2.5' | 'Under 2.5';
  over2_5Prob: number;
  under2_5Prob: number;
  btts: 'YES' | 'NO';
  bttsProb: number;
  confidenceScore: number;       // 0 to 100
  confidenceLevel: ConfidenceLevel; // 'High' (70%+), 'Medium' (60-69%), 'Low' (<60%)
  twoLineReason: [string, string];
  advancedStats: AdvancedStatsPrediction;
  weightedBreakdown: WeightedBreakdown;
  odds: {
    home: number;
    draw: number;
    away: number;
    over2_5: number;
    under2_5: number;
    bttsYes: number;
  };
}

export interface GoalEvent {
  minute: number;
  extraMinute?: number;
  team: 'home' | 'away';
  scorer: string;
  assist?: string;
  type: 'Normal Goal' | 'Penalty' | 'Own Goal';
  formatted: string; // e.g. "Watkins 22'"
}

export interface MatchFixture {
  id: string;
  leagueId: LeagueId;
  leagueName: string;
  leagueLogo: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  utcDate: string; // ISO string
  venue: string;
  status: 'TIMED' | 'LIVE' | 'FINISHED';
  statusShort?: string; // '1H' | '2H' | 'HT' | 'ET' | 'P' | 'FT' | 'NS'
  liveMinute?: number; // e.g. 67
  goalsList?: GoalEvent[];
  currentScore?: { home: number; away: number };
  homeForm: MatchFormItem[];
  awayForm: MatchFormItem[];
  h2h: H2HMatch[];
  injuries: InjurySuspension[];
  referee: RefereeStats;
  homeLineup: TeamLineup;
  awayLineup: TeamLineup;
  prediction: MatchPrediction;
}

export interface ApiConfig {
  provider: 'football-data' | 'api-football' | 'demo';
  apiKey: string;
  backupApiKey?: string;
  isCustomKeyActive: boolean;
  lastUpdated?: string;
}

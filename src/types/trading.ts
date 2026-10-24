export type SymbolKey = 'XAUUSD' | 'NAS100' | 'EURUSD' | 'GBPUSD' | 'BTCUSD' | string;

export type DailyBias = 'BULLISH' | 'BEARISH';
export type Trend4H = 'HH/HL' | 'LL/LH';
export type SignalState = 'IDLE' | 'BUY_TRIGGERED' | 'SELL_TRIGGERED' | 'WAIT';

export interface SymbolConfig {
  key: string;
  name: string;
  category: 'Metals' | 'Indices' | 'Forex' | 'Crypto';
  currentPrice: number;
  prevClose: number;
  high24h: number;
  low24h: number;
  pipMultiplier: number; // For pip calculation: 0.1 for XAUUSD, 1 for NAS100, 0.0001 for EUR/GBP, 1 for BTC
  pipDisplayDecimals: number;
  lotRiskDivisor: number; // Value per pip per 1.0 standard lot
  defaultSLPips: number;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isRed: boolean;
  isGreen: boolean;
  isOB?: boolean;
  isImpulse?: boolean;
}

export interface OrderBlockData {
  symbol: string;
  bias: DailyBias;
  found: boolean;
  boxLabel: string; // "BEARISH OB-BUY ZONE" or "BEARISH OB-SELL ZONE"
  boxColor: 'green' | 'red';
  obHigh: number;
  obLow: number;
  obMid: number;
  dateFound: string;
  status: 'Valid OB' | 'OB Mitigated';
  buffer: number;
  entry: number;
  sl: number;
  risk: number;
  tp: number;
  riskReward: '1:2';
  candles: Candle[];
}

export interface SetupState {
  symbol: string;
  dailyBias: DailyBias;
  trend4h: Trend4H;
  poiPrice: number;
  hasLiquiditySweep: boolean;
  hasMSS: boolean; // Market Structure Shift
  obPrice: number; // Order Block price
  timeframe15mReady: boolean;
  notes: string;
  orderBlock?: OrderBlockData;
}

export interface EntryCheckResult {
  status: 'ENTRY_BUY' | 'ENTRY_SELL' | 'WAIT';
  message: string;
  triggerPrice: number;
  reasons: string[];
  checklist: {
    biasValid: boolean;
    trendValid: boolean;
    liquidityValid: boolean;
    mssValid: boolean;
    obValid: boolean;
  };
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  poiPrice?: number;
  obPrice?: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl?: number; // In currency
  rrRatio?: number;
  notes?: string;
  setupSnapshot?: {
    dailyBias: DailyBias;
    trend4h: Trend4H;
    mss: boolean;
    liquidity: boolean;
  };
}

export interface LotCalcParams {
  balance: number;
  riskPercent: number;
  slPips: number;
  symbol: string;
  nasContractType?: 'CFD_1' | 'STANDARD_20';
}

export interface LotCalcResult {
  riskAmount: number;
  lotSize: number;
  pipValuePerLot: number;
  slDistancePrice: number;
  tp1to2Price?: number;
  tp1to3Price?: number;
}

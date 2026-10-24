import { SymbolConfig } from '../types/trading';

export const DEFAULT_SYMBOLS: Record<string, SymbolConfig> = {
  XAUUSD: {
    key: 'XAUUSD',
    name: 'Gold / US Dollar',
    category: 'Metals',
    currentPrice: 2652.40,
    prevClose: 2645.20,
    high24h: 2664.80,
    low24h: 2640.10,
    pipMultiplier: 0.1, // 1 pip = 0.10
    pipDisplayDecimals: 2,
    lotRiskDivisor: 10,
    defaultSLPips: 25,
  },
  NAS100: {
    key: 'NAS100',
    name: 'Nasdaq 100 Index',
    category: 'Indices',
    currentPrice: 20420.50,
    prevClose: 20310.00,
    high24h: 20510.25,
    low24h: 20280.00,
    pipMultiplier: 1.0, // 1 pip/point = 1.0
    pipDisplayDecimals: 2,
    lotRiskDivisor: 1,
    defaultSLPips: 40,
  },
  EURUSD: {
    key: 'EURUSD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    currentPrice: 1.08640,
    prevClose: 1.08410,
    high24h: 1.08920,
    low24h: 1.08350,
    pipMultiplier: 0.0001, // 1 pip = 0.0001
    pipDisplayDecimals: 5,
    lotRiskDivisor: 10,
    defaultSLPips: 15,
  },
  GBPUSD: {
    key: 'GBPUSD',
    name: 'British Pound / US Dollar',
    category: 'Forex',
    currentPrice: 1.29780,
    prevClose: 1.29400,
    high24h: 1.30150,
    low24h: 1.29200,
    pipMultiplier: 0.0001,
    pipDisplayDecimals: 5,
    lotRiskDivisor: 10,
    defaultSLPips: 18,
  },
  BTCUSD: {
    key: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    category: 'Crypto',
    currentPrice: 68350.00,
    prevClose: 67120.00,
    high24h: 69400.00,
    low24h: 66800.00,
    pipMultiplier: 1.0,
    pipDisplayDecimals: 1,
    lotRiskDivisor: 1,
    defaultSLPips: 300,
  },
};

export function calculatePipDistance(symbol: string, price1: number, price2: number): number {
  const config = DEFAULT_SYMBOLS[symbol] || DEFAULT_SYMBOLS.XAUUSD;
  const diff = Math.abs(price1 - price2);
  const pips = diff / config.pipMultiplier;
  return Math.round(pips * 10) / 10;
}

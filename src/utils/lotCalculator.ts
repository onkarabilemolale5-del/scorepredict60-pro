import { LotCalcParams, LotCalcResult } from '../types/trading';

export function calculateLotSize(params: LotCalcParams): LotCalcResult {
  const { balance, riskPercent, slPips, symbol, nasContractType = 'CFD_1' } = params;

  const riskAmount = Math.max(0, balance * (riskPercent / 100));

  if (slPips <= 0 || riskAmount <= 0) {
    return {
      riskAmount,
      lotSize: 0,
      pipValuePerLot: 0,
      slDistancePrice: 0,
    };
  }

  let pipValuePerLot = 10; // Default forex standard $10/pip for 1.0 lot
  let slDistancePrice = 0;

  const cleanSymbol = symbol.toUpperCase().trim();

  if (cleanSymbol === 'XAUUSD' || cleanSymbol.includes('GOLD')) {
    // 1 Standard Lot of XAUUSD = 100 Troy Oz
    // 1 Pip = $0.10 price difference (e.g., 2650.00 to 2650.10)
    // 1 Pip on 1.0 lot = $0.10 * 100 = $10.00
    // A $1.00 move = 10 pips = $100 on 1.0 lot
    pipValuePerLot = 10.0;
    slDistancePrice = slPips * 0.10;
  } else if (cleanSymbol === 'NAS100' || cleanSymbol.includes('USTEC') || cleanSymbol.includes('US100') || cleanSymbol.includes('NQ')) {
    // NAS100 points
    if (nasContractType === 'STANDARD_20') {
      pipValuePerLot = 20.0; // 1 full futures contract = $20/pt
    } else {
      pipValuePerLot = 1.0; // Standard retail CFD (FTMO, IC Markets, etc.) = $1 per 1 point move per 1.0 lot
    }
    slDistancePrice = slPips;
  } else if (cleanSymbol === 'BTCUSD' || cleanSymbol.includes('BTC')) {
    // 1 Standard Lot = 1 BTC
    // 1 Pip/dollar move = $1.00 per lot
    pipValuePerLot = 1.0;
    slDistancePrice = slPips;
  } else if (cleanSymbol === 'EURUSD' || cleanSymbol === 'GBPUSD' || cleanSymbol === 'AUDUSD' || cleanSymbol === 'NZDUSD') {
    // Standard Forex Pair where USD is quote currency
    // 1 pip = 0.0001 = $10 per 1.0 standard lot
    pipValuePerLot = 10.0;
    slDistancePrice = slPips * 0.0001;
  } else {
    // Generic default
    pipValuePerLot = 10.0;
    slDistancePrice = slPips * 0.10;
  }

  const rawLotSize = riskAmount / (slPips * pipValuePerLot);
  // Clamp to minimum 0.01 lot (micro lot), rounded to 2 decimal places
  const lotSize = Math.max(0.01, Math.floor(rawLotSize * 100) / 100);

  return {
    riskAmount,
    lotSize,
    pipValuePerLot,
    slDistancePrice,
  };
}

export function formatPrice(price: number, symbol: string): string {
  if (symbol.includes('EUR') || symbol.includes('GBP')) {
    return price.toFixed(5);
  }
  if (symbol.includes('NAS')) {
    return price.toFixed(2);
  }
  if (symbol.includes('BTC')) {
    return price.toFixed(1);
  }
  return price.toFixed(2);
}

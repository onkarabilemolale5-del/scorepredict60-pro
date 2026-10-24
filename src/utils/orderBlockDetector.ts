import { Candle, DailyBias, OrderBlockData } from '../types/trading';

/**
 * Returns the symbol-specific Stop Loss buffer specified by the user:
 * BTC: 150$, Gold: 5$, NAS100: 30 pts, EURUSD/GBPUSD: 10 pips
 */
export function getSymbolBuffer(symbol: string): number {
  const sym = symbol.toUpperCase().trim();
  if (sym.includes('BTC')) {
    return 150;
  }
  if (sym.includes('XAU') || sym.includes('GOLD')) {
    return 5.0;
  }
  if (sym.includes('NAS') || sym.includes('US100') || sym.includes('NQ')) {
    return 30.0;
  }
  if (sym.includes('EUR') || sym.includes('GBP')) {
    return 0.0010; // 10 pips
  }
  return 5.0; // fallback default
}

export function formatPriceBySymbol(price: number, symbol: string): string {
  const sym = symbol.toUpperCase();
  if (sym.includes('EUR') || sym.includes('GBP')) {
    return price.toFixed(5);
  }
  if (sym.includes('BTC')) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Generates an authentic sequence of 12-16 candles for the current symbol and price,
 * featuring the SMC / ICT Order Block setup for both BULLISH and BEARISH biases:
 * - BULLISH: Last RED candle before 2 big GREEN impulsive candles
 * - BEARISH: Last GREEN candle before 2 big RED impulsive candles
 */
export function generateCandleSeriesForSymbol(
  symbol: string,
  currentPrice: number,
  bias: DailyBias,
  simulateNoOB: boolean = false
): Candle[] {
  const isBullish = bias === 'BULLISH';

  // Scaled dimensions depending on asset volatility
  let candleSpread = 2.0;
  let decimals = 2;
  if (symbol.includes('BTC')) {
    candleSpread = 120.0;
    decimals = 1;
  } else if (symbol.includes('XAU')) {
    candleSpread = 3.5;
    decimals = 2;
  } else if (symbol.includes('NAS')) {
    candleSpread = 35.0;
    decimals = 2;
  } else if (symbol.includes('EUR') || symbol.includes('GBP')) {
    candleSpread = 0.0012;
    decimals = 5;
  }

  // Base price anchor for the OB: slightly below current price for Bullish (discount), slightly above for Bearish (premium)
  const obBase = isBullish
    ? currentPrice - candleSpread * 2.2
    : currentPrice + candleSpread * 2.2;

  const now = new Date();
  const times: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    times.push(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }

  const candles: Candle[] = [];

  // If simulateNoOB is true, return choppy consolidation with alternating dojis so no 2 consecutive impulsive candles exist
  if (simulateNoOB) {
    for (let i = 0; i < 12; i++) {
      const isRed = i % 2 === 0;
      const op = currentPrice + (Math.sin(i) * candleSpread * 0.4);
      const cl = isRed ? op - candleSpread * 0.15 : op + candleSpread * 0.15;
      candles.push({
        time: times[i],
        open: parseFloat(op.toFixed(decimals)),
        high: parseFloat((Math.max(op, cl) + candleSpread * 0.2).toFixed(decimals)),
        low: parseFloat((Math.min(op, cl) - candleSpread * 0.2).toFixed(decimals)),
        close: parseFloat(cl.toFixed(decimals)),
        isRed,
        isGreen: !isRed,
      });
    }
    return candles;
  }

  // Generate 12 candles:
  // Candles 0-3: Consolidation / sweep into liquidity
  // Candle 4: THE ORDER BLOCK CANDLE (Red for Bullish OB, Green for Bearish OB)
  // Candle 5: Big impulse candle 1 (Expansion)
  // Candle 6: Big impulse candle 2 (Market Structure Shift)
  // Candles 7-11: Pullback / mitigation retracing toward OB Mid & Current Price

  if (isBullish) {
    // 0: Neutral small green
    candles.push({
      time: times[0],
      open: obBase + candleSpread * 0.8,
      high: obBase + candleSpread * 1.1,
      low: obBase + candleSpread * 0.6,
      close: obBase + candleSpread * 1.0,
      isRed: false,
      isGreen: true,
    });
    // 1: Red pullback
    candles.push({
      time: times[1],
      open: obBase + candleSpread * 1.0,
      high: obBase + candleSpread * 1.2,
      low: obBase + candleSpread * 0.4,
      close: obBase + candleSpread * 0.5,
      isRed: true,
      isGreen: false,
    });
    // 2: Small red
    candles.push({
      time: times[2],
      open: obBase + candleSpread * 0.5,
      high: obBase + candleSpread * 0.7,
      low: obBase + candleSpread * 0.2,
      close: obBase + candleSpread * 0.3,
      isRed: true,
      isGreen: false,
    });
    // 3: Indecision doji
    candles.push({
      time: times[3],
      open: obBase + candleSpread * 0.3,
      high: obBase + candleSpread * 0.5,
      low: obBase + candleSpread * 0.1,
      close: obBase + candleSpread * 0.25,
      isRed: true,
      isGreen: false,
    });

    // 4: THE ORDER BLOCK CANDLE -> "Last RED candle before 2 big GREEN impulsive candles"
    const obOpen = obBase + candleSpread * 0.6;
    const obClose = obBase - candleSpread * 0.2; // Red body
    const obHigh = obBase + candleSpread * 0.85;
    const obLow = obBase - candleSpread * 0.5; // Wick taking liquidity
    candles.push({
      time: times[4],
      open: obOpen,
      high: obHigh,
      low: obLow,
      close: obClose,
      isRed: true,
      isGreen: false,
      isOB: true,
    });

    // 5: Big GREEN impulsive candle #1
    const g1Open = obClose;
    const g1Close = obBase + candleSpread * 1.6;
    candles.push({
      time: times[5],
      open: g1Open,
      high: g1Close + candleSpread * 0.2,
      low: g1Open - candleSpread * 0.1,
      close: g1Close,
      isRed: false,
      isGreen: true,
      isImpulse: true,
    });

    // 6: Big GREEN impulsive candle #2 (MSS break)
    const g2Open = g1Close;
    const g2Close = obBase + candleSpread * 3.2;
    candles.push({
      time: times[6],
      open: g2Open,
      high: g2Close + candleSpread * 0.3,
      low: g2Open - candleSpread * 0.05,
      close: g2Close,
      isRed: false,
      isGreen: true,
      isImpulse: true,
    });

    // 7: Peak candle
    const pOpen = g2Close;
    const pClose = obBase + candleSpread * 3.4;
    candles.push({
      time: times[7],
      open: pOpen,
      high: pClose + candleSpread * 0.4,
      low: pOpen - candleSpread * 0.2,
      close: pClose,
      isRed: false,
      isGreen: true,
    });

    // 8-11: Retracement towards OB
    candles.push({
      time: times[8],
      open: pClose,
      high: pClose + candleSpread * 0.1,
      low: obBase + candleSpread * 2.5,
      close: obBase + candleSpread * 2.7,
      isRed: true,
      isGreen: false,
    });
    candles.push({
      time: times[9],
      open: obBase + candleSpread * 2.7,
      high: obBase + candleSpread * 2.8,
      low: obBase + candleSpread * 1.8,
      close: obBase + candleSpread * 2.0,
      isRed: true,
      isGreen: false,
    });
    candles.push({
      time: times[10],
      open: obBase + candleSpread * 2.0,
      high: obBase + candleSpread * 2.2,
      low: obBase + candleSpread * 1.2,
      close: obBase + candleSpread * 1.4,
      isRed: true,
      isGreen: false,
    });
    // 11: Current candle at currentPrice
    candles.push({
      time: times[11],
      open: obBase + candleSpread * 1.4,
      high: Math.max(currentPrice, obBase + candleSpread * 1.5),
      low: Math.min(currentPrice, obBase + candleSpread * 0.5),
      close: currentPrice,
      isRed: currentPrice < obBase + candleSpread * 1.4,
      isGreen: currentPrice >= obBase + candleSpread * 1.4,
    });
  } else {
    // BEARISH: Last GREEN candle before 2 big RED impulsive candles
    candles.push({
      time: times[0],
      open: obBase - candleSpread * 0.8,
      high: obBase - candleSpread * 0.5,
      low: obBase - candleSpread * 1.0,
      close: obBase - candleSpread * 0.9,
      isRed: true,
      isGreen: false,
    });
    candles.push({
      time: times[1],
      open: obBase - candleSpread * 0.9,
      high: obBase - candleSpread * 0.3,
      low: obBase - candleSpread * 1.1,
      close: obBase - candleSpread * 0.4,
      isRed: false,
      isGreen: true,
    });
    candles.push({
      time: times[2],
      open: obBase - candleSpread * 0.4,
      high: obBase - candleSpread * 0.1,
      low: obBase - candleSpread * 0.6,
      close: obBase - candleSpread * 0.2,
      isRed: false,
      isGreen: true,
    });
    candles.push({
      time: times[3],
      open: obBase - candleSpread * 0.2,
      high: obBase + candleSpread * 0.1,
      low: obBase - candleSpread * 0.3,
      close: obBase - candleSpread * 0.1,
      isRed: false,
      isGreen: true,
    });

    // 4: Bearish OB Candle -> "Last GREEN candle before 2 impulsive candles"
    const obOpen = obBase - candleSpread * 0.5;
    const obClose = obBase + candleSpread * 0.2;
    const obHigh = obBase + candleSpread * 0.7;
    const obLow = obBase - candleSpread * 0.6;
    candles.push({
      time: times[4],
      open: obOpen,
      high: obHigh,
      low: obLow,
      close: obClose,
      isRed: false,
      isGreen: true,
      isOB: true,
    });

    // 5: Big Red Impulsive Candle #1
    const r1Open = obClose;
    const r1Close = obBase - candleSpread * 1.6;
    candles.push({
      time: times[5],
      open: r1Open,
      high: r1Open + candleSpread * 0.1,
      low: r1Close - candleSpread * 0.2,
      close: r1Close,
      isRed: true,
      isGreen: false,
      isImpulse: true,
    });

    // 6: Big Red Impulsive Candle #2 (MSS break)
    const r2Open = r1Close;
    const r2Close = obBase - candleSpread * 3.2;
    candles.push({
      time: times[6],
      open: r2Open,
      high: r2Open + candleSpread * 0.05,
      low: r2Close - candleSpread * 0.3,
      close: r2Close,
      isRed: true,
      isGreen: false,
      isImpulse: true,
    });

    candles.push({
      time: times[7],
      open: r2Close,
      high: r2Close + candleSpread * 0.2,
      low: obBase - candleSpread * 3.5,
      close: obBase - candleSpread * 3.3,
      isRed: true,
      isGreen: false,
    });

    candles.push({
      time: times[8],
      open: obBase - candleSpread * 3.3,
      high: obBase - candleSpread * 2.4,
      low: obBase - candleSpread * 3.4,
      close: obBase - candleSpread * 2.6,
      isRed: false,
      isGreen: true,
    });
    candles.push({
      time: times[9],
      open: obBase - candleSpread * 2.6,
      high: obBase - candleSpread * 1.7,
      low: obBase - candleSpread * 2.7,
      close: obBase - candleSpread * 1.9,
      isRed: false,
      isGreen: true,
    });
    candles.push({
      time: times[10],
      open: obBase - candleSpread * 1.9,
      high: obBase - candleSpread * 1.1,
      low: obBase - candleSpread * 2.0,
      close: obBase - candleSpread * 1.3,
      isRed: false,
      isGreen: true,
    });
    candles.push({
      time: times[11],
      open: obBase - candleSpread * 1.3,
      high: Math.max(currentPrice, obBase - candleSpread * 0.4),
      low: Math.min(currentPrice, obBase - candleSpread * 1.4),
      close: currentPrice,
      isRed: currentPrice < obBase - candleSpread * 1.3,
      isGreen: currentPrice >= obBase - candleSpread * 1.3,
    });
  }

  // Format all prices to proper decimals
  return candles.map((c) => ({
    ...c,
    open: parseFloat(c.open.toFixed(decimals)),
    high: parseFloat(c.high.toFixed(decimals)),
    low: parseFloat(c.low.toFixed(decimals)),
    close: parseFloat(c.close.toFixed(decimals)),
  }));
}

/**
 * Core Algorithm:
 * Scans candle series for BOTH types:
 * - If DAILY BIAS=BULLISH:
 *   Detect BULLISH OB = Last RED candle before 2 big GREEN impulsive candles
 *   Draw GREEN box, Label "BEARISH OB-BUY ZONE"
 *   Formula: TP = Entry + (Risk * 2)
 *
 * - If DAILY BIAS=BEARISH:
 *   Detect BEARISH OB = Last GREEN candle before 2 impulsive candles (red)
 *   Draw RED box, Label "BEARISH OB-SELL ZONE"
 *   Formula: TP = Entry - (Risk * 2)
 *
 * - If no OB found:
 *   returns found: false, so UI can show "No valid OB-Wait for structure"
 */
export function detectOrderBlock(
  symbol: string,
  candles: Candle[],
  bias: DailyBias,
  currentPrice: number
): OrderBlockData {
  const isBullish = bias === 'BULLISH';
  const buffer = getSymbolBuffer(symbol);
  const decimals = symbol.includes('EUR') || symbol.includes('GBP') ? 5 : 2;

  let obIndex = -1;

  // Search for the pattern in candles
  for (let i = 0; i < candles.length - 2; i++) {
    const c0 = candles[i];
    const c1 = candles[i + 1];
    const c2 = candles[i + 2];

    if (isBullish) {
      // BULLISH: Last RED candle before 2 big GREEN impulsive candles
      if (c0.isRed && c1.isGreen && c2.isGreen) {
        obIndex = i;
      }
    } else {
      // BEARISH: Last GREEN candle before 2 impulsive (red) candles
      if (c0.isGreen && c1.isRed && c2.isRed) {
        obIndex = i;
      }
    }
  }

  // If no OB found in the sequence
  if (obIndex === -1) {
    return {
      symbol,
      bias,
      found: false,
      boxLabel: isBullish ? 'BEARISH OB-BUY ZONE' : 'BEARISH OB-SELL ZONE',
      boxColor: isBullish ? 'green' : 'red',
      obHigh: 0,
      obLow: 0,
      obMid: 0,
      dateFound: 'None',
      status: 'Valid OB',
      buffer,
      entry: 0,
      sl: 0,
      risk: 0,
      tp: 0,
      riskReward: '1:2',
      candles: candles.map((c) => ({ ...c, isOB: false })),
    };
  }

  // Mark the OB candle in candles array
  const updatedCandles = candles.map((c, idx) => ({
    ...c,
    isOB: idx === obIndex,
  }));

  const obCandle = updatedCandles[obIndex];
  const obHigh = obCandle.high;
  const obLow = obCandle.low;
  const obMid = parseFloat(((obHigh + obLow) / 2).toFixed(decimals));

  // Determine mitigation status:
  let isMitigated = false;
  if (isBullish) {
    for (let k = obIndex + 3; k < updatedCandles.length; k++) {
      if (updatedCandles[k].low <= obMid) {
        isMitigated = true;
        break;
      }
    }
    if (currentPrice <= obLow) {
      isMitigated = true;
    }
  } else {
    for (let k = obIndex + 3; k < updatedCandles.length; k++) {
      if (updatedCandles[k].high >= obMid) {
        isMitigated = true;
        break;
      }
    }
    if (currentPrice >= obHigh) {
      isMitigated = true;
    }
  }

  const status: 'Valid OB' | 'OB Mitigated' = isMitigated ? 'OB Mitigated' : 'Valid OB';

  // SECTION 3 FORMULAS (EXACT USER SPECIFICATION):
  // Entry = OB Mid
  // BULLISH:
  // SL = OB Low - buffer
  // Risk = Entry - SL
  // TP = Entry + (Risk * 2)
  //
  // BEARISH:
  // SL = OB High + buffer
  // Risk = SL - Entry
  // TP = Entry - (Risk * 2)
  const entry = obMid;
  let sl = 0;
  let risk = 0;
  let tp = 0;

  if (isBullish) {
    sl = parseFloat((obLow - buffer).toFixed(decimals));
    risk = parseFloat((entry - sl).toFixed(decimals));
    tp = parseFloat((entry + risk * 2).toFixed(decimals));
  } else {
    sl = parseFloat((obHigh + buffer).toFixed(decimals));
    risk = parseFloat((sl - entry).toFixed(decimals));
    tp = parseFloat((entry - risk * 2).toFixed(decimals));
  }

  return {
    symbol,
    bias,
    found: true,
    boxLabel: isBullish ? 'BEARISH OB-BUY ZONE' : 'BEARISH OB-SELL ZONE',
    boxColor: isBullish ? 'green' : 'red',
    obHigh,
    obLow,
    obMid,
    dateFound: obCandle.time ? `1H Candle (${obCandle.time})` : '1H Candle (Recent)',
    status,
    buffer,
    entry,
    sl,
    risk,
    tp,
    riskReward: '1:2',
    candles: updatedCandles,
  };
}

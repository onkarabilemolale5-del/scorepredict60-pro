import React, { useState, useEffect, useMemo } from 'react';
import {
  DailyBias,
  Trend4H,
  SetupState,
  EntryCheckResult,
  OrderBlockData,
} from '../types/trading';
import { soundAlert } from '../utils/audioAlerts';
import { sendAndroidNotification } from '../utils/notifications';
import { calculatePipDistance } from '../utils/livePriceEngine';
import { OrderBlockChart } from './OrderBlockChart';
import { TradingViewChart } from './TradingViewChart';
import { LiveOBResult } from '../utils/candleApiService';
import {
  generateCandleSeriesForSymbol,
  detectOrderBlock,
  getSymbolBuffer,
  formatPriceBySymbol,
} from '../utils/orderBlockDetector';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Lock,
  RefreshCw,
  Box,
  Layers,
  ShieldCheck,
  Target,
  HelpCircle,
} from 'lucide-react';

interface HomeStrategyProps {
  setup: SetupState;
  onUpdateSetup: (updated: Partial<SetupState>) => void;
  currentPrice: number;
  onSaveToJournal: (entry: {
    symbol: string;
    type: 'BUY' | 'SELL';
    entryPrice: number;
    obPrice: number;
    poiPrice: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => void;
  onOpenLotCalc: (symbol: string, entryPrice: number, slPips: number) => void;
}

export const HomeStrategy: React.FC<HomeStrategyProps> = ({
  setup,
  onUpdateSetup,
  currentPrice,
  onSaveToJournal,
  onOpenLotCalc,
}) => {
  const [result, setResult] = useState<EntryCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isScanningOB, setIsScanningOB] = useState(false);
  const [simulateNoOB, setSimulateNoOB] = useState(false);

  // Active Order Block Data
  const [obData, setObData] = useState<OrderBlockData>(() => {
    const candles = generateCandleSeriesForSymbol(setup.symbol, currentPrice || 2652.4, setup.dailyBias, false);
    return detectOrderBlock(setup.symbol, candles, setup.dailyBias, currentPrice || 2652.4);
  });

  // Auto-detect Order Block whenever Symbol, Daily Bias, or simulateNoOB changes
  useEffect(() => {
    const candles = generateCandleSeriesForSymbol(setup.symbol, currentPrice, setup.dailyBias, simulateNoOB);
    const detected = detectOrderBlock(setup.symbol, candles, setup.dailyBias, currentPrice);
    setObData(detected);

    // Synchronize detected OB values into setup state automatically
    if (detected.found) {
      onUpdateSetup({
        obPrice: detected.entry,
        orderBlock: detected,
      });
    } else {
      onUpdateSetup({
        obPrice: 0,
        orderBlock: detected,
      });
    }
  }, [setup.symbol, setup.dailyBias, simulateNoOB]);

  // Manual Trigger to re-detect / scan OB
  const handleAutoDetectOB = () => {
    setIsScanningOB(true);
    setTimeout(() => {
      const candles = generateCandleSeriesForSymbol(setup.symbol, currentPrice, setup.dailyBias, simulateNoOB);
      const detected = detectOrderBlock(setup.symbol, candles, setup.dailyBias, currentPrice);
      setObData(detected);
      if (detected.found) {
        onUpdateSetup({
          obPrice: detected.entry,
          orderBlock: detected,
        });
      } else {
        onUpdateSetup({
          obPrice: 0,
          orderBlock: detected,
        });
      }
      setIsScanningOB(false);
    }, 300);
  };

  // Toggle status between "Valid OB" and "OB Mitigated"
  const handleToggleOBStatus = () => {
    if (!obData.found) return;
    const nextStatus = obData.status === 'Valid OB' ? 'OB Mitigated' : 'Valid OB';
    const updated: OrderBlockData = { ...obData, status: nextStatus };
    setObData(updated);
    onUpdateSetup({ orderBlock: updated });
  };

  // Synchronize Live OB detection from TradingView/Binance chart widget
  const handleLiveOBDetected = (liveOB: LiveOBResult) => {
    if (liveOB.found && liveOB.entry > 0) {
      setObData((prev) => ({
        ...prev,
        found: true,
        entry: liveOB.entry,
        obMid: liveOB.obMid,
        obHigh: liveOB.obHigh,
        obLow: liveOB.obLow,
        sl: liveOB.sl,
        tp: liveOB.tp,
        risk: liveOB.risk,
        status: liveOB.status,
        boxLabel: liveOB.boxLabel,
        dateFound: liveOB.dateFound,
      }));
      onUpdateSetup({
        obPrice: liveOB.entry,
      });
    }
  };

  // Helper calculation for pip distances
  const poiDistancePips = setup.poiPrice > 0 ? calculatePipDistance(setup.symbol, currentPrice, setup.poiPrice) : 0;
  const obDistancePips = obData.found && obData.entry > 0 ? calculatePipDistance(setup.symbol, currentPrice, obData.entry) : 0;

  // Evaluate strategy based on trader's rules
  const evaluateStrategy = (): EntryCheckResult => {
    const reasons: string[] = [];
    const bias = setup.dailyBias;
    const trend = setup.trend4h;
    const mss = setup.hasMSS;
    const liquidity = setup.hasLiquiditySweep;
    const poi = setup.poiPrice;

    // Check if Order Block is found
    if (!obData.found) {
      reasons.push('No valid OB-Wait for structure');
    }

    const ob = obData.found ? obData.entry : 0;

    // 1. Daily Bias
    const biasValid = Boolean(bias);

    // 2. 4H Trend Alignment
    let trendValid = false;
    if (bias === 'BULLISH') {
      if (trend === 'HH/HL') {
        trendValid = true;
      } else {
        reasons.push('4H Trend is LL/LH — conflicts with Daily Bullish Bias');
      }
    } else if (bias === 'BEARISH') {
      if (trend === 'LL/LH') {
        trendValid = true;
      } else {
        reasons.push('4H Trend is HH/HL — conflicts with Daily Bearish Bias');
      }
    }

    // Check POI price
    if (!poi || poi <= 0) {
      reasons.push('POI Price (Supply/Demand zone) is not set');
    }

    // 3. 1 HR Setup: OB + MSS + Liquidity
    const liquidityValid = liquidity === true;
    if (!liquidityValid) {
      reasons.push('Liquidity Sweep is NOT confirmed yet');
    }

    const mssValid = mss === true;
    if (!mssValid) {
      reasons.push('MSS (Market Structure Shift) is NO. Waiting for break of structure');
    }

    const obValid = obData.found && ob > 0;
    if (!obValid && obData.found) {
      reasons.push('Order Block Mid / Price is not detected');
    }

    const isTriggered = biasValid && trendValid && mssValid && obValid && obData.found;
    const triggerPrice = ob > 0 ? ob : currentPrice;

    if (isTriggered) {
      const type = bias === 'BULLISH' ? 'ENTRY_BUY' : 'ENTRY_SELL';
      const typeLabel = bias === 'BULLISH' ? 'BUY' : 'SELL';
      return {
        status: type,
        message: `● ENTRY TRIGGERED - ${typeLabel} at ${formatPriceBySymbol(triggerPrice, setup.symbol)}`,
        triggerPrice,
        reasons: [],
        checklist: {
          biasValid,
          trendValid,
          liquidityValid,
          mssValid,
          obValid,
        },
      };
    }

    return {
      status: 'WAIT',
      message: '○ WAIT',
      triggerPrice: 0,
      reasons,
      checklist: {
        biasValid,
        trendValid,
        liquidityValid,
        mssValid,
        obValid,
      },
    };
  };

  const handleCheckEntry = () => {
    setIsChecking(true);
    setTimeout(() => {
      const res = evaluateStrategy();
      setResult(res);
      setIsChecking(false);

      if (res.status === 'ENTRY_BUY') {
        soundAlert.triggerEntryAlert('BUY', setup.symbol, res.triggerPrice);
        sendAndroidNotification(`● ENTRY TRIGGERED: BUY ${setup.symbol}`, {
          body: `Order Block Mid: ${formatPriceBySymbol(res.triggerPrice, setup.symbol)} | SL: ${formatPriceBySymbol(obData.sl, setup.symbol)} | TP (1:2): ${formatPriceBySymbol(obData.tp, setup.symbol)}`,
        });
      } else if (res.status === 'ENTRY_SELL') {
        soundAlert.triggerEntryAlert('SELL', setup.symbol, res.triggerPrice);
        sendAndroidNotification(`● ENTRY TRIGGERED: SELL ${setup.symbol}`, {
          body: `Order Block Mid: ${formatPriceBySymbol(res.triggerPrice, setup.symbol)} | SL: ${formatPriceBySymbol(obData.sl, setup.symbol)} | TP (1:2): ${formatPriceBySymbol(obData.tp, setup.symbol)}`,
        });
      } else {
        soundAlert.playChime('WAIT');
      }
    }, 250);
  };

  // Quick preset loader
  const loadPreset = (type: 'bullish' | 'bearish' | 'no-ob' | 'reset') => {
    setSimulateNoOB(false);
    if (type === 'bullish') {
      const candles = generateCandleSeriesForSymbol(setup.symbol, currentPrice, 'BULLISH', false);
      const detected = detectOrderBlock(setup.symbol, candles, 'BULLISH', currentPrice);
      setObData(detected);
      onUpdateSetup({
        dailyBias: 'BULLISH',
        trend4h: 'HH/HL',
        poiPrice: currentPrice > 0 ? Math.round((currentPrice - 10) * 100) / 100 : 2645.0,
        hasLiquiditySweep: true,
        hasMSS: true,
        obPrice: detected.entry,
        orderBlock: detected,
        timeframe15mReady: true,
      });
      setResult(null);
    } else if (type === 'bearish') {
      const candles = generateCandleSeriesForSymbol(setup.symbol, currentPrice, 'BEARISH', false);
      const detected = detectOrderBlock(setup.symbol, candles, 'BEARISH', currentPrice);
      setObData(detected);
      onUpdateSetup({
        dailyBias: 'BEARISH',
        trend4h: 'LL/LH',
        poiPrice: currentPrice > 0 ? Math.round((currentPrice + 10) * 100) / 100 : 2665.0,
        hasLiquiditySweep: true,
        hasMSS: true,
        obPrice: detected.entry,
        orderBlock: detected,
        timeframe15mReady: true,
      });
      setResult(null);
    } else if (type === 'no-ob') {
      setSimulateNoOB(true);
      setResult(null);
    } else {
      onUpdateSetup({
        dailyBias: 'BULLISH',
        trend4h: 'HH/HL',
        poiPrice: 0,
        hasLiquiditySweep: false,
        hasMSS: false,
        timeframe15mReady: false,
      });
      setResult(null);
    }
  };

  const is1HReady = setup.hasMSS && setup.hasLiquiditySweep && obData.found && obData.entry > 0;

  // Buffer text description
  const bufferLabel = useMemo(() => {
    const sym = setup.symbol.toUpperCase();
    if (sym.includes('BTC')) return '150$ buffer';
    if (sym.includes('XAU') || sym.includes('GOLD')) return '5$ buffer';
    if (sym.includes('NAS')) return '30 pts buffer';
    return '10 pips buffer';
  }, [setup.symbol]);

  const isBullish = setup.dailyBias === 'BULLISH';

  return (
    <div className="space-y-3 pb-24">
      {/* Symbol & Price Selector Banner */}
      <div className="bg-[#0f172a]/95 border border-gray-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Select Trading Pair
            </label>
            <div className="relative">
              <select
                value={setup.symbol}
                onChange={(e) => onUpdateSetup({ symbol: e.target.value })}
                className="w-full bg-[#1e293b] text-white font-mono font-bold text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="XAUUSD">XAUUSD (Gold / USD)</option>
                <option value="NAS100">NAS100 (Nasdaq 100)</option>
                <option value="EURUSD">EURUSD (Euro / USD)</option>
                <option value="GBPUSD">GBPUSD (Pound / USD)</option>
                <option value="BTCUSD">BTCUSD (Bitcoin / USD)</option>
              </select>
            </div>
          </div>

          <div className="text-right pl-2">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Live Market</div>
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {formatPriceBySymbol(currentPrice, setup.symbol)}
            </div>
          </div>
        </div>

        {/* Quick Setup Presets */}
        <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => loadPreset('bullish')}
              className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold"
            >
              + Bullish OB
            </button>
            <button
              onClick={() => loadPreset('bearish')}
              className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-[11px] font-semibold"
            >
              + Bearish OB
            </button>
            <button
              onClick={() => loadPreset('no-ob')}
              className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-[11px] font-semibold"
              title="Test No Valid OB state"
            >
              No OB state
            </button>
            <button
              onClick={() => loadPreset('reset')}
              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400"
              title="Reset fields"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. TRADINGVIEW / SMC LIVE PRICE CHART WIDGET (Under Select Trading Pair) */}
      <TradingViewChart
        symbol={setup.symbol}
        bias={setup.dailyBias}
        currentPrice={currentPrice}
        onOBDetected={handleLiveOBDetected}
      />

      {/* SECTION 1: DAILY = BIAS */}
      <div
        className={`rounded-xl p-3.5 border transition-all duration-200 ${
          setup.dailyBias === 'BULLISH'
            ? 'bg-gradient-to-r from-emerald-950/40 via-[#0f172a] to-[#0f172a] border-emerald-500/40 shadow-sm'
            : 'bg-gradient-to-r from-rose-950/40 via-[#0f172a] to-[#0f172a] border-rose-500/40 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              DAILY = BIAS
            </h2>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" /> Never trade against bias
          </span>
        </div>

        <p className="text-[11px] text-gray-400 mb-2.5">
          Determine high-timeframe direction. Order Block detection dynamically adapts to this bias.
        </p>

        {/* BULLISH / BEARISH BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onUpdateSetup({ dailyBias: 'BULLISH' });
              setSimulateNoOB(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide transition active:scale-98 ${
              setup.dailyBias === 'BULLISH'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 ring-2 ring-emerald-400'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800 border border-gray-700/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>▲ BULLISH</span>
          </button>

          <button
            onClick={() => {
              onUpdateSetup({ dailyBias: 'BEARISH' });
              setSimulateNoOB(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wide transition active:scale-98 ${
              setup.dailyBias === 'BEARISH'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50 ring-2 ring-rose-400'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800 border border-gray-700/60'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>▼ BEARISH</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: ORDER BLOCK IDENTIFIER (BOTH BULLISH & BEARISH) */}
      <div className={`rounded-xl p-3.5 bg-[#0f172a] border shadow-md space-y-3 ${
        isBullish ? 'border-emerald-500/40' : 'border-rose-500/40'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              isBullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              2
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>ORDER BLOCK IDENTIFIER</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                isBullish ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {isBullish ? 'BULLISH OB SCANNER' : 'BEARISH OB SCANNER'}
              </span>
            </h2>
          </div>

          <button
            onClick={handleAutoDetectOB}
            disabled={isScanningOB}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition ${
              isBullish
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-600/20 hover:bg-rose-600/30 border-rose-500/30 text-rose-300'
            }`}
            title="Scan chart to detect Order Block"
          >
            <RefreshCw className={`w-3 h-3 ${isScanningOB ? 'animate-spin' : ''}`} />
            <span>{isScanningOB ? 'Scanning...' : 'Re-Detect OB'}</span>
          </button>
        </div>

        {/* Auto-detect description banner according to Daily Bias */}
        <div className={`border rounded-lg p-2.5 text-xs flex items-start gap-2 ${
          isBullish
            ? 'bg-[#1e293b]/80 border-emerald-500/20 text-emerald-300/90'
            : 'bg-[#1e293b]/80 border-rose-500/20 text-rose-300/90'
        }`}>
          <Box className={`w-4 h-4 shrink-0 mt-0.5 ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`} />
          <div className="text-[11px] leading-relaxed">
            {isBullish ? (
              <>
                <span className="font-bold text-white">Daily Bias = BULLISH:</span> Detects{' '}
                <span className="text-emerald-400 font-bold uppercase">BULLISH OB</span> = Last{' '}
                <span className="text-rose-400 font-bold uppercase">RED candle</span> before 2 big{' '}
                <span className="text-emerald-400 font-bold uppercase">GREEN impulsive candles</span>.
                Draws <span className="text-emerald-400 font-bold">GREEN box</span> with label{' '}
                <span className="text-emerald-300 font-mono font-bold underline">"BEARISH OB-BUY ZONE"</span>.
              </>
            ) : (
              <>
                <span className="font-bold text-white">Daily Bias = BEARISH:</span> Detects{' '}
                <span className="text-rose-400 font-bold uppercase">BEARISH OB</span> = Last{' '}
                <span className="text-emerald-400 font-bold uppercase">GREEN candle</span> before 2{' '}
                <span className="text-rose-400 font-bold uppercase">impulsive candles</span>.
                Draws <span className="text-rose-400 font-bold">RED box</span> with label{' '}
                <span className="text-rose-300 font-mono font-bold underline">"BEARISH OB-SELL ZONE"</span>.
              </>
            )}
          </div>
        </div>

        {/* If no OB found: show "No valid OB-Wait for structure" */}
        {!obData.found ? (
          <div className="bg-amber-950/20 border-2 border-dashed border-amber-500/40 rounded-xl p-4 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No valid OB-Wait for structure</span>
            </div>
            <p className="text-xs text-gray-300 font-mono max-w-sm mx-auto">
              {isBullish
                ? 'Market has not printed a clean RED candle followed by 2 GREEN impulsive candles. Wait for liquidity sweep and MSS.'
                : 'Market has not printed a clean GREEN candle followed by 2 RED impulsive candles. Wait for liquidity sweep and MSS.'}
            </p>
            <div className="pt-1">
              <button
                onClick={() => setSimulateNoOB(false)}
                className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono"
              >
                Scan for Next OB
              </button>
            </div>
          </div>
        ) : (
          /* Display: OB High, OB Low, OB Mid, Date found */
          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
            <div className="bg-gray-900/90 p-2 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase block">OB High</span>
              <span className="font-bold text-gray-200">
                {formatPriceBySymbol(obData.obHigh, setup.symbol)}
              </span>
            </div>
            <div className="bg-gray-900/90 p-2 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase block">OB Low</span>
              <span className="font-bold text-gray-200">
                {formatPriceBySymbol(obData.obLow, setup.symbol)}
              </span>
            </div>
            <div className={`p-2 rounded-lg border ${
              isBullish ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'
            }`}>
              <span className={`text-[10px] uppercase font-bold block ${
                isBullish ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                OB Mid (Entry)
              </span>
              <span className="font-extrabold text-white text-xs">
                {formatPriceBySymbol(obData.obMid, setup.symbol)}
              </span>
            </div>
            <div className="bg-gray-900/90 p-2 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase block">Date Found</span>
              <span className="font-bold text-gray-200 text-[10px] truncate block">
                {obData.dateFound}
              </span>
            </div>
          </div>
        )}

        {/* Draw green or red rectangle on chart for OB zone */}
        <div>
          <OrderBlockChart obData={obData} currentPrice={currentPrice} />
        </div>

        {/* Status: "Valid OB" or "OB Mitigated" */}
        {obData.found && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 font-medium">Order Block Status:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleOBStatus}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  obData.status === 'Valid OB'
                    ? isBullish
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    obData.status === 'Valid OB'
                      ? isBullish ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span>{obData.status}</span>
                <span className="text-[9px] text-gray-400 opacity-80">(Tap to toggle)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: ENTRY / SL / TP (LOCKED TO 1:2 FOR BOTH BULLISH & BEARISH) */}
      <div className="rounded-xl p-3.5 bg-[#0f172a] border border-blue-500/40 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
              3
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              ENTRY / SL / TP
            </h2>
          </div>

          {/* Show Risk : Reward label "1:2" clearly */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>RISK : REWARD = 1:2</span>
          </div>
        </div>

        {/* If no OB found */}
        {!obData.found ? (
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-amber-300 text-center">
            No valid OB-Wait for structure to auto-calculate Entry, SL, and TP.
          </div>
        ) : (
          <>
            {/* Auto-Calculation Formula Badge */}
            <div className="text-[10px] font-mono text-gray-400 bg-gray-900/80 px-2.5 py-1.5 rounded-lg border border-gray-800 flex items-center justify-between">
              <span>
                {isBullish
                  ? `Formula: SL = OB Low - buffer | TP = Entry + (Risk × 2)`
                  : `Formula: SL = OB High + buffer | TP = Entry - (Risk × 2)`}
              </span>
              <span className="text-cyan-400 font-bold">{bufferLabel}</span>
            </div>

            {/* 3 Parameter Cards: Entry, SL, TP */}
            <div className="grid grid-cols-3 gap-2 font-mono">
              {/* Entry = OB Mid */}
              <div className="bg-gradient-to-b from-[#132c21] to-[#0f172a] border border-emerald-500/40 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-0.5">
                  1. ENTRY
                </span>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {formatPriceBySymbol(obData.entry, setup.symbol)}
                </div>
                <span className="text-[9px] text-gray-400 block mt-0.5">= OB Mid</span>
              </div>

              {/* Stop Loss (SL) */}
              <div className="bg-gradient-to-b from-[#2d1219] to-[#0f172a] border border-rose-500/40 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-rose-400 uppercase font-bold block mb-0.5">
                  2. STOP LOSS (SL)
                </span>
                <div className="text-sm sm:text-base font-extrabold text-rose-300">
                  {formatPriceBySymbol(obData.sl, setup.symbol)}
                </div>
                <span className="text-[9px] text-gray-400 block mt-0.5">
                  {isBullish ? `= OB Low - ${obData.buffer}` : `= OB High + ${obData.buffer}`}
                </span>
              </div>

              {/* Take Profit (TP) -> Locked to 1:2 */}
              <div className="bg-gradient-to-b from-[#0b281f] to-[#0f172a] border-2 border-emerald-500 p-2.5 rounded-xl text-center relative overflow-hidden">
                <div className="absolute top-1 right-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-0.5">
                  3. TAKE PROFIT (TP)
                </span>
                <div className="text-sm sm:text-base font-extrabold text-emerald-300">
                  {formatPriceBySymbol(obData.tp, setup.symbol)}
                </div>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">
                  1:2 Ratio Only
                </span>
              </div>
            </div>

            {/* Risk details & non-editable locked notice */}
            <div className="p-2 rounded-lg bg-gray-900/90 border border-gray-800 text-[11px] font-mono flex items-center justify-between text-gray-300">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Risk = {formatPriceBySymbol(obData.risk, setup.symbol)} | TP locked to 1:2
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">
                {isBullish ? 'TP = Entry + (Risk × 2)' : 'TP = Entry - (Risk × 2)'}
              </span>
            </div>

            {/* Quick action: Load into Position Lot Calculator */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  const slDiff = obData.risk;
                  let pips = slDiff;
                  if (setup.symbol === 'XAUUSD') pips = slDiff * 10;
                  else if (setup.symbol === 'EURUSD' || setup.symbol === 'GBPUSD') pips = slDiff * 10000;
                  onOpenLotCalc(setup.symbol, obData.entry, Math.max(1, Math.round(pips)));
                }}
                className="w-full py-2 px-3 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Load into Position Lot Calculator</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* SECTION 4: 4H = TREND + POI */}
      <div className="rounded-xl p-3.5 bg-[#0f172a]/90 border border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
              4
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              4H = TREND + POI
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Supply / Demand</span>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] text-gray-300 font-medium block mb-1">
              4H Trend Structure:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSetup({ trend4h: 'HH/HL' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition ${
                  setup.trend4h === 'HH/HL'
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300'
                    : 'bg-gray-800/60 border border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                HH / HL (Higher Highs)
              </button>
              <button
                onClick={() => onUpdateSetup({ trend4h: 'LL/LH' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition ${
                  setup.trend4h === 'LL/LH'
                    ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300'
                    : 'bg-gray-800/60 border border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                LL / LH (Lower Lows)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-gray-300 font-medium">
                POI Price (Point of Interest Zone):
              </label>
              {setup.poiPrice > 0 && (
                <span className="text-[10px] font-mono text-cyan-400">
                  {poiDistancePips} pips from live price
                </span>
              )}
            </div>

            <div className="flex gap-1.5">
              <input
                type="number"
                step="any"
                value={setup.poiPrice || ''}
                onChange={(e) => onUpdateSetup({ poiPrice: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 2645.50"
                className="flex-1 bg-[#1e293b] text-white font-mono font-bold text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => onUpdateSetup({ poiPrice: currentPrice })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg shrink-0"
                title="Fill current live price"
              >
                Live Price
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: 1 HR = OB + MSS + LIQUIDITY */}
      <div className="rounded-xl p-3.5 bg-[#0f172a]/90 border border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
              5
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              1 HR = OB + MSS + LIQUIDITY
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
              is1HReady
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {is1HReady ? '1H READY ✓' : '1H PENDING'}
          </span>
        </div>

        <p className="text-[11px] text-gray-400 mb-3">
          Required: Liquidity sweep + Market Structure Shift (MSS) + Last Order Block.
        </p>

        <div className="space-y-2.5">
          {/* Liquidity Sweep Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#1e293b]/60 border border-gray-800">
            <div>
              <div className="text-xs font-bold text-gray-200">Liquidity Sweep:</div>
              <div className="text-[10px] text-gray-400">Did price take out previous high/low?</div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateSetup({ hasLiquiditySweep: true })}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
                  setup.hasLiquiditySweep
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                YES
              </button>
              <button
                onClick={() => onUpdateSetup({ hasLiquiditySweep: false })}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
                  !setup.hasLiquiditySweep
                    ? 'bg-rose-600/80 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* MSS: Yes/No Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#1e293b]/60 border border-gray-800">
            <div>
              <div className="text-xs font-bold text-gray-200">MSS (Market Structure Shift):</div>
              <div className="text-[10px] text-gray-400">Has structure broken in favor of Bias?</div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateSetup({ hasMSS: true })}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
                  setup.hasMSS
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                YES
              </button>
              <button
                onClick={() => onUpdateSetup({ hasMSS: false })}
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
                  !setup.hasMSS
                    ? 'bg-rose-600/80 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Order Block Price (Synced with Section 2/3) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-gray-300 font-medium">
                Last Order Block (OB Mid Price):
              </label>
              {obData.found && obData.entry > 0 && (
                <span className="text-[10px] font-mono text-emerald-400">
                  {obDistancePips} pips away
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="any"
                value={obData.found ? obData.entry : setup.obPrice || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdateSetup({ obPrice: val });
                  setObData((prev) => ({ ...prev, entry: val, obMid: val, found: val > 0 }));
                }}
                placeholder="e.g. 2650.00"
                className="flex-1 bg-[#1e293b] text-white font-mono font-bold text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAutoDetectOB}
                className={`px-2.5 py-1 text-[11px] font-semibold border rounded-lg shrink-0 ${
                  isBullish
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-600/20 hover:bg-rose-600/30 border-rose-500/40 text-rose-300'
                }`}
              >
                Use OB Mid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: 15M / 5M = ENTRY */}
      <div className="rounded-xl p-3.5 bg-[#0f172a]/90 border border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
              6
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              15M / 5M = ENTRY
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Trigger Rule</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#1e293b]/70 border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                is1HReady ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-white">
                {is1HReady ? '1H Ready — Entry Permitted on 15M/5M' : 'Only given entry when 1H is ready'}
              </div>
              <div className="text-[10px] text-gray-400">
                {is1HReady
                  ? `Limit order at OB Mid (${formatPriceBySymbol(obData.entry, setup.symbol)}) | SL: ${formatPriceBySymbol(obData.sl, setup.symbol)} | TP (1:2): ${formatPriceBySymbol(obData.tp, setup.symbol)}`
                  : 'Wait for Liquidity Sweep + MSS + Order Block'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIG PRIMARY BUTTON: CHECK FOR ENTRY */}
      <div className="pt-2">
        <button
          onClick={handleCheckEntry}
          disabled={isChecking}
          className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:scale-98 shadow-lg shadow-indigo-950/60 border border-blue-400/30 flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isChecking ? 'EVALUATING SETUP...' : 'CHECK FOR ENTRY'}</span>
        </button>
      </div>

      {/* RESULT STATUS BANNER */}
      {result && (
        <div
          className={`rounded-2xl p-4 border text-center transition-all duration-300 animate-in fade-in zoom-in-95 ${
            result.status === 'ENTRY_BUY'
              ? 'bg-gradient-to-b from-emerald-950/80 to-[#0a1410] border-emerald-500/80 shadow-2xl shadow-emerald-950/70'
              : result.status === 'ENTRY_SELL'
              ? 'bg-gradient-to-b from-rose-950/80 to-[#140a0e] border-rose-500/80 shadow-2xl shadow-rose-950/70'
              : 'bg-[#111827] border-amber-500/30 shadow-lg'
          }`}
        >
          {result.status === 'ENTRY_BUY' && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                HIGH PROBABILITY SETUP (1:2 R:R)
              </div>

              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                ● ENTRY TRIGGERED - BUY
              </div>

              <div className="text-base text-gray-200 font-mono">
                at OB Mid:{' '}
                <span className="text-white font-extrabold text-xl underline decoration-emerald-500">
                  {formatPriceBySymbol(result.triggerPrice, setup.symbol)}
                </span>
              </div>

              {/* Exact Levels Breakdown */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">Entry (OB Mid)</span>
                  <span className="font-bold text-white">
                    {formatPriceBySymbol(obData.entry, setup.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">SL (OB Low-buff)</span>
                  <span className="font-bold text-rose-300">
                    {formatPriceBySymbol(obData.sl, setup.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">TP (1:2 Locked)</span>
                  <span className="font-bold text-emerald-300">
                    {formatPriceBySymbol(obData.tp, setup.symbol)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-emerald-300/90 font-medium max-w-sm mx-auto">
                Daily Bias is BULLISH. 4H Trend is aligned (HH/HL). Bullish OB confirmed with 1:2 R:R target.
              </p>

              {/* Quick Actions after Entry Trigger */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() =>
                    onSaveToJournal({
                      symbol: setup.symbol,
                      type: 'BUY',
                      entryPrice: result.triggerPrice,
                      obPrice: obData.entry,
                      poiPrice: setup.poiPrice,
                      stopLoss: obData.sl,
                      takeProfit: obData.tp,
                    })
                  }
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log to Journal</span>
                </button>

                <button
                  onClick={() => {
                    const slDiff = obData.risk;
                    let pips = slDiff;
                    if (setup.symbol === 'XAUUSD') pips = slDiff * 10;
                    else if (setup.symbol === 'EURUSD' || setup.symbol === 'GBPUSD') pips = slDiff * 10000;
                    onOpenLotCalc(setup.symbol, result.triggerPrice, Math.max(1, Math.round(pips)));
                  }}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Calculate Lot</span>
                </button>
              </div>
            </div>
          )}

          {result.status === 'ENTRY_SELL' && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono font-bold border border-rose-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                HIGH PROBABILITY SETUP (1:2 R:R)
              </div>

              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
                ● ENTRY TRIGGERED - SELL
              </div>

              <div className="text-base text-gray-200 font-mono">
                at OB Mid:{' '}
                <span className="text-white font-extrabold text-xl underline decoration-rose-500">
                  {formatPriceBySymbol(result.triggerPrice, setup.symbol)}
                </span>
              </div>

              {/* Exact Levels Breakdown */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">Entry (OB Mid)</span>
                  <span className="font-bold text-white">
                    {formatPriceBySymbol(obData.entry, setup.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">SL (OB High+buff)</span>
                  <span className="font-bold text-rose-300">
                    {formatPriceBySymbol(obData.sl, setup.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">TP (1:2 Locked)</span>
                  <span className="font-bold text-emerald-300">
                    {formatPriceBySymbol(obData.tp, setup.symbol)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-rose-300/90 font-medium max-w-sm mx-auto">
                Daily Bias is BEARISH. 4H Trend is aligned (LL/LH). Bearish OB confirmed with 1:2 R:R target.
              </p>

              {/* Quick Actions after Entry Trigger */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() =>
                    onSaveToJournal({
                      symbol: setup.symbol,
                      type: 'SELL',
                      entryPrice: result.triggerPrice,
                      obPrice: obData.entry,
                      poiPrice: setup.poiPrice,
                      stopLoss: obData.sl,
                      takeProfit: obData.tp,
                    })
                  }
                  className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log to Journal</span>
                </button>

                <button
                  onClick={() => {
                    const slDiff = obData.risk;
                    let pips = slDiff;
                    if (setup.symbol === 'XAUUSD') pips = slDiff * 10;
                    else if (setup.symbol === 'EURUSD' || setup.symbol === 'GBPUSD') pips = slDiff * 10000;
                    onOpenLotCalc(setup.symbol, result.triggerPrice, Math.max(1, Math.round(pips)));
                  }}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Calculate Lot</span>
                </button>
              </div>
            </div>
          )}

          {result.status === 'WAIT' && (
            <div className="space-y-2.5">
              <div className="text-2xl font-black text-gray-300 font-mono tracking-wider">
                ○ WAIT
              </div>
              <p className="text-xs text-amber-300 font-medium">
                Do not enter yet. The setup has not satisfied all strategy requirements:
              </p>

              <div className="text-left bg-gray-900/80 rounded-xl p-3 border border-gray-800 space-y-1.5">
                {result.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-rose-300">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-gray-400">
                Patience is your edge. Wait for 1H MSS confirmation and valid Order Block structure.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

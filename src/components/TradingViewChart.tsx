import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TimeFrame,
  fetchLiveCandles,
  detectLiveOrderBlock,
  LiveOBResult,
  getTradingViewSymbol,
  getTradingViewInterval,
} from '../utils/candleApiService';
import { DailyBias, Candle } from '../types/trading';
import { formatPriceBySymbol } from '../utils/orderBlockDetector';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Radio,
  Lock,
  Maximize2,
  ExternalLink,
  RefreshCw,
  Box,
} from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  bias: DailyBias;
  currentPrice: number;
  onOBDetected?: (ob: LiveOBResult) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  bias,
  currentPrice,
  onOBDetected,
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1H');
  const [viewMode, setViewMode] = useState<'smc_ob' | 'tradingview'>('smc_ob');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  // Load and auto-detect live candles when symbol, timeframe, or bias changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchLiveCandles(symbol, timeframe, currentPrice, bias).then((data) => {
      if (!isMounted) return;
      setCandles(data);
      setIsLoading(false);

      const ob = detectLiveOrderBlock(symbol, data, bias, currentPrice);
      if (onOBDetected) {
        onOBDetected(ob);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe, bias]);

  // Keep latest candle close synced with real-time price tick
  useEffect(() => {
    if (candles.length > 0 && currentPrice > 0) {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];
        const updated = [...prev];
        updated[lastIdx] = {
          ...last,
          close: currentPrice,
          high: Math.max(last.high, currentPrice),
          low: Math.min(last.low, currentPrice),
          isRed: currentPrice < last.open,
          isGreen: currentPrice >= last.open,
        };
        return updated;
      });
    }
  }, [currentPrice]);

  const obResult = useMemo<LiveOBResult>(() => {
    if (candles.length === 0) {
      return {
        found: false,
        obCandleIndex: -1,
        obHigh: 0,
        obLow: 0,
        obMid: 0,
        entry: 0,
        sl: 0,
        tp: 0,
        risk: 0,
        dateFound: '',
        status: 'Valid OB',
        boxLabel: '',
        bias,
        candles: [],
      };
    }
    return detectLiveOrderBlock(symbol, candles, bias, currentPrice);
  }, [candles, symbol, bias, currentPrice]);

  // Touch scroll event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 8) {
      setScrollOffset((prev) => {
        const next = prev + diff * 0.4;
        return Math.max(-120, Math.min(120, next));
      });
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  // Dimensions for SVG Candlestick Chart
  const svgWidth = 460;
  const svgHeight = 240;
  const padding = { top: 32, bottom: 26, left: 10, right: 78 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const allPrices = candles
    .flatMap((c) => [c.high, c.low])
    .concat([obResult.obHigh, obResult.obLow, obResult.obMid, obResult.sl, obResult.tp, currentPrice])
    .filter((p) => p > 0);

  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 1;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 2;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (p: number) => {
    return padding.top + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
  };

  const candleSpacing = chartWidth / (candles.length || 1);
  const candleBodyWidth = Math.max(7, candleSpacing * 0.58);

  const obIndex = obResult.obCandleIndex >= 0 ? obResult.obCandleIndex : 4;
  const obXStart = padding.left + obIndex * candleSpacing + candleSpacing / 2 + scrollOffset;
  const obXEnd = svgWidth - padding.right;

  const obHighY = getY(obResult.obHigh);
  const obLowY = getY(obResult.obLow);
  const obMidY = getY(obResult.obMid);
  const rectHeight = Math.max(6, Math.abs(obLowY - obHighY));
  const rectY = Math.min(obHighY, obLowY);

  const slY = getY(obResult.sl);
  const tpY = getY(obResult.tp);
  const currentY = getY(currentPrice);

  const isBullish = bias === 'BULLISH';
  const tvSymbol = getTradingViewSymbol(symbol);
  const tvInterval = getTradingViewInterval(timeframe);

  // TradingView advanced embed iframe URL
  const tvIframeUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
    tvSymbol
  )}&interval=${tvInterval}&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=090d16&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost`;

  return (
    <div className="bg-[#0b101b] border border-gray-800 rounded-2xl p-3 shadow-xl space-y-2.5 w-full overflow-hidden">
      {/* Timeframe Buttons & Chart Mode Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {/* Timeframe Buttons */}
          {(['15M', '1H', '4H', 'Daily'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-gray-800/80 text-gray-400 border-gray-700/80 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}

          {/* Timeframe Role Subtitle */}
          <span className="text-[10px] font-mono text-gray-400 pl-1">
            {timeframe === 'Daily'
              ? '(Daily = for Bias)'
              : timeframe === '4H' || timeframe === '1H'
              ? '(H4/H1 for OB)'
              : '(15M for Entry)'}
          </span>
        </div>

        {/* View Switcher: SMC OB Chart vs TradingView Pro */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-mono">
          <button
            onClick={() => setViewMode('smc_ob')}
            className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
              viewMode === 'smc_ob'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>SMC OB Box</span>
          </button>
          <button
            onClick={() => setViewMode('tradingview')}
            className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
              viewMode === 'tradingview'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3 h-3" />
            <span>TradingView</span>
          </button>
        </div>
      </div>

      {/* Visual OB Box Banner / HUD */}
      <div
        className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between ${
          isBullish
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isBullish ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'
            }`}
          />
          <span className="font-bold tracking-tight truncate text-[11px]">
            {isBullish
              ? `Bullish OB - Entry: ${formatPriceBySymbol(obResult.entry, symbol)} - SL: ${formatPriceBySymbol(obResult.sl, symbol)} - TP: ${formatPriceBySymbol(obResult.tp, symbol)} (1:2)`
              : `Bearish OB - Entry: ${formatPriceBySymbol(obResult.entry, symbol)} - SL: ${formatPriceBySymbol(obResult.sl, symbol)} - TP: ${formatPriceBySymbol(obResult.tp, symbol)} (1:2)`}
          </span>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-900 border border-gray-700 shrink-0 ml-1">
          {timeframe}
        </span>
      </div>

      {/* Main Chart Area */}
      {viewMode === 'smc_ob' ? (
        /* INTERACTIVE TOUCH-SCROLLABLE SMC CANDLESTICK CHART WITH VISUAL OB BOX */
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full bg-[#070b13] border border-gray-800/90 rounded-xl overflow-hidden touch-pan-x cursor-grab active:cursor-grabbing select-none"
        >
          {/* Mobile Swipe Hint */}
          <div className="absolute top-1.5 left-2 z-10 flex items-center gap-1.5 text-[9px] font-mono text-gray-500 pointer-events-none">
            <span>Swipe left/right to scroll</span>
            {isLoading && <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-400" />}
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none overflow-visible">
            <defs>
              <linearGradient id="obGreenBoxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="obRedBoxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
              const y = padding.top + chartHeight * ratio;
              return (
                <line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#172233"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* 2. VISUAL OB BOX ON CHART: Green transparent rectangle for Bullish OB, Red for Bearish */}
            {obResult.found && (
              <g>
                <rect
                  x={obXStart - candleBodyWidth / 2}
                  y={rectY}
                  width={Math.max(20, obXEnd - (obXStart - candleBodyWidth / 2))}
                  height={rectHeight}
                  fill={isBullish ? 'url(#obGreenBoxGrad)' : 'url(#obRedBoxGrad)'}
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  rx="3"
                />

                {/* Box Floating Label on Chart */}
                <g transform={`translate(${Math.max(obXStart + 2, padding.left + 4)}, ${Math.max(padding.top + 2, rectY - 14)})`}>
                  <rect
                    width="230"
                    height="13"
                    rx="2"
                    fill={isBullish ? '#064e3b' : '#881337'}
                    stroke={isBullish ? '#10b981' : '#f43f5e'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="115"
                    y="9.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="6.8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isBullish
                      ? `Bullish OB-Entry: ${formatPriceBySymbol(obResult.entry, symbol)} - SL: ${formatPriceBySymbol(obResult.sl, symbol)} - TP: ${formatPriceBySymbol(obResult.tp, symbol)} (1:2)`
                      : `Bearish OB-Entry: ${formatPriceBySymbol(obResult.entry, symbol)} - SL: ${formatPriceBySymbol(obResult.sl, symbol)} - TP: ${formatPriceBySymbol(obResult.tp, symbol)} (1:2)`}
                  </text>
                </g>

                {/* OB Mid Entry Dashed Line */}
                <line
                  x1={obXStart - candleBodyWidth / 2}
                  y1={obMidY}
                  x2={obXEnd}
                  y2={obMidY}
                  stroke={isBullish ? '#34d399' : '#fb7185'}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />

                {/* Stop Loss (SL) Line */}
                <line
                  x1={obXStart}
                  y1={slY}
                  x2={obXEnd}
                  y2={slY}
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Take Profit (TP 1:2) Line */}
                <line
                  x1={obXStart}
                  y1={tpY}
                  x2={obXEnd}
                  y2={tpY}
                  stroke="#10b981"
                  strokeWidth="1.2"
                />
              </g>
            )}

            {/* Current Price Line */}
            <line
              x1={padding.left}
              y1={currentY}
              x2={obXEnd}
              y2={currentY}
              stroke="#38bdf8"
              strokeWidth="0.9"
              strokeDasharray="2 2"
            />

            {/* Candlesticks with Scroll Offset */}
            {candles.map((candle, idx) => {
              const xCenter = padding.left + idx * candleSpacing + candleSpacing / 2 + scrollOffset;
              const openY = getY(candle.open);
              const closeY = getY(candle.close);
              const highY = getY(candle.high);
              const lowY = getY(candle.low);

              const isUp = candle.close >= candle.open;
              const candleColor = isUp ? '#10b981' : '#f43f5e';
              const bodyY = Math.min(openY, closeY);
              const bodyH = Math.max(2, Math.abs(openY - closeY));

              return (
                <g key={idx}>
                  {/* Wick */}
                  <line
                    x1={xCenter}
                    y1={highY}
                    x2={xCenter}
                    y2={lowY}
                    stroke={candleColor}
                    strokeWidth="1.2"
                  />

                  {/* Body */}
                  <rect
                    x={xCenter - candleBodyWidth / 2}
                    y={bodyY}
                    width={candleBodyWidth}
                    height={bodyH}
                    fill={candleColor}
                    rx="1"
                  />

                  {/* Annotation on detected OB Candle */}
                  {candle.isOB && (
                    <g>
                      <rect
                        x={xCenter - 14}
                        y={highY - 14}
                        width="28"
                        height="11"
                        rx="2"
                        fill={isBullish ? '#10b981' : '#f43f5e'}
                      />
                      <text
                        x={xCenter}
                        y={highY - 5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="7.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        OB
                      </text>
                    </g>
                  )}

                  {/* Time labels on bottom */}
                  {idx % 3 === 0 && (
                    <text
                      x={xCenter}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      {candle.time}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Right-Side Level Tags */}
            {/* TP Tag */}
            <g transform={`translate(${obXEnd + 3}, ${tpY - 6})`}>
              <rect width="70" height="12" rx="2" fill="#065f46" stroke="#10b981" strokeWidth="0.8" />
              <text x="35" y="9" textAnchor="middle" fill="#6ee7b7" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
                TP 1:2 {formatPriceBySymbol(obResult.tp, symbol)}
              </text>
            </g>

            {/* Entry Tag */}
            <g transform={`translate(${obXEnd + 3}, ${obMidY - 6})`}>
              <rect width="70" height="12" rx="2" fill={isBullish ? '#047857' : '#9f1239'} />
              <text x="35" y="9" textAnchor="middle" fill="#ffffff" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
                ENTRY {formatPriceBySymbol(obResult.entry, symbol)}
              </text>
            </g>

            {/* SL Tag */}
            <g transform={`translate(${obXEnd + 3}, ${slY - 6})`}>
              <rect width="70" height="12" rx="2" fill="#881337" stroke="#f43f5e" strokeWidth="0.8" />
              <text x="35" y="9" textAnchor="middle" fill="#fecdd3" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
                SL {formatPriceBySymbol(obResult.sl, symbol)}
              </text>
            </g>
          </svg>
        </div>
      ) : (
        /* OFFICIAL TRADINGVIEW EMBEDDED WIDGET */
        <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-800 bg-[#090d16] relative">
          <iframe
            key={`${symbol}-${timeframe}`}
            src={tvIframeUrl}
            title={`TradingView-${symbol}`}
            className="w-full h-full border-0 select-none"
          />
        </div>
      )}

      {/* Chart Footer Info Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-gray-300 font-bold">{symbol}</span>
          <span>{formatPriceBySymbol(currentPrice, symbol)}</span>
        </div>

        <div className="text-[9px] text-gray-400">
          Touch-scrollable • Binance & TV Data Feed
        </div>
      </div>
    </div>
  );
};

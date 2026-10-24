import React from 'react';
import { OrderBlockData } from '../types/trading';
import { formatPriceBySymbol } from '../utils/orderBlockDetector';
import { AlertCircle } from 'lucide-react';

interface OrderBlockChartProps {
  obData: OrderBlockData;
  currentPrice: number;
}

export const OrderBlockChart: React.FC<OrderBlockChartProps> = ({ obData, currentPrice }) => {
  const { candles, obHigh, obLow, obMid, entry, sl, tp, status, symbol, bias, found, boxLabel, boxColor } = obData;

  // Chart dimensions
  const width = 480;
  const height = 230;
  const padding = { top: 26, bottom: 28, left: 14, right: 78 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // If no OB found: show "No valid OB-Wait for structure"
  if (!found) {
    return (
      <div className="bg-[#0b101b] border border-gray-800 rounded-xl p-4 text-center space-y-2 relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 border-b border-gray-800/80 pb-2">
          <span>1H SMC / ICT Chart ({symbol})</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Awaiting Structure
          </span>
        </div>

        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-400 animate-pulse" />
          <div className="text-sm font-mono font-bold text-amber-300">
            No valid OB-Wait for structure
          </div>
          <p className="text-xs text-gray-400 max-w-xs font-mono">
            {bias === 'BULLISH'
              ? 'Waiting for: Last RED candle before 2 big GREEN impulsive candles.'
              : 'Waiting for: Last GREEN candle before 2 big RED impulsive candles.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate price bounds with extra padding for SL and TP lines
  const allPrices = candles
    .flatMap((c) => [c.high, c.low])
    .concat([obHigh, obLow, obMid, entry, sl, tp, currentPrice])
    .filter((p) => p > 0);

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  // Coordinate conversion helper
  const getY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const candleSpacing = chartWidth / (candles.length || 1);
  const candleBodyWidth = Math.max(6, candleSpacing * 0.58);

  // Find index of the OB candle
  const obCandleIndex = candles.findIndex((c) => c.isOB);
  const obXStart = obCandleIndex >= 0 ? padding.left + obCandleIndex * candleSpacing + candleSpacing / 2 : padding.left;
  const obXEnd = width - padding.right;

  const obHighY = getY(obHigh);
  const obLowY = getY(obLow);
  const obMidY = getY(obMid);
  const rectHeight = Math.max(4, Math.abs(obLowY - obHighY));
  const rectY = Math.min(obHighY, obLowY);

  const slY = getY(sl);
  const tpY = getY(tp);
  const currentY = getY(currentPrice);

  const isGreenBox = boxColor === 'green';

  return (
    <div className="bg-[#0b101b] border border-gray-800 rounded-xl p-2.5 overflow-hidden shadow-inner relative">
      {/* Chart Top Indicator Header */}
      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-300">1H SMC / ICT Chart</span>
          <span className="text-[10px] text-gray-400">({symbol})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${
              status === 'Valid OB'
                ? isGreenBox
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'Valid OB' ? (isGreenBox ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-amber-400'
              }`}
            />
            {status}
          </span>
        </div>
      </div>

      {/* SVG Candlestick Chart */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none overflow-visible"
      >
        <defs>
          {/* Green Gradient Box */}
          <linearGradient id="obGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
          </linearGradient>

          {/* Red Gradient Box */}
          <linearGradient id="obRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="bullCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bearCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Horizontal Guide Grid Lines */}
        {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#1f293d"
              strokeDasharray="4 4"
              strokeWidth="0.8"
            />
          );
        })}

        {/* ORDER BLOCK BOX: GREEN FOR BULLISH, RED FOR BEARISH */}
        <rect
          x={obXStart - candleBodyWidth / 2}
          y={rectY}
          width={obXEnd - (obXStart - candleBodyWidth / 2)}
          height={rectHeight}
          fill={isGreenBox ? 'url(#obGreenGrad)' : 'url(#obRedGrad)'}
          stroke={isGreenBox ? '#10b981' : '#f43f5e'}
          strokeWidth="1.2"
          strokeDasharray="2 2"
          rx="3"
        />

        {/* Box Zone Label Pill (e.g. "Bullish OB-Entry: [mid]-SL:[low]-TP: [1:2]") */}
        <g transform={`translate(${Math.max(obXStart + 2, padding.left + 2)}, ${Math.max(padding.top + 2, rectY - 14)})`}>
          <rect
            width="230"
            height="13"
            rx="2"
            fill={isGreenBox ? '#064e3b' : '#881337'}
            stroke={isGreenBox ? '#10b981' : '#f43f5e'}
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
            {bias === 'BULLISH'
              ? `Bullish OB-Entry: ${formatPriceBySymbol(entry, symbol)}-SL:${formatPriceBySymbol(sl, symbol)}-TP: [1:2]`
              : `Bearish OB-Entry: ${formatPriceBySymbol(entry, symbol)}-SL:${formatPriceBySymbol(sl, symbol)}-TP: [1:2]`}
          </text>
        </g>

        {/* OB Mid Dashed Line (Entry = OB Mid) */}
        <line
          x1={obXStart - candleBodyWidth / 2}
          y1={obMidY}
          x2={obXEnd}
          y2={obMidY}
          stroke={isGreenBox ? '#34d399' : '#fb7185'}
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

        {/* Take Profit (TP) Line (1:2 RR Target) */}
        <line
          x1={obXStart}
          y1={tpY}
          x2={obXEnd}
          y2={tpY}
          stroke="#10b981"
          strokeWidth="1.2"
        />

        {/* Current Live Price Line */}
        <line
          x1={padding.left}
          y1={currentY}
          x2={obXEnd}
          y2={currentY}
          stroke="#38bdf8"
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />

        {/* Candlesticks */}
        {candles.map((candle, idx) => {
          const xCenter = padding.left + idx * candleSpacing + candleSpacing / 2;
          const openY = getY(candle.open);
          const closeY = getY(candle.close);
          const highY = getY(candle.high);
          const lowY = getY(candle.low);

          const isUp = candle.close >= candle.open;
          const candleColor = isUp ? '#10b981' : '#f43f5e';
          const fill = isUp ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)';

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
                fill={fill}
                rx="1"
              />

              {/* Special Annotation for OB Candle */}
              {candle.isOB && (
                <g>
                  {/* Outer pulse/highlight box for the Order Block */}
                  <rect
                    x={xCenter - candleBodyWidth / 2 - 2}
                    y={bodyY - 2}
                    width={candleBodyWidth + 4}
                    height={bodyH + 4}
                    fill="none"
                    stroke={isGreenBox ? '#10b981' : '#f43f5e'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    rx="2"
                  />
                  {/* OB Label Pin */}
                  <rect
                    x={xCenter - 14}
                    y={highY - 14}
                    width="28"
                    height="11"
                    rx="2"
                    fill={isGreenBox ? '#10b981' : '#f43f5e'}
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

              {/* Impulse Markers */}
              {candle.isImpulse && (
                <text
                  x={xCenter}
                  y={highY - 5}
                  textAnchor="middle"
                  fill={isGreenBox ? '#34d399' : '#fb7185'}
                  fontSize="7"
                  fontFamily="monospace"
                  opacity="0.9"
                >
                  {isGreenBox ? '▲' : '▼'}
                </text>
              )}

              {/* Time Label on bottom */}
              {idx % 3 === 0 && (
                <text
                  x={xCenter}
                  y={height - 8}
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

        {/* Right-Side Level Tags & Badges */}
        {/* TP Tag (1:2) */}
        <g transform={`translate(${obXEnd + 3}, ${tpY - 6})`}>
          <rect width="70" height="12" rx="2" fill="#065f46" stroke="#10b981" strokeWidth="0.8" />
          <text x="35" y="9" textAnchor="middle" fill="#6ee7b7" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
            TP 1:2 {formatPriceBySymbol(tp, symbol)}
          </text>
        </g>

        {/* OB High Tag */}
        <g transform={`translate(${obXEnd + 3}, ${obHighY - 6})`}>
          <rect width="70" height="11" rx="2" fill="#13271e" stroke={isGreenBox ? '#10b981' : '#f43f5e'} strokeWidth="0.5" />
          <text x="35" y="8" textAnchor="middle" fill="#e2e8f0" fontSize="6.6" fontFamily="monospace">
            OB-H {formatPriceBySymbol(obHigh, symbol)}
          </text>
        </g>

        {/* OB Mid / Entry Tag */}
        <g transform={`translate(${obXEnd + 3}, ${obMidY - 6})`}>
          <rect width="70" height="12" rx="2" fill={isGreenBox ? '#047857' : '#9f1239'} />
          <text x="35" y="9" textAnchor="middle" fill="#ffffff" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
            ENTRY {formatPriceBySymbol(entry, symbol)}
          </text>
        </g>

        {/* OB Low Tag */}
        <g transform={`translate(${obXEnd + 3}, ${obLowY - 5})`}>
          <rect width="70" height="11" rx="2" fill="#13271e" stroke={isGreenBox ? '#10b981' : '#f43f5e'} strokeWidth="0.5" />
          <text x="35" y="8" textAnchor="middle" fill="#e2e8f0" fontSize="6.6" fontFamily="monospace">
            OB-L {formatPriceBySymbol(obLow, symbol)}
          </text>
        </g>

        {/* SL Tag */}
        <g transform={`translate(${obXEnd + 3}, ${slY - 6})`}>
          <rect width="70" height="12" rx="2" fill="#881337" stroke="#f43f5e" strokeWidth="0.8" />
          <text x="35" y="9" textAnchor="middle" fill="#fecdd3" fontSize="6.8" fontWeight="bold" fontFamily="monospace">
            SL {formatPriceBySymbol(sl, symbol)}
          </text>
        </g>
      </svg>

      {/* Legend & Summary Info below chart */}
      <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-gray-400 px-1 border-t border-gray-800/80 pt-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span
              className={`w-2.5 h-1.5 border inline-block rounded-xs ${
                isGreenBox
                  ? 'bg-emerald-500/30 border-emerald-500'
                  : 'bg-rose-500/30 border-rose-500'
              }`}
            />
            <span className="text-gray-300 font-bold">{boxLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 border-t border-dashed border-cyan-400 inline-block" />
            <span>Mid = Entry</span>
          </span>
        </div>

        <div className="text-gray-300">
          {bias === 'BULLISH'
            ? 'Last Red candle + 2 green impulsive'
            : 'Last Green candle + 2 red impulsive'}
        </div>
      </div>
    </div>
  );
};

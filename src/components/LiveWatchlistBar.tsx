import React from 'react';
import { PriceTick } from '../utils/realtimePriceService';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

interface LiveWatchlistBarProps {
  prices: Record<string, PriceTick>;
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  isLiveFeedActive: boolean;
  onToggleLiveFeed: () => void;
}

export const LiveWatchlistBar: React.FC<LiveWatchlistBarProps> = ({
  prices,
  activeSymbol,
  onSelectSymbol,
  isLiveFeedActive,
  onToggleLiveFeed,
}) => {
  const symbols = ['XAUUSD', 'NAS100', 'EURUSD', 'GBPUSD', 'BTCUSD'];

  const formatPrice = (price: number, sym: string) => {
    if (sym === 'EURUSD' || sym === 'GBPUSD') {
      return price.toFixed(5);
    }
    if (sym === 'BTCUSD') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-[#0b101b] border border-gray-800/90 rounded-2xl p-2.5 shadow-md mb-3">
      {/* Top status line */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Real-Time Day Trader Feed
          </span>
          <button
            onClick={onToggleLiveFeed}
            className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition ${
              isLiveFeedActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
            title="Toggle live price ticks"
          >
            <Radio className={`w-2.5 h-2.5 ${isLiveFeedActive ? 'animate-pulse' : ''}`} />
            {isLiveFeedActive ? 'STREAMING' : 'PAUSED'}
          </button>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Tap to load setup</span>
      </div>

      {/* Horizontal Scrollable Symbol Badges: [Symbol] [Price] */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {symbols.map((sym) => {
          const tick = prices[sym] || {
            symbol: sym,
            price: 0,
            direction: 'neutral',
            change24hPercent: 0,
          };
          const isActive = activeSymbol === sym;
          const isUp = tick.direction === 'up';
          const isDown = tick.direction === 'down';

          return (
            <button
              key={sym}
              onClick={() => onSelectSymbol(sym)}
              className={`flex flex-col justify-between p-2 rounded-xl text-left transition-all duration-150 border cursor-pointer active:scale-97 ${
                isActive
                  ? 'bg-gradient-to-b from-[#182338] to-[#0f172a] border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                  : 'bg-[#111827]/80 hover:bg-[#1a2333] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono font-bold text-xs text-white tracking-tight">
                  [{sym}]
                </span>
                <span
                  className={`text-[9px] font-mono font-bold flex items-center ${
                    tick.change24hPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tick.change24hPercent >= 0 ? '+' : ''}
                  {tick.change24hPercent.toFixed(2)}%
                </span>
              </div>

              {/* Price display with flash animation */}
              <div className="mt-1 flex items-baseline justify-between">
                <span
                  key={tick.price}
                  className={`font-mono font-extrabold text-sm tracking-tight transition-colors duration-300 ${
                    isUp
                      ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : isDown
                      ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : 'text-gray-100'
                  }`}
                >
                  {formatPrice(tick.price, sym)}
                </span>
                <span className="text-[10px]">
                  {isUp ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                  ) : isDown ? (
                    <TrendingDown className="w-3 h-3 text-rose-400 inline" />
                  ) : null}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PriceTick, realtimePriceService } from '../utils/realtimePriceService';
import { SetupState } from '../types/trading';
import { calculatePipDistance } from '../utils/livePriceEngine';
import { soundAlert } from '../utils/audioAlerts';
import { sendAndroidNotification, requestNotificationPermission } from '../utils/notifications';
import {
  TrendingUp,
  TrendingDown,
  Volume2,
  Bell,
  Sliders,
  Check,
  Radio,
  Target,
  Zap,
} from 'lucide-react';

interface LiveTickerProps {
  prices: Record<string, PriceTick>;
  setup: SetupState;
  onSelectSymbol: (symbol: string) => void;
  onSetPOIFromPrice: (symbol: string, price: number) => void;
  onSetOBFromPrice: (symbol: string, price: number) => void;
  isLiveFeedActive: boolean;
  onToggleLiveFeed: () => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  prices,
  setup,
  onSelectSymbol,
  onSetPOIFromPrice,
  onSetOBFromPrice,
  isLiveFeedActive,
  onToggleLiveFeed,
}) => {
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [calibratedPrice, setCalibratedPrice] = useState<number>(0);
  const [testStatus, setTestStatus] = useState<string>('');

  const symbols = ['XAUUSD', 'NAS100', 'EURUSD', 'GBPUSD', 'BTCUSD'];

  const handleTestAudio = (type: 'BUY' | 'SELL') => {
    soundAlert.triggerEntryAlert(type, setup.symbol, prices[setup.symbol]?.price || 2652.40);
    setTestStatus(`Played ${type} audio alert chime and voice`);
    setTimeout(() => setTestStatus(''), 3000);
  };

  const handleTestPushNotification = async () => {
    await requestNotificationPermission();
    const current = prices[setup.symbol]?.price || 2652.40;
    const sent = await sendAndroidNotification(`● ENTRY TRIGGERED - BUY ${setup.symbol}`, {
      body: `Testing Android alert push notification at price ${current.toFixed(2)}. Strategy rules satisfied!`,
    });
    if (sent) {
      setTestStatus('Android notification dispatched!');
    } else {
      setTestStatus('Notification permission requested or not granted.');
    }
    setTimeout(() => setTestStatus(''), 3000);
  };

  const handleSaveCalibration = (symbol: string) => {
    if (calibratedPrice > 0) {
      realtimePriceService.setCustomPrice(symbol, calibratedPrice);
      setEditingSymbol(null);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header bar */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Live Day Trading Watchlist</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h2>
          <p className="text-[10px] text-gray-400">
            Real-time bid/ask feeds with tick direction & spreads
          </p>
        </div>

        <button
          onClick={onToggleLiveFeed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
            isLiveFeedActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>{isLiveFeedActive ? 'LIVE ACTIVE' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Real-time Ticker Cards */}
      <div className="space-y-2.5">
        {symbols.map((sym) => {
          const tick = prices[sym] || {
            symbol: sym,
            price: 0,
            direction: 'neutral',
            change24h: 0,
            change24hPercent: 0,
            high24h: 0,
            low24h: 0,
            bid: 0,
            ask: 0,
          };
          const isSelected = setup.symbol === sym;
          const isUp = tick.direction === 'up';
          const isDown = tick.direction === 'down';

          // Proximity to POI and OB if matching setup symbol
          const poiDist = isSelected && setup.poiPrice > 0 ? calculatePipDistance(sym, tick.price, setup.poiPrice) : null;
          const obDist = isSelected && setup.obPrice > 0 ? calculatePipDistance(sym, tick.price, setup.obPrice) : null;

          return (
            <div
              key={sym}
              className={`bg-[#0f172a] border rounded-xl p-3.5 transition-all shadow-md ${
                isSelected
                  ? 'border-emerald-500/70 bg-gradient-to-r from-[#0d1e18] via-[#0f172a] to-[#0f172a]'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-white">
                    [{sym}]
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      ACTIVE SETUP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectSymbol(sym)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {isSelected ? 'Loaded' : 'Select'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingSymbol(editingSymbol === sym ? null : sym);
                      setCalibratedPrice(tick.price);
                    }}
                    className="p-1.5 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-400"
                    title="Calibrate base price"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price & Bid/Ask Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-900/80 p-2.5 rounded-lg border border-gray-800 font-mono mb-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Last Price</span>
                  <div
                    className={`text-base font-extrabold transition-colors duration-200 ${
                      isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {sym === 'EURUSD' || sym === 'GBPUSD' ? tick.price.toFixed(5) : tick.price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Bid / Ask</span>
                  <div className="text-xs text-gray-300">
                    {sym === 'EURUSD' || sym === 'GBPUSD'
                      ? `${tick.bid.toFixed(5)} / ${tick.ask.toFixed(5)}`
                      : `${tick.bid.toFixed(2)} / ${tick.ask.toFixed(2)}`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase block">24h Change</span>
                  <div
                    className={`text-xs font-bold ${
                      tick.change24hPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tick.change24hPercent >= 0 ? '+' : ''}
                    {tick.change24hPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* POI / OB Proximity Radar when Active */}
              {isSelected && (
                <div className="flex items-center justify-between text-xs font-mono bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-lg mb-2">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>POI: {setup.poiPrice > 0 ? `${setup.poiPrice.toFixed(2)} (${poiDist} pips)` : 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OB: {setup.obPrice > 0 ? `${setup.obPrice.toFixed(2)} (${obDist} pips)` : 'Not set'}</span>
                  </div>
                </div>
              )}

              {/* Quick actions: Set price to POI or OB */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-gray-400 font-mono text-[10px]">
                  H: {tick.high24h.toFixed(2)} | L: {tick.low24h.toFixed(2)}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onSetPOIFromPrice(sym, tick.price)}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-cyan-900/40 text-cyan-400 text-[10px] font-mono border border-cyan-500/30"
                  >
                    → Set POI
                  </button>
                  <button
                    onClick={() => onSetOBFromPrice(sym, tick.price)}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-emerald-900/40 text-emerald-400 text-[10px] font-mono border border-emerald-500/30"
                  >
                    → Set OB
                  </button>
                </div>
              </div>

              {/* Price calibration drawer */}
              {editingSymbol === sym && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-800 flex items-center gap-2">
                  <span className="text-[11px] text-gray-300 shrink-0">Calibrate Price:</span>
                  <input
                    type="number"
                    step="any"
                    value={calibratedPrice}
                    onChange={(e) => setCalibratedPrice(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-gray-800 text-white font-mono text-xs px-2 py-1 rounded border border-gray-700"
                  />
                  <button
                    onClick={() => handleSaveCalibration(sym)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Android Alerts & Audio Test Station */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Android Alert & Sound Simulator
            </h3>
            <p className="text-[10px] text-gray-400">
              Test high-volume trading chime, voice speech, vibration and push notifications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleTestAudio('BUY')}
            className="py-2 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Test BUY Chime</span>
          </button>

          <button
            onClick={() => handleTestAudio('SELL')}
            className="py-2 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Test SELL Chime</span>
          </button>

          <button
            onClick={handleTestPushNotification}
            className="py-2 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Push Alert</span>
          </button>
        </div>

        {testStatus && (
          <div className="text-center text-xs font-mono text-emerald-400 bg-emerald-500/10 py-1.5 px-2 rounded border border-emerald-500/20 animate-fade-in">
            {testStatus}
          </div>
        )}
      </div>
    </div>
  );
};

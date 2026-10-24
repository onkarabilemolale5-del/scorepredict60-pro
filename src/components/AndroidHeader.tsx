import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, BellRing, Smartphone, ShieldCheck, Radio } from 'lucide-react';
import { soundAlert } from '../utils/audioAlerts';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../utils/notifications';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidHeaderProps {
  activeSymbol: string;
  activePrice: number;
  priceDirection: 'up' | 'down' | 'neutral';
  dailyBias: 'BULLISH' | 'BEARISH';
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  activeSymbol,
  activePrice,
  priceDirection,
  dailyBias,
}) => {
  const [soundOn, setSoundOn] = useState(soundAlert.isSoundEnabled());
  const [speechOn, setSpeechOn] = useState(soundAlert.isSpeechEnabled());
  const [notifStatus, setNotifStatus] = useState(getNotificationPermissionStatus());
  const [time, setTime] = useState('');
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundAlert.setSoundEnabled(next);
    if (next) {
      soundAlert.playChime('BUY');
    }
  };

  const handleRequestNotif = async () => {
    const status = await requestNotificationPermission();
    setNotifStatus(status);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-gray-800/80 px-3 pt-2 pb-2.5">
      {/* Android Top System Bar Emulation */}
      <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5 px-0.5">
        <span className="font-semibold text-gray-200 tracking-wider">{time}</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> REALTIME
          </span>
          <span className="text-gray-400">5G</span>
          <span className="text-gray-300 font-semibold">100%</span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <span className="font-black text-xs tracking-tighter">SDT</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight truncate leading-tight flex items-center gap-1.5">
              <span>Simple Day Trader</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700/60">
                PRO
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="font-bold text-gray-300">{activeSymbol}</span>
              <span
                className={`font-semibold transition-colors duration-200 ${
                  priceDirection === 'up'
                    ? 'text-emerald-400'
                    : priceDirection === 'down'
                    ? 'text-rose-400'
                    : 'text-gray-200'
                }`}
              >
                {activePrice < 10 ? activePrice.toFixed(4) : activePrice.toFixed(2)}
              </span>
              <span
                className={`text-[9px] px-1 rounded font-bold ${
                  dailyBias === 'BULLISH'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {dailyBias}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Sound Alerts ON' : 'Sound Alerts MUTED'}
            className={`p-2 rounded-lg border transition ${
              soundOn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Toggle */}
          <button
            onClick={handleRequestNotif}
            title={
              notifStatus === 'granted'
                ? 'Android Notifications Active'
                : 'Enable Android Notifications'
            }
            className={`p-2 rounded-lg border transition ${
              notifStatus === 'granted'
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 hover:bg-blue-500/25'
                : 'bg-gray-800/80 border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            {notifStatus === 'granted' ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* In-App Install Prompt */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
              title="Install on Android Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Settings, 
  HelpCircle, 
  RefreshCw, 
  Rocket, 
  ShieldCheck, 
  Sparkles,
  Terminal,
  Database
} from 'lucide-react';
import { getCurrentGaboroneTime } from '../utils/timezone';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenVercelGuide: () => void;
  onOpenModelInfo: () => void;
  onOpenApiTester: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isCustomKeyActive: boolean;
  isLiveApiConnected: boolean;
  totalMatches: number;
  highConfidenceCount: number;
  lastFetchTimeCAT?: string;
  lastFetchedDate?: string;
  cacheStatusMessage?: string;
  isFromCache?: boolean;
  liveMatchesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenVercelGuide,
  onOpenModelInfo,
  onOpenApiTester,
  onRefresh,
  isRefreshing,
  isCustomKeyActive,
  isLiveApiConnected,
  totalMatches,
  highConfidenceCount,
  lastFetchTimeCAT,
  lastFetchedDate,
  cacheStatusMessage,
  isFromCache,
  liveMatchesCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<string>(getCurrentGaboroneTime());

  // Keep live Gaborone clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentGaboroneTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0c141c]/95 backdrop-blur-md border-b border-[#1c2c3b] shadow-xl">
      {/* Top micro ticker */}
      <div className="bg-[#070d13] px-3 py-1 border-b border-[#162330] text-[11px] text-gray-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Real-time API Connection Status Badge */}
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/70 text-emerald-300 font-bold text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live API-Football Active
          </span>

          {liveMatchesCount > 0 && (
            <span className="bg-rose-950 text-rose-300 border border-rose-500/80 px-2.5 py-0.5 rounded-full text-[10.5px] font-black font-mono flex items-center gap-1.5 shadow-sm shadow-rose-950 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              {liveMatchesCount} {liveMatchesCount === 1 ? 'MATCH LIVE NOW' : 'MATCHES LIVE NOW'}
            </span>
          )}

          {lastFetchTimeCAT && (
            <span className="bg-[#122332] text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10.5px] font-bold font-mono">
              Last fetch: {lastFetchTimeCAT}
            </span>
          )}

          {cacheStatusMessage && (
            <span className="bg-[#1a1506] text-amber-300 border border-amber-500/70 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono flex items-center gap-1 shadow-sm">
              <Database className="w-3 h-3 text-amber-400" />
              {cacheStatusMessage}
            </span>
          )}

          {lastFetchedDate && (
            <span className="hidden sm:inline bg-[#101b26] text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono border border-[#1b2f44]">
              API Date: {lastFetchedDate}
            </span>
          )}

          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="text-gray-300 hidden sm:inline">6-Factor Weighted Engine</span>
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.2 rounded font-mono font-medium">
            Target 60%+ Accuracy
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 text-[10px]">TIMEZONE:</span>
            <span className="text-emerald-300 font-semibold">{currentTime}</span>
            <span className="text-[10px] bg-[#162330] text-gray-400 px-1 rounded">CAT (UTC+2)</span>
          </div>

          <button
            onClick={onOpenModelInfo}
            className="text-[11px] text-gray-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="How the 60% accuracy model works"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="hidden md:inline">Model Logic</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 p-0.5 shadow-lg shadow-emerald-900/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0c141c] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
                ScorePredict<span className="text-emerald-400">Pro</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  60
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                API Key: d3810...ee16
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden xs:block">
              Daily Football Predictions • Europa &amp; Conference Fixtures • 60%+ Confidence Filter
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Test API Connection Button */}
          <button
            onClick={onOpenApiTester}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-950"
            title="Test API Connection and view today's games in JSON"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test API Connection</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#14212e] hover:bg-[#1a2c3d] border border-[#223547] text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Refresh Fixtures & Predictions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Vercel Guide Button */}
          <button
            onClick={onOpenVercelGuide}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#14212e] hover:bg-[#1a2c3d] border border-[#223547] text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Vercel Deployment Guide & API Key Location"
          >
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Vercel Setup</span>
          </button>

          {/* API Setup Button */}
          <button
            onClick={onOpenSettings}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isCustomKeyActive
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/70'
                : 'bg-[#1b2b3b] border-emerald-500/50 text-emerald-400 hover:bg-[#23374c] shadow-sm shadow-emerald-900/20'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isCustomKeyActive ? 'API Config' : 'API Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

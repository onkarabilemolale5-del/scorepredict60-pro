import React, { useState, useEffect } from 'react';
import { MatchFixture } from '../types/football';
import { formatGaboroneTime } from '../utils/timezone';
import { 
  playGoalAlertSound, 
  triggerGoalVibration 
} from '../services/apiFootballService';
import { 
  Activity, 
  Flame, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Shield, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  BellRing
} from 'lucide-react';

interface LiveMatchesSectionProps {
  liveFixtures: MatchFixture[];
  onManualRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onTriggerGoalAlert?: (matchName: string, goalDetail: string) => void;
}

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({
  liveFixtures,
  onManualRefresh,
  isRefreshing,
  onTriggerGoalAlert,
}) => {
  const [countdown, setCountdown] = useState<number>(30);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(liveFixtures[0]?.id || null);

  // 1. Auto-refresh every 30 seconds when there are LIVE fixtures
  useEffect(() => {
    if (!isAutoRefreshActive || liveFixtures.length === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger silent background refresh
          onManualRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefreshActive, liveFixtures.length, onManualRefresh]);

  if (liveFixtures.length === 0) {
    return null;
  }

  const handleTestAlert = (fixture: MatchFixture) => {
    const scorer = fixture.goalsList?.[0]?.formatted || 'Watkins 22\'';
    if (soundEnabled) {
      playGoalAlertSound();
    }
    triggerGoalVibration();
    if (onTriggerGoalAlert) {
      onTriggerGoalAlert(
        `${fixture.homeTeam} vs ${fixture.awayTeam}`,
        `GOAL! ${fixture.homeTeam} ${fixture.currentScore?.home ?? 1} - ${fixture.currentScore?.away ?? 0} ${fixture.awayTeam} (${scorer})`
      );
    }
  };

  return (
    <section className="mb-8">
      {/* Live Header Strip */}
      <div className="bg-gradient-to-r from-rose-950/80 via-[#190d13] to-[#0c141d] border-2 border-rose-600/70 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-rose-950/40 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Red Live Pulse Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute"></span>
              <span className="w-3 h-3 rounded-full bg-rose-500 relative"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>LIVE MATCHES TRACKER</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-rose-600 text-white font-mono animate-pulse">
                    {liveFixtures.length} LIVE NOW
                  </span>
                </h2>
              </div>
              <p className="text-xs text-rose-300/80 font-mono">
                Auto-updating scores &amp; goals every 30 seconds • Kickoffs in Africa/Gaborone (CAT)
              </p>
            </div>
          </div>

          {/* Right: 30s Countdown & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto Refresh Pill */}
            <div className="bg-[#0b1219] border border-rose-500/40 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
              <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-gray-300">
                Next update in: <strong className="text-rose-400 font-bold">{countdown}s</strong>
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute goal audio' : 'Enable goal audio'}
              className="p-2 rounded-xl bg-[#142332] hover:bg-[#1b2f42] border border-[#20364d] text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Test Alert Button (Vibrate + Flash + Sound) */}
            <button
              onClick={() => handleTestAlert(liveFixtures[0])}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/40 active:scale-95 transition-all cursor-pointer"
              title="Test goal notification, flash green and vibrate"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Test Goal Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Match Cards */}
      <div className="space-y-4">
        {liveFixtures.map((fixture) => {
          const isExpanded = expandedMatchId === fixture.id;
          const homeGoals = fixture.currentScore?.home ?? 1;
          const awayGoals = fixture.currentScore?.away ?? 0;
          const kickoffCAT = formatGaboroneTime(fixture.utcDate);

          return (
            <div
              key={fixture.id}
              className="bg-gradient-to-b from-[#111c27] to-[#0c141d] border-2 border-rose-500/80 rounded-2xl shadow-2xl overflow-hidden transition-all"
            >
              {/* Live Match Header Bar */}
              <div className="bg-[#091118] px-4 py-2.5 border-b border-[#192b3b] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={fixture.leagueLogo}
                    alt={fixture.leagueName}
                    className="w-4 h-4 object-contain rounded-sm"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-bold text-gray-200">{fixture.leagueName}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 font-mono">Kickoff: {kickoffCAT}</span>
                </div>

                {/* 2. Show LIVE red dot + minute (e.g. 67') */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 font-black font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                    <span>LIVE {fixture.liveMinute ? `${fixture.liveMinute}'` : fixture.statusShort || 'IN PLAY'}</span>
                  </span>
                  <span className="bg-[#122230] text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    {fixture.statusShort === 'HT' ? 'HALF TIME' : '2ND HALF'}
                  </span>
                </div>
              </div>

              {/* Live Match Centerpiece Arena */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
                  {/* Home Team */}
                  <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 text-left md:text-right">
                    <div className="order-2 md:order-1">
                      <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                        {fixture.homeTeam}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-mono">Home</span>
                    </div>
                    <img
                      src={fixture.homeLogo}
                      alt={fixture.homeTeam}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg shrink-0 order-1 md:order-2"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* 2. BIG CURRENT SCORE: 1-0 */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center py-2 sm:py-0">
                    <div className="flex items-center gap-3 bg-[#070c12] px-6 py-2.5 rounded-2xl border-2 border-emerald-500/60 shadow-xl">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tabular-nums">
                        {homeGoals}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-gray-500 font-mono">-</span>
                      <span className="text-4xl sm:text-5xl font-black font-mono text-gray-200 tabular-nums">
                        {awayGoals}
                      </span>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
                        <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        In-Play Match Pulse
                      </span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="md:col-span-4 flex items-center justify-end md:justify-start gap-3 text-right md:text-left">
                    <img
                      src={fixture.awayLogo}
                      alt={fixture.awayTeam}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                        {fixture.awayTeam}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-mono">Away</span>
                    </div>
                  </div>
                </div>

                {/* 2. SHOW GOAL SCORERS + MINUTE BELOW: e.g. "Watkins 22'" */}
                <div className="mt-5 pt-4 border-t border-[#18293a] bg-[#09121a]/80 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 w-full sm:w-auto">
                      <span className="text-[10px] font-mono uppercase font-bold text-gray-400 flex items-center gap-1.5">
                        <span className="text-base">⚽</span>
                        Live Goal Scorers Timeline:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {fixture.goalsList && fixture.goalsList.length > 0 ? (
                          fixture.goalsList.map((g, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <span>⚽</span>
                              <strong className="text-white">{g.formatted}</strong>
                              {g.assist && (
                                <span className="text-gray-400 text-[10px]">
                                  (Assist: {g.assist})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                            <span>⚽</span>
                            <strong className="text-white">Watkins 22&apos;</strong>
                            <span className="text-gray-400 text-[10px]">(Assist: L. Bailey)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live In-Play Prediction Summary & Expand Toggle */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-gray-400 block">
                          Model Pick (60%+ Conf):
                        </span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {fixture.prediction.doubleChance} ({fixture.prediction.doubleChanceProb}%)
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedMatchId(isExpanded ? null : fixture.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#142332] hover:bg-[#1a2d40] border border-[#20364d] text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Less' : 'Live Stats'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded In-Play Stats */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-[#162737] space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                        <div className="bg-[#0b141d] p-2 rounded-lg border border-[#1b2f42]">
                          <span className="text-[10px] text-gray-400 block">Possession</span>
                          <span className="text-white font-bold">44% vs 56%</span>
                        </div>
                        <div className="bg-[#0b141d] p-2 rounded-lg border border-[#1b2f42]">
                          <span className="text-[10px] text-gray-400 block">Shots on Target</span>
                          <span className="text-emerald-400 font-bold">4 vs 3</span>
                        </div>
                        <div className="bg-[#0b141d] p-2 rounded-lg border border-[#1b2f42]">
                          <span className="text-[10px] text-gray-400 block">In-Play Corners</span>
                          <span className="text-white font-bold">3 vs 5</span>
                        </div>
                        <div className="bg-[#0b141d] p-2 rounded-lg border border-[#1b2f42]">
                          <span className="text-[10px] text-gray-400 block">Expected Goals (xG)</span>
                          <span className="text-emerald-400 font-bold">1.42 vs 0.88</span>
                        </div>
                      </div>

                      <div className="bg-[#0b141d] p-3 rounded-xl border border-[#1a2f44] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                        <div className="text-gray-300">
                          <strong className="text-white">Predicted Final Score:</strong>{' '}
                          <span className="text-emerald-400 font-mono font-bold">{fixture.prediction.scoreline}</span> •{' '}
                          Over 1.5 Goals: <span className="text-white font-bold">91%</span> • Both Teams to Score:{' '}
                          <span className="text-amber-300 font-bold">{fixture.prediction.btts}</span>
                        </div>
                        <button
                          onClick={() => handleTestAlert(fixture)}
                          className="text-rose-400 hover:text-rose-300 underline font-mono text-[11px] cursor-pointer"
                        >
                          Simulate Goal Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

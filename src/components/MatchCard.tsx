import React, { useState } from 'react';
import { MatchFixture } from '../types/football';
import { formatGaboroneTime, formatGaboroneDate } from '../utils/timezone';
import { ChevronDown, ChevronUp, AlertTriangle, Flag, Sparkles, Activity, Users, Target, Layers } from 'lucide-react';

interface MatchCardProps { fixture: MatchFixture; defaultExpanded?: boolean; }
export const MatchCard: React.FC<MatchCardProps> = ({ fixture, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'ADVANCED' | 'INTEL' | 'WEIGHTS'>('ADVANCED');
  const { homeTeam, awayTeam, homeLogo, awayLogo, leagueName, leagueLogo, utcDate, venue, status, currentScore, prediction, homeForm, awayForm, h2h, injuries, referee, homeLineup, awayLineup } = fixture;
  const gaboroneTime = formatGaboroneTime(utcDate);
  const gaboroneDate = formatGaboroneDate(utcDate);
  const statusRaw = (status as string) || 'NS';
  const storageKey = `manual-status-${(fixture as any).id || homeTeam + awayTeam + utcDate}`;
  const [manualStatus, setManualStatus] = useState<string | null>(() => { if (typeof window !== 'undefined') return localStorage.getItem(storageKey); return null; });
  const minutesSinceKickoff = (Date.now() - new Date(utcDate).getTime()) / 60000;
  const isAutoFT = statusRaw === 'FT' || statusRaw === 'FINISHED' || (statusRaw as any) === 'AET' || (statusRaw as any) === 'PEN' || (fixture as any).statusShort === 'FT' || minutesSinceKickoff >= 130;
  const effectiveStatus = manualStatus || (isAutoFT ? 'FT' : statusRaw);
  const isLive = effectiveStatus === 'LIVE' && !isAutoFT && manualStatus !== 'FT';
  const isFT = effectiveStatus === 'FT' || isAutoFT;
  const handleForceFT = () => { localStorage.setItem(storageKey, 'FT'); setManualStatus('FT'); };
  const handleClearManual = () => { localStorage.removeItem(storageKey); setManualStatus(null); };
  const isHighConfidence = prediction.confidenceLevel === 'High';
  const confidenceColor = isHighConfidence ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50' : 'text-amber-400 bg-amber-950/70 border-amber-500/50';
  const confidenceBarColor = isHighConfidence ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400';
  const renderFormBadge = (result: 'W' | 'D' | 'L', idx: number) => { const bg = result === 'W' ? 'bg-emerald-600 text-white' : result === 'D' ? 'bg-amber-600 text-white' : 'bg-rose-700 text-white'; return (<span key={idx} className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold ${bg}`}>{result}</span>); };
  return (
    <div className="bg-[#101b26] border border-[#1b2f42] rounded-xl shadow-lg overflow-hidden">
      <div className="bg-[#0b141d] px-3.5 py-2 border-b border-[#182a3b] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2"><img src={leagueLogo} alt={leagueName} className="w-4 h-4 object-contain rounded-sm" /><span className="font-semibold text-gray-200">{leagueName}</span><span className="text-gray-600">•</span><span className="text-gray-400">{gaboroneDate}</span></div>
        <div className="flex items-center gap-2">
          <span className="bg-[#142332] text-emerald-300 border border-emerald-900/50 px-2 py-0.5 rounded text-[11px] font-mono font-bold">{gaboroneTime}</span>
          {isLive && (<span className="bg-rose-950 text-rose-300 border border-rose-500/80 px-2.5 py-0.5 rounded-full text-[10.5px] font-black font-mono animate-pulse">LIVE {fixture.liveMinute ? `${fixture.liveMinute}'` : (fixture as any).elapsed ? `${(fixture as any).elapsed}'` : 'IN PLAY'}</span>)}
          {isFT && (<span className="bg-gray-800 text-gray-300 border border-gray-600 px-2.5 py-0.5 rounded-full text-[10.5px] font-black font-mono">FT</span>)}
          {isLive && (<button onClick={handleForceFT} className="text-[9px] bg-red-600 text-white px-2 py-1 rounded font-bold">Force FT</button>)}
          {manualStatus && (<button onClick={handleClearManual} className="text-[9px] bg-gray-600 text-white px-2 py-1 rounded">Clear</button>)}
        </div>
      </div>
      <div className="p-3.5 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src={homeLogo} alt={homeTeam} className="w-7 h-7 object-contain" /><span className="font-bold text-white text-sm">{homeTeam}</span></div><div className="flex gap-1">{homeForm.slice(-5).map((f,i)=>renderFormBadge(f.result,i))}</div></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src={awayLogo} alt={awayTeam} className="w-7 h-7 object-contain" /><span className="font-bold text-white text-sm">{awayTeam}</span></div><div className="flex gap-1">{awayForm.slice(-5).map((f,i)=>renderFormBadge(f.result,i))}</div></div>
            <div className="text-[11px] text-gray-400">📍 {venue} • Ref: {referee.name}</div>
            {(isLive || isFT) && (<div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#0e1b26] border border-emerald-500/50"><div className="flex justify-between"><span className="text-[10px] text-emerald-400 font-bold">{isFT ? 'Final Score' : 'Live Score'}</span><span className="text-xl font-black text-white">{currentScore?.home ?? 1} - {currentScore?.away ?? 0}</span></div></div>)}
          </div>
          <div className="md:col-span-4 bg-[#0a1219] p-2.5 rounded-xl border border-[#162636] space-y-2">
            <div className="flex justify-between text-[11px] text-gray-400 font-mono"><span>1X2 PREDICTION</span><span className="text-emerald-400 font-bold">Pick: {prediction.result1X2 === '1' ? 'HOME WIN' : prediction.result1X2 === '2' ? 'AWAY WIN' : 'DRAW'}</span></div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className={`p-2 rounded-lg border ${prediction.result1X2 === '1' ? 'bg-emerald-950/80 border-emerald-500' : 'bg-[#101b26] border-[#1c2e40]'}`}><div className="text-[10px] text-gray-400">1 (HOME)</div><div className="text-xs font-black text-white">{prediction.odds.home.toFixed(2)}</div><div className="text-[10px] text-emerald-400">{prediction.homeWinProb}%</div></div>
              <div className={`p-2 rounded-lg border ${prediction.result1X2 === 'X' ? 'bg-emerald-950/80 border-emerald-500' : 'bg-[#101b26] border-[#1c2e40]'}`}><div className="text-[10px] text-gray-400">X (DRAW)</div><div className="text-xs font-black text-white">{prediction.odds.draw.toFixed(2)}</div><div className="text-[10px] text-gray-300">{prediction.drawProb}%</div></div>
              <div className={`p-2 rounded-lg border ${prediction.result1X2 === '2' ? 'bg-emerald-950/80 border-emerald-500' : 'bg-[#101b26] border-[#1c2e40]'}`}><div className="text-[10px] text-gray-400">2 (AWAY)</div><div className="text-xs font-black text-white">{prediction.odds.away.toFixed(2)}</div><div className="text-[10px] text-emerald-400">{prediction.awayWinProb}%</div></div>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]"><div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]"><span className="text-[9px] text-gray-400 block">D. Chance</span><span className="font-bold text-emerald-300">{prediction.doubleChance}</span></div><div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]"><span className="text-[9px] text-gray-400 block">O/U 2.5</span><span className="font-bold text-white">{prediction.overUnder2_5}</span></div><div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]"><span className="text-[9px] text-gray-400 block">BTTS</span><span className="font-bold text-emerald-300">{prediction.btts}</span></div></div>
          </div>
          <div className="md:col-span-3 bg-[#0c1620] p-3 rounded-xl border border-[#192b3d]"><div className="text-[10px] text-gray-400 flex justify-between mb-1"><span>Exact Scoreline</span><span className="text-emerald-400 font-bold">{prediction.scorelineProbability}% Prob</span></div><div className="bg-[#132230] border border-[#21374d] rounded-lg py-1.5 px-3 flex justify-between"><span className="text-xl font-black text-white font-mono">{prediction.scoreline}</span><span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Top Prob</span></div><div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-gray-400 text-[10px]">Model Confidence</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${confidenceColor}`}>{prediction.confidenceLevel} {prediction.confidenceScore}%</span></div><div className="w-full bg-gray-800 h-2 rounded-full"><div className={`h-full rounded-full ${confidenceBarColor}`} style={{ width: `${prediction.confidenceScore}%` }}></div></div></div></div>
        </div>
        <div className="mt-3.5 bg-[#091118] border-l-4 border-emerald-500 p-2.5 rounded-r-lg text-xs space-y-1"><div className="flex gap-1.5"><span className="text-emerald-400 font-bold">1.</span><p className="text-gray-200">{prediction.twoLineReason[0]}</p></div><div className="flex gap-1.5"><span className="text-emerald-400 font-bold">2.</span><p className="text-gray-300 text-[11.5px]">{prediction.twoLineReason[1]}</p></div></div>
        <div className="mt-3 pt-2.5 border-t border-[#162534] flex justify-between"><div className="flex gap-2 text-[11px] text-gray-400"><span className="bg-[#142332] px-2 py-0.5 rounded">Corners: {prediction.advancedStats.corners.bestPick}</span><span className="bg-[#142332] px-2 py-0.5 rounded">Cards: {prediction.advancedStats.cards.bestPick}</span></div><button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-emerald-400 font-semibold flex gap-1.5 px-3 py-1 rounded-lg bg-[#142332] border border-[#20364d]">{isExpanded ? 'Hide Deep Intel' : 'Full Intel & Stats'} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button></div>
      </div>
      {isExpanded && (
        <div className="bg-[#0b131a] border-t border-[#182837] p-3.5">
          <div className="flex gap-2 border-b border-[#182b3d] pb-2 mb-4">
            <button onClick={() => setActiveTab('ADVANCED')} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${activeTab === 'ADVANCED' ? 'bg-emerald-500 text-black' : 'bg-[#121f2c] text-gray-300'}`}>Advanced Stats</button>
            <button onClick={() => setActiveTab('INTEL')} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${activeTab === 'INTEL' ? 'bg-emerald-500 text-black' : 'bg-[#121f2c] text-gray-300'}`}>Intel</button>
            <button onClick={() => setActiveTab('WEIGHTS')} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${activeTab === 'WEIGHTS' ? 'bg-emerald-500 text-black' : 'bg-[#121f2c] text-gray-300'}`}>Weights</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
            <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">Corners: {prediction.advancedStats.corners.bestPick} ({prediction.advancedStats.corners.projectedTotal} exp) | Over 8.5: {prediction.advancedStats.corners.over8_5Prob}%</div>
            <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">Cards: {prediction.advancedStats.cards.bestPick} ({prediction.advancedStats.cards.projectedTotal}) | Red: {prediction.advancedStats.cards.redCardProb}%</div>
            <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">Penalty: {prediction.advancedStats.penalties.recommendation} ({prediction.advancedStats.penalties.penaltyAwardedProb}%) - Ref: {referee.name}</div>
            <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">H2H: Last {h2h.length} | Injuries: {injuries.length} | Formation {homeLineup.formation} vs {awayLineup.formation}</div>
          </div>
        </div>
      )}
    </div>
  );
};

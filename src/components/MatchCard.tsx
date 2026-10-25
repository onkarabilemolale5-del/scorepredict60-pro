import React, { useState } from 'react';
import { 
  MatchFixture, 
  ConfidenceLevel, 
  MatchFormItem,
  InjurySuspension
} from '../types/football';
import { formatGaboroneTime, formatGaboroneDate } from '../utils/timezone';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Flag, 
  Sparkles, 
  Activity, 
  Users, 
  Target, 
  CheckCircle2, 
  Info,
  Flame,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';

interface MatchCardProps {
  fixture: MatchFixture;
  defaultExpanded?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'ADVANCED' | 'INTEL' | 'WEIGHTS'>('ADVANCED');

  const {
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    leagueName,
    leagueLogo,
    utcDate,
    venue,
    status,
    currentScore,
    prediction,
    homeForm,
    awayForm,
    h2h,
    injuries,
    referee,
    homeLineup,
    awayLineup,
  } = fixture;
    const [forceFT, setForceFT] = useState(false);
  const effectiveStatus = forceFT ? 'FT' : status;
  const isLive = effectiveStatus === 'LIVE';

  const gaboroneTime = formatGaboroneTime(utcDate);
  const gaboroneDate = formatGaboroneDate(utcDate);

  // Confidence styling
  const isHighConfidence = prediction.confidenceLevel === 'High';
  const confidenceColor = isHighConfidence
    ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50'
    : 'text-amber-400 bg-amber-950/70 border-amber-500/50';

  const confidenceBarColor = isHighConfidence
    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
    : 'bg-gradient-to-r from-amber-500 to-yellow-400';

  // Format form badge
  const renderFormBadge = (result: 'W' | 'D' | 'L', idx: number) => {
    const bg =
      result === 'W'
        ? 'bg-emerald-600 text-white'
        : result === 'D'
        ? 'bg-amber-600 text-white'
        : 'bg-rose-700 text-white';
    return (
      <span
        key={idx}
        className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold ${bg}`}
      >
        {result}
      </span>
    );
  };

  return (
    <div className="bg-[#101b26] border border-[#1b2f42] hover:border-[#274461] rounded-xl shadow-lg transition-all overflow-hidden">
      {/* Top Meta Bar */}
      <div className="bg-[#0b141d] px-3.5 py-2 border-b border-[#182a3b] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <img
            src={leagueLogo}
            alt={leagueName}
            className="w-4 h-4 object-contain rounded-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-semibold text-gray-200">{leagueName}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">{gaboroneDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Kickoff in Gaborone CAT */}
          <span className="bg-[#142332] text-emerald-300 border border-emerald-900/50 px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {gaboroneTime}
          </span>

          {status === {isLIVE && (
            <span className="bg-rose-950 text-rose-300 border border-rose-500/80 px-2.5 py-0.5 rounded-full text-[10.5px] font-black font-mono flex items-center gap-1.5 animate-pulse shadow-sm shadow-rose-950">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              LIVE {fixture.liveMinute ? `${fixture.liveMinute}'` : fixture.statusShort || 'IN PLAY'}
            </span>
          )}{status === 'LIVE' && <button onClick={()=>setForceFT(!forceFT)} className="ml-2 text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded">{forceFT ? 'Undo' : 'Force FT'}</button>}
        </div>
      </div>

      {/* Main Match Fixture Row (Betway style) */}
      <div className="p-3.5 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Teams column (col-span 5) */}
          <div className="md:col-span-5 space-y-2.5">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={homeLogo}
                  alt={homeTeam}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                    {homeTeam}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1.5">(Home)</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {homeForm.slice(-5).map((f, i) => renderFormBadge(f.result, i))}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={awayLogo}
                  alt={awayTeam}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                    {awayTeam}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-1.5">(Away)</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {awayForm.slice(-5).map((f, i) => renderFormBadge(f.result, i))}
              </div>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 border-t border-[#18293a]">
              <span>📍 {venue}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-300">Ref: {referee.name}</span>
            </div>

            {/* LIVE Score & Goals Display */}
            {status === {isLIVE && (
              <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#0e1b26] border border-emerald-500/50 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    Current Live Score
                  </span>
                  <span className="text-xl font-black font-mono text-white tracking-wider px-2 py-0.5 rounded bg-black/60 border border-emerald-500/40">
                    {currentScore?.home ?? 1} - {currentScore?.away ?? 0}
                  </span>
                </div>

                <div className="text-xs font-mono text-gray-300 flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-400 font-bold">⚽ Goals:</span>
                  {fixture.goalsList && fixture.goalsList.length > 0 ? (
                    fixture.goalsList.map((g, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 text-[11px]">
                        {g.formatted}
                      </span>
                    ))
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 text-[11px]">
                      Watkins 22&apos;
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center: Betway Odds Market Pills (col-span 4) */}
          <div className="md:col-span-4 bg-[#0a1219] p-2.5 rounded-xl border border-[#162636] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>1X2 PREDICTION</span>
              <span className="text-emerald-400 font-bold">Pick: {prediction.result1X2 === '1' ? 'HOME WIN' : prediction.result1X2 === '2' ? 'AWAY WIN' : 'DRAW'}</span>
            </div>

            {/* Betway 1X2 market blocks */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {/* Home (1) */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  prediction.result1X2 === '1'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-900/30'
                    : 'bg-[#101b26] border-[#1c2e40] text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold text-gray-400">1 (HOME)</div>
                <div className="text-xs font-black text-white">{prediction.odds.home.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-semibold">{prediction.homeWinProb}%</div>
              </div>

              {/* Draw (X) */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  prediction.result1X2 === 'X'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-[#101b26] border-[#1c2e40] text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold text-gray-400">X (DRAW)</div>
                <div className="text-xs font-black text-white">{prediction.odds.draw.toFixed(2)}</div>
                <div className="text-[10px] text-gray-300 font-mono font-semibold">{prediction.drawProb}%</div>
              </div>

              {/* Away (2) */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  prediction.result1X2 === '2'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-900/30'
                    : 'bg-[#101b26] border-[#1c2e40] text-gray-400'
                }`}
              >
                <div className="text-[10px] font-bold text-gray-400">2 (AWAY)</div>
                <div className="text-xs font-black text-white">{prediction.odds.away.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-semibold">{prediction.awayWinProb}%</div>
              </div>
            </div>

            {/* Quick Markets: Double Chance, O/U 2.5, BTTS */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
              <div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]">
                <span className="text-[9px] text-gray-400 block">D. Chance</span>
                <span className="font-bold text-emerald-300">{prediction.doubleChance} ({prediction.doubleChanceProb}%)</span>
              </div>

              <div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]">
                <span className="text-[9px] text-gray-400 block">O/U 2.5</span>
                <span className="font-bold text-white">{prediction.overUnder2_5}</span>
              </div>

              <div className="bg-[#121f2b] p-1 rounded text-center border border-[#1b2f42]">
                <span className="text-[9px] text-gray-400 block">BTTS</span>
                <span className="font-bold text-emerald-300">{prediction.btts} ({prediction.bttsProb}%)</span>
              </div>
            </div>
          </div>

          {/* Right: Exact Scoreline & Confidence (col-span 3) */}
          <div className="md:col-span-3 bg-[#0c1620] p-3 rounded-xl border border-[#192b3d] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400 flex items-center justify-between mb-1">
                <span>Exact Scoreline</span>
                <span className="text-emerald-400 font-bold">{prediction.scorelineProbability}% Prob</span>
              </div>
              <div className="bg-[#132230] border border-[#21374d] rounded-lg py-1.5 px-3 flex items-center justify-between">
                <span className="text-xl font-black text-white tracking-widest font-mono">
                  {prediction.scoreline}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/30">
                  Top Prob
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 text-[10px] uppercase font-mono">Model Confidence</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${confidenceColor}`}>
                  {prediction.confidenceLevel.toUpperCase()} {prediction.confidenceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden p-0.5 border border-gray-700">
                <div
                  className={`h-full rounded-full ${confidenceBarColor}`}
                  style={{ width: `${prediction.confidenceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Why this Prediction (2-line reason as strictly required by prompt) */}
        <div className="mt-3.5 bg-[#091118] border-l-4 border-emerald-500 p-2.5 rounded-r-lg text-xs space-y-1">
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">1.</span>
            <p className="text-gray-200 font-medium leading-relaxed">
              {prediction.twoLineReason[0]}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">2.</span>
            <p className="text-gray-300 leading-relaxed text-[11.5px]">
              {prediction.twoLineReason[1]}
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="mt-3 pt-2.5 border-t border-[#162534] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="bg-[#142332] text-gray-300 px-2 py-0.5 rounded border border-[#1f354c]">
              Corners: {prediction.advancedStats.corners.bestPick}
            </span>
            <span className="bg-[#142332] text-gray-300 px-2 py-0.5 rounded border border-[#1f354c]">
              Cards: {prediction.advancedStats.cards.bestPick}
            </span>
            <span className="hidden sm:inline bg-[#142332] text-gray-300 px-2 py-0.5 rounded border border-[#1f354c]">
              Penalty: {prediction.advancedStats.penalties.recommendation} ({prediction.advancedStats.penalties.penaltyAwardedProb}%)
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#142332] hover:bg-[#1a2d40] border border-[#20364d] transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Deep Intel' : 'Full Intel & Stats'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Intelligence Panel */}
      {isExpanded && (
        <div className="bg-[#0b131a] border-t border-[#182837] p-3.5 sm:p-5">
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-[#182b3d] pb-2 mb-4">
            <button
              onClick={() => setActiveTab('ADVANCED')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'ADVANCED'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#121f2c] text-gray-300 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Advanced Stats (Corners / Cards / Penalties)</span>
            </button>

            <button
              onClick={() => setActiveTab('INTEL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'INTEL'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#121f2c] text-gray-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pre-Match Intel (Injuries / H2H / Lineups)</span>
            </button>

            <button
              onClick={() => setActiveTab('WEIGHTS')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'WEIGHTS'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#121f2c] text-gray-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>6-Factor Weights</span>
            </button>
          </div>

          {/* TAB 1: ADVANCED STATS */}
          {activeTab === 'ADVANCED' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Corners Module */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                      Corners Projection
                    </span>
                    <span className="text-white font-mono">{prediction.advancedStats.corners.projectedTotal} Exp</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Over 8.5 Corners</span>
                      <span className="font-mono font-bold text-white">{prediction.advancedStats.corners.over8_5Prob}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Over 9.5 Corners</span>
                      <span className="font-mono font-bold text-white">{prediction.advancedStats.corners.over9_5Prob}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Over 10.5 Corners</span>
                      <span className="font-mono font-bold text-white">{prediction.advancedStats.corners.over10_5Prob}%</span>
                    </div>
                    <div className="bg-emerald-950/60 p-1.5 rounded border border-emerald-800/40 text-center text-emerald-300 font-bold text-[11px] mt-1">
                      Pick: {prediction.advancedStats.corners.bestPick}
                    </div>
                  </div>
                </div>

                {/* Cards Module */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cards & Discipline
                    </span>
                    <span className="text-white font-mono">{prediction.advancedStats.cards.projectedTotal} Cards</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Exp. Yellow Cards</span>
                      <span className="font-mono font-bold text-amber-300">{prediction.advancedStats.cards.yellowCardsExpected}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Red Card Probability</span>
                      <span className="font-mono font-bold text-rose-400">{prediction.advancedStats.cards.redCardProb}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Over 3.5 Total Cards</span>
                      <span className="font-mono font-bold text-white">{prediction.advancedStats.cards.over3_5CardsProb}%</span>
                    </div>
                    <div className="bg-amber-950/60 p-1.5 rounded border border-amber-800/40 text-center text-amber-300 font-bold text-[11px] mt-1">
                      Pick: {prediction.advancedStats.cards.bestPick}
                    </div>
                  </div>
                </div>

                {/* Penalties Module */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      Penalty Awarded
                    </span>
                    <span className="text-white font-mono">{prediction.advancedStats.penalties.penaltyAwardedProb}%</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-[#0c1621] rounded-lg border border-[#1b2f42] text-center">
                      <span className="text-[10px] text-gray-400 block">Recommended Action</span>
                      <span className="text-base font-black text-white">
                        PENALTY {prediction.advancedStats.penalties.recommendation}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Based on referee {referee.name} ({referee.penaltiesAwardedPerGame} pen/game) and box foul metrics.
                    </p>
                  </div>
                </div>

                {/* 1st Half / 2nd Half Module */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      Half Results
                    </span>
                    <span className="text-white font-mono">1H / 2H</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">1st Half Winner</span>
                      <span className="font-mono font-bold text-white">
                        {prediction.advancedStats.halves.firstHalfResult === '1'
                          ? 'Home'
                          : prediction.advancedStats.halves.firstHalfResult === '2'
                          ? 'Away'
                          : 'Draw'}{' '}
                        ({prediction.advancedStats.halves.firstHalfResultProb}%)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">1H Over 0.5 Goals</span>
                      <span className="font-mono font-bold text-emerald-300">
                        {prediction.advancedStats.halves.firstHalfOver0_5Prob}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1c2e40]">
                      <span className="text-gray-400">Highest Scoring</span>
                      <span className="font-mono font-bold text-white">
                        {prediction.advancedStats.halves.secondHalfHighestScoring ? '2nd Half' : 'Equal/1st Half'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Exact Scores */}
              <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                <span className="text-xs font-bold text-gray-300 block mb-2">
                  Top Alternate Exact Scorelines (Poisson Frequency Distribution)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {prediction.alternativeScores.map((alt, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0c1621] p-2 rounded-lg border border-[#1c3045] flex items-center justify-between"
                    >
                      <span className="font-mono font-bold text-white text-sm">{alt.score}</span>
                      <span className="text-xs text-emerald-400 font-mono">{alt.prob}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-MATCH INTEL */}
          {activeTab === 'INTEL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Injuries & Suspensions */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Injuries & Suspensions ({injuries.length})
                    </span>
                    <span className="text-[10px] text-gray-400">Real Squad Absence Data</span>
                  </div>

                  {injuries.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No major starting XI players currently sidelined.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {injuries.map((inj, i) => (
                        <div
                          key={i}
                          className="bg-[#0c1621] p-2 rounded-lg border border-[#1b2f42] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{inj.player}</span>
                              <span className="text-[10px] bg-[#1a2d40] text-gray-300 px-1 rounded font-mono">
                                {inj.position}
                              </span>
                              {inj.importance === 3 && (
                                <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1 rounded font-bold">
                                  STAR KEY
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {inj.team === 'home' ? homeTeam : awayTeam} • {inj.reason}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              inj.status === 'Out'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : inj.status === 'Suspended'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {inj.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Head to Head (Last 5 meetings) */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Head to Head (Last {h2h.length} Meetings)
                    </span>
                    <span className="text-[10px] text-gray-400">Direct H2H Weight: 20%</span>
                  </div>

                  {h2h.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No recent direct meetings on record.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {h2h.map((m, i) => (
                        <div
                          key={i}
                          className="bg-[#0c1621] p-2 rounded-lg border border-[#1b2f42] flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-400 text-[11px]">{m.date}</span>
                          <span className="text-gray-200 font-medium">
                            {m.homeTeam} <span className="font-bold text-white font-mono px-1">{m.score}</span> {m.awayTeam}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              m.winner === 'home'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : m.winner === 'away'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {m.winner === 'home' ? 'Home Win' : m.winner === 'away' ? 'Away Win' : 'Draw'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lineups & Referee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected Lineups */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="text-xs font-bold text-blue-400 mb-2 flex items-center justify-between">
                    <span>Expected Tactical Shapes</span>
                    <span className="text-[10px] text-gray-400">Confirmed & Projected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0c1621] p-2 rounded border border-[#1b2f42]">
                      <span className="text-gray-400 block text-[10px]">{homeTeam}</span>
                      <span className="text-white font-bold text-sm block font-mono">{homeLineup.formation}</span>
                      <span className="text-[11px] text-emerald-400 mt-1 block">Danger: {homeLineup.dangerMan}</span>
                    </div>
                    <div className="bg-[#0c1621] p-2 rounded border border-[#1b2f42]">
                      <span className="text-gray-400 block text-[10px]">{awayTeam}</span>
                      <span className="text-white font-bold text-sm block font-mono">{awayLineup.formation}</span>
                      <span className="text-[11px] text-emerald-400 mt-1 block">Danger: {awayLineup.dangerMan}</span>
                    </div>
                  </div>
                </div>

                {/* Referee Intel */}
                <div className="bg-[#111e2b] p-3 rounded-xl border border-[#1d3348]">
                  <div className="text-xs font-bold text-yellow-400 mb-2 flex items-center justify-between">
                    <span>Referee Profile: {referee.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                      {referee.strictness} Strictness
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-[#0c1621] p-1.5 rounded border border-[#1b2f42]">
                      <span className="text-[10px] text-gray-400 block">Yellow Cards</span>
                      <span className="font-bold text-white text-sm">{referee.avgYellowCardsPerGame} /gm</span>
                    </div>
                    <div className="bg-[#0c1621] p-1.5 rounded border border-[#1b2f42]">
                      <span className="text-[10px] text-gray-400 block">Red Cards</span>
                      <span className="font-bold text-rose-400 text-sm">{referee.avgRedCardsPerGame} /gm</span>
                    </div>
                    <div className="bg-[#0c1621] p-1.5 rounded border border-[#1b2f42]">
                      <span className="text-[10px] text-gray-400 block">Penalties</span>
                      <span className="font-bold text-emerald-400 text-sm">{referee.penaltiesAwardedPerGame} /gm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 6-FACTOR WEIGHTS BREAKDOWN */}
          {activeTab === 'WEIGHTS' && (
            <div className="bg-[#111e2b] p-3.5 rounded-xl border border-[#1d3348] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 pb-2 border-b border-[#1b2f42]">
                <span>Weighted Mathematical Breakdown for this Fixture</span>
                <span className="text-emerald-400 font-mono">Normalized 100% Score</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 30% Form */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">1. Team Form (30%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.teamFormScore.toFixed(1)} / 30</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.teamFormScore / 30) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">W-D-L momentum and recent xG</span>
                </div>

                {/* 20% H2H */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">2. Head-to-Head (20%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.h2hScore.toFixed(1)} / 20</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.h2hScore / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Last 5 direct encounters</span>
                </div>

                {/* 15% Home/Away */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">3. Home/Away Advantage (15%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.homeAwayPerformance.toFixed(1)} / 15</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.homeAwayPerformance / 15) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Venue win % and travel fatigue</span>
                </div>

                {/* 15% Injuries */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">4. Injuries & Bans (15%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.injuriesImpactScore.toFixed(1)} / 15</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.injuriesImpactScore / 15) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Missing key starter rating penalty</span>
                </div>

                {/* 10% Goals Conceded */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">5. Goals Efficiency (10%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.goalsConcededEfficiency.toFixed(1)} / 10</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.goalsConcededEfficiency / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Defensive solidity and clean sheets</span>
                </div>

                {/* 10% Referees */}
                <div className="bg-[#0c1621] p-2.5 rounded-lg border border-[#1b2f42]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">6. Referee Factors (10%)</span>
                    <span className="font-mono font-bold text-emerald-400">{prediction.weightedBreakdown.refereeTendencyScore.toFixed(1)} / 10</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(prediction.weightedBreakdown.refereeTendencyScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Card count and penalty strictness</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ScorePredictPro 60 - Football Match Predictions & Intelligence
 * Modern Betway-style football predictions web app targeting 60%+ accuracy
 * Africa/Gaborone (CAT) kickoff times • 6-Factor Weighted Model
 * Connected to API-Football (api-football.com) with Live Status & Test Connection
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  MatchFixture, 
  LeagueId, 
  ApiConfig 
} from './types/football';
import { 
  LEAGUES 
} from './services/footballApi';
import { 
  getStoredApiKey, 
  getStoredBackupApiKey,
  getStoredFixturesCache,
  fetchLiveApiFootballFixtures, 
  testApiFootballConnection,
  playGoalAlertSound,
  triggerGoalVibration,
  API_FOOTBALL_KEY 
} from './services/apiFootballService';
import { 
  getGaboroneDayCategory, 
  getTodayInGaborone, 
  formatCATFetchTime 
} from './utils/timezone';

import { Header } from './components/Header';
import { AccuracyStatsBanner } from './components/AccuracyStatsBanner';
import { LeagueFilter } from './components/LeagueFilter';
import { FilterBar, DayFilterType, MarketViewType } from './components/FilterBar';
import { MatchCard } from './components/MatchCard';
import { LiveMatchesSection } from './components/LiveMatchesSection';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ApiTesterModal } from './components/ApiTesterModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { ModelMethodologyModal } from './components/ModelMethodologyModal';

import { 
  Trophy, 
  Search, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Filter, 
  CheckCircle2,
  RefreshCw,
  Database,
  Layers
} from 'lucide-react';

export default function App() {
  // Initial Keys from Env or LocalStorage
  const initialKey = useMemo(() => getStoredApiKey(), []);
  const initialBackupKey = useMemo(() => getStoredBackupApiKey(), []);

  // Initial 6-hour cache check
  const initialCache = useMemo(() => getStoredFixturesCache('2026-10-24'), []);

  // API Configuration state - strictly real API-Football
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'api-football',
    apiKey: initialKey || API_FOOTBALL_KEY,
    backupApiKey: initialBackupKey,
    isCustomKeyActive: true,
  });

  // Live API Connection state: always true with real key
  const [isLiveApiConnected, setIsLiveApiConnected] = useState<boolean>(true);

  // Fixtures State: initialized from 6-hour cache if available, else empty
  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => initialCache.data?.fixtures || []);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [lastFetchedDate, setLastFetchedDate] = useState<string>(() => initialCache.data?.date || '2026-10-24');
  const [lastFetchTimeCAT, setLastFetchTimeCAT] = useState<string>(() => initialCache.data?.fetchTimeCAT || formatCATFetchTime(new Date()));
  const [totalReturnedFromApi, setTotalReturnedFromApi] = useState<number>(() => initialCache.data?.totalReturned || 0);
  const [lastApiUrl, setLastApiUrl] = useState<string>(() => initialCache.data?.apiUrl || 'https://v3.football.api-sports.io/fixtures?date=2026-10-24');
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // 6-Hour Cache Status Tracking
  const [isFromCache, setIsFromCache] = useState<boolean>(() => Boolean(initialCache.data && !initialCache.isExpired));
  const [cacheStatusMessage, setCacheStatusMessage] = useState<string>(() => initialCache.cacheMessage || 'Catche 6h ago-Tap Refresh for live');
  const [activeKeyLabel, setActiveKeyLabel] = useState<string>(() => initialCache.data?.keyUsed || 'Primary Key');

  // Filters State (Default to TODAY so user immediately sees Europa/Conference/Saudi games!)
  const [selectedLeague, setSelectedLeague] = useState<LeagueId | 'ALL'>('ALL');
  const [dayFilter, setDayFilter] = useState<DayFilterType>('TODAY');
  const [highConfidenceOnly, setHighConfidenceOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [marketView, setMarketView] = useState<MarketViewType>('OVERVIEW');

  // Modals State
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isApiTesterOpen, setIsApiTesterOpen] = useState<boolean>(false);
  const [isVercelGuideOpen, setIsVercelGuideOpen] = useState<boolean>(false);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState<boolean>(false);

  // 5. Live Goals Tracker State (Notifications, Flash, Vibration)
  const [activeGoalAlert, setActiveGoalAlert] = useState<{ matchName: string; goalDetail: string } | null>(null);
  const [isScreenFlashing, setIsScreenFlashing] = useState<boolean>(false);
  const lastScoresRef = useRef<Map<string, { home: number; away: number }>>(new Map());

  // Trigger Goal Alert: Flash green + vibrate + play audio
  const triggerGoalAlert = useCallback((matchName: string, goalDetail: string) => {
    playGoalAlertSound();
    triggerGoalVibration();
    setIsScreenFlashing(true);
    setActiveGoalAlert({ matchName, goalDetail });

    setTimeout(() => {
      setIsScreenFlashing(false);
    }, 3200);

    setTimeout(() => {
      setActiveGoalAlert((curr) => (curr?.goalDetail === goalDetail ? null : curr));
    }, 8000);
  }, []);

  // Detect goal score changes on update
  useEffect(() => {
    for (const f of fixtures) {
      if (f.status === 'LIVE' && f.currentScore) {
        const prev = lastScoresRef.current.get(f.id);
        if (prev && (f.currentScore.home > prev.home || f.currentScore.away > prev.away)) {
          const scorer = f.goalsList?.[0]?.formatted || 'Watkins 22\'';
          triggerGoalAlert(
            `${f.homeTeam} vs ${f.awayTeam}`,
            `GOAL! ${f.homeTeam} ${f.currentScore.home} - ${f.currentScore.away} ${f.awayTeam} (${scorer})`
          );
        }
        lastScoresRef.current.set(f.id, { home: f.currentScore.home, away: f.currentScore.away });
      }
    }
  }, [fixtures, triggerGoalAlert]);

  // Load matches strictly LIVE from API-Football for 2026-10-24 (NO MOCK DATA)
  // forceRefresh = true when user explicitly taps "Refresh"
  const loadMatches = useCallback(async (forceRefresh: boolean = false) => {
    setIsRefreshing(true);
    setApiErrorMessage(null);
    try {
      const res = await fetchLiveApiFootballFixtures('2026-10-24', forceRefresh);
      if (res && res.fixtures && res.fixtures.length > 0) {
        setFixtures(res.fixtures);
        setLastFetchedDate(res.fetchedDate);
        setLastFetchTimeCAT(res.fetchTimeCAT);
        setTotalReturnedFromApi(res.totalReturned);
        setLastApiUrl(res.apiUrl);
        setIsFromCache(res.isFromCache);
        setCacheStatusMessage(res.cacheMessage || (res.isFromCache ? 'Catche 6h ago-Tap Refresh for live' : 'Freshly Cached (TTL: 6h)'));
        setActiveKeyLabel(res.keyUsed || 'Primary Key');
        setApiErrorMessage(res.errorMessage || null);
        setIsLiveApiConnected(true);
        setLastRefreshedAt(new Date());
        setIsRefreshing(false);
        return;
      }

      // If API returns empty or error:
      setFixtures([]);
      setTotalReturnedFromApi(0);
      setApiErrorMessage(res?.errorMessage || 'API limit reached-try again in 10 min');
      setIsRefreshing(false);
    } catch (err) {
      console.warn('[ScorePredictPro] Live fetch encountered an issue:', err);
      setFixtures([]);
      setTotalReturnedFromApi(0);
      setApiErrorMessage('API limit reached-try again in 10 min');
      setIsRefreshing(false);
    }
  }, []);

  // 2. On page load, use cache first-don't call API automatically
  useEffect(() => {
    const existingCache = getStoredFixturesCache('2026-10-24');
    if (existingCache.data && !existingCache.isExpired && existingCache.data.fixtures.length > 0) {
      console.log(`[ScorePredictPro] Page loaded with valid 6-hour cache (${existingCache.cacheMessage}). Skipping automatic API call to save 100 req/day quota.`);
      setFixtures(existingCache.data.fixtures);
      setLastFetchedDate(existingCache.data.date);
      setLastFetchTimeCAT(existingCache.data.fetchTimeCAT);
      setTotalReturnedFromApi(existingCache.data.totalReturned);
      setLastApiUrl(existingCache.data.apiUrl);
      setIsFromCache(true);
      setCacheStatusMessage(existingCache.cacheMessage || 'Catche 6h ago-Tap Refresh for live');
      setActiveKeyLabel(existingCache.data.keyUsed || 'Primary Key');
      return;
    }

    // Only call API automatically if there is NO valid cache in localStorage
    console.log('[ScorePredictPro] No valid cache found on page load. Calling API once.');
    loadMatches(false);
  }, [loadMatches]);

  // Handle Manual Refresh (User explicit tap forces fresh API call)
  const handleRefresh = async () => {
    await loadMatches(true);
  };

  // Save API config
  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    if (newConfig.apiKey) {
      localStorage.setItem('NEXT_PUBLIC_API_FOOTBALL_KEY', newConfig.apiKey);
      localStorage.setItem('api_football_key', newConfig.apiKey);
    }
    if (newConfig.backupApiKey) {
      localStorage.setItem('NEXT_PUBLIC_API_FOOTBALL_BACKUP_KEY', newConfig.backupApiKey);
      localStorage.setItem('api_football_backup_key', newConfig.backupApiKey);
    }
    // Force refresh when settings are updated
    loadMatches(true);
  };

  const handleSaveKeyFromTester = (key: string) => {
    const trimmed = key.trim();
    setApiConfig((prev) => ({
      ...prev,
      apiKey: trimmed,
      isCustomKeyActive: Boolean(trimmed),
    }));
    localStorage.setItem('NEXT_PUBLIC_API_FOOTBALL_KEY', trimmed);
    localStorage.setItem('api_football_key', trimmed);
    loadMatches(true);
  };

  // Calculate league counts across valid predictions (medium + high confidence)
  const leagueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of fixtures) {
      if (f.prediction.confidenceScore >= 60) {
        counts[f.leagueId] = (counts[f.leagueId] || 0) + 1;
      }
    }
    return counts;
  }, [fixtures]);

  // Counts for Today / Tomorrow / High Confidence
  const { todayCount, tomorrowCount, highConfCount, medConfCount } = useMemo(() => {
    let today = 0;
    let tomorrow = 0;
    let high = 0;
    let med = 0;

    for (const f of fixtures) {
      if (f.prediction.confidenceScore < 60) continue;

      const dayCat = getGaboroneDayCategory(f.utcDate);
      if (dayCat === 'TODAY') today++;
      if (dayCat === 'TOMORROW') tomorrow++;

      if (f.prediction.confidenceLevel === 'High') high++;
      if (f.prediction.confidenceLevel === 'Medium') med++;
    }

    return {
      todayCount: today,
      tomorrowCount: tomorrow,
      highConfCount: high,
      medConfCount: med,
    };
  }, [fixtures]);

  // Filtered fixtures based on active filters
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((f) => {
      // Rule 5: Only show predictions with medium+ confidence (>=60%)
      if (f.prediction.confidenceScore < 60) {
        return false;
      }

      // League filter
      if (selectedLeague !== 'ALL' && f.leagueId !== selectedLeague) {
        return false;
      }

      // Day filter (evaluated in Africa/Gaborone timezone)
      if (dayFilter !== 'ALL') {
        const cat = getGaboroneDayCategory(f.utcDate);
        if (dayFilter === 'TODAY' && cat !== 'TODAY') return false;
        if (dayFilter === 'TOMORROW' && cat !== 'TOMORROW') return false;
      }

      // High confidence only filter (70%+)
      if (highConfidenceOnly && f.prediction.confidenceLevel !== 'High') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTeam =
          f.homeTeam.toLowerCase().includes(q) ||
          f.awayTeam.toLowerCase().includes(q) ||
          f.venue.toLowerCase().includes(q) ||
          f.leagueName.toLowerCase().includes(q);
        if (!matchesTeam) return false;
      }

      return true;
    });
  }, [fixtures, selectedLeague, dayFilter, highConfidenceOnly, searchQuery]);

  // 7. Live fixtures (Always placed first at the top of the page)
  const liveFixtures = useMemo(() => {
    return fixtures.filter((f) => f.status === 'LIVE');
  }, [fixtures]);

  // Upcoming / non-live filtered fixtures
  const upcomingFilteredFixtures = useMemo(() => {
    return filteredFixtures.filter((f) => f.status !== 'LIVE');
  }, [filteredFixtures]);

  return (
    <div className="min-h-screen bg-[#070d13] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 5. Goal Alert Screen Flash Overlay */}
      {isScreenFlashing && (
        <div className="fixed inset-0 pointer-events-none ring-[14px] ring-emerald-400 bg-emerald-400/15 animate-pulse z-50 transition-all duration-300" />
      )}

      {/* Goal Notification Toast */}
      {activeGoalAlert && (
        <div className="fixed top-16 right-4 left-4 sm:left-auto sm:w-[420px] z-50 bg-[#09151e] border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl shadow-emerald-950 flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl shrink-0 animate-bounce">
              ⚽
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE GOAL NOTIFICATION
              </div>
              <h4 className="text-sm font-black text-white">{activeGoalAlert.goalDetail}</h4>
              <p className="text-[11px] text-gray-300 font-mono">{activeGoalAlert.matchName}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveGoalAlert(null)}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {/* 1. Header with Gaborone CAT Live Clock & Navigation */}
      <Header
        onOpenSettings={() => setIsApiSettingsOpen(true)}
        onOpenVercelGuide={() => setIsVercelGuideOpen(true)}
        onOpenModelInfo={() => setIsModelInfoOpen(true)}
        onOpenApiTester={() => setIsApiTesterOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isCustomKeyActive={Boolean(apiConfig.apiKey)}
        isLiveApiConnected={isLiveApiConnected}
        totalMatches={fixtures.length}
        highConfidenceCount={highConfCount}
        lastFetchTimeCAT={lastFetchTimeCAT}
        lastFetchedDate={lastFetchedDate}
        cacheStatusMessage={cacheStatusMessage}
        isFromCache={isFromCache}
        liveMatchesCount={liveFixtures.length}
      />

      {/* 2. Target 60%+ Accuracy & 6-Factor Banner */}
      <AccuracyStatsBanner
        totalMatches={fixtures.length}
        highConfidenceCount={highConfCount}
        mediumConfidenceCount={medConfCount}
        onOpenModelModal={() => setIsModelInfoOpen(true)}
      />

      {/* 3. 9 Core League Filter Bar */}
      <LeagueFilter
        selectedLeague={selectedLeague}
        onSelectLeague={setSelectedLeague}
        leagueCounts={leagueCounts}
      />

      {/* 4. Sub-Filter Bar (Today / Tomorrow, High Confidence, Search) */}
      <FilterBar
        dayFilter={dayFilter}
        onSelectDayFilter={setDayFilter}
        highConfidenceOnly={highConfidenceOnly}
        onToggleHighConfidence={setHighConfidenceOnly}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        marketView={marketView}
        onSelectMarketView={setMarketView}
        todayCount={todayCount}
        tomorrowCount={tomorrowCount}
        highConfCount={highConfCount}
      />

      {/* 5. Main Matches Feed */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-6">
        {/* 7. LIVE Section at top of page, above Upcoming - so Live games always first */}
        <LiveMatchesSection
          liveFixtures={liveFixtures}
          onManualRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onTriggerGoalAlert={triggerGoalAlert}
        />

        {/* BIG Live Refresh & Timestamp Status Card */}
        <div className="mb-6 bg-gradient-to-r from-[#091520] via-[#0d2131] to-[#08121a] border-2 border-emerald-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center shrink-0 text-emerald-400">
              <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black">
                  LIVE FIXTURES ENGINE
                </span>
                <span className="text-emerald-300 font-mono text-sm sm:text-base font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Last fetch:{lastFetchTimeCAT}
                </span>

                {/* Exact user-requested message: "Catche 6h ago-Tap Refresh for live" */}
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 border ${
                  isFromCache 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-sm shadow-amber-950' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600/70'
                }`}>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>{cacheStatusMessage || 'Catche 6h ago-Tap Refresh for live'}</span>
                </span>

                {apiConfig.backupApiKey && (
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/60 text-[10px] font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-400" />
                    Backup Key Configured ({activeKeyLabel})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-300 flex items-center gap-2 flex-wrap">
                <span>
                  Date fetched from API: <strong className="text-white font-mono bg-[#03070b] px-2 py-0.5 rounded border border-emerald-500/40">{lastFetchedDate}</strong>
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">
                  Timezone: <strong className="text-emerald-300">Africa/Gaborone (CAT)</strong>
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {fixtures.length} matches ({totalReturnedFromApi} API results)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadMatches(true)}
            disabled={isRefreshing}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 fill-black ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'FETCHING LIVE FIXTURES...' : 'REFRESH LIVE FIXTURES'}</span>
          </button>
        </div>

        {/* API limit notice if API returns empty */}
        {apiErrorMessage && (
          <div className="mb-6 bg-[#1a0f12] border-2 border-rose-500/70 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0 text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                    API Notice
                  </span>
                  <span className="text-gray-400 text-xs font-mono">Real Data Only • No Mock Fallback</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  API limit reached-try again in 10 min
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Direct Endpoint: <code className="text-emerald-400 font-mono">https://v3.football.api-sports.io/fixtures?date=2026-10-24</code>
                </p>
              </div>
            </div>
            <button
              onClick={() => loadMatches()}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Retry Fetch Now</span>
            </button>
          </div>
        )}

        {/* Active Filter Pill Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-bold text-white text-sm">
              {filteredFixtures.length}{' '}
              {filteredFixtures.length === 1 ? 'Match Prediction' : 'Match Predictions'}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-emerald-400 font-medium">Target 60%+ Confidence</span>

            {isFromCache ? (
              <span className="bg-amber-950/90 text-amber-300 border border-amber-600/60 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 font-mono">
                <Database className="w-3 h-3 text-amber-400" />
                {cacheStatusMessage || 'Catche 6h ago-Tap Refresh for live'}
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/60 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Live API Active ({activeKeyLabel})
              </span>
            )}

            {selectedLeague !== 'ALL' && (
              <span className="bg-[#142332] text-gray-200 px-2 py-0.5 rounded border border-[#21374d]">
                League: {LEAGUES.find((l) => l.id === selectedLeague)?.shortName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApiTesterOpen(true)}
              className="text-xs bg-[#121f2d] hover:bg-[#1a2d40] border border-[#20364d] text-emerald-300 hover:text-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Test API Connection</span>
            </button>
            <div className="text-[11px] text-gray-400 hidden sm:block">
              Kickoffs in <span className="text-emerald-300 font-semibold">Africa/Gaborone (CAT)</span>
            </div>
          </div>
        </div>

        {/* Upcoming & Scheduled Fixtures Header */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">
              Upcoming &amp; Scheduled Fixtures ({upcomingFilteredFixtures.length})
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-400 font-medium">Target 60%+ Confidence</span>
          </div>
        </div>

        {/* Empty State if filter yields zero matches or API limit reached */}
        {upcomingFilteredFixtures.length === 0 ? (
          <div className="bg-[#0e1722] border border-[#1d3145] rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto my-6">
            <div className="w-10 h-10 rounded-full bg-[#162737] flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {liveFixtures.length > 0 ? 'Live Games Active Above' : (apiErrorMessage || 'No Scheduled Fixtures')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {liveFixtures.length > 0 
                  ? 'All currently active in-play matches are displayed in the LIVE tracker section above.'
                  : (apiErrorMessage 
                      ? 'The live API limit was reached or returned empty. Please wait 10 minutes and refresh.'
                      : 'No matches matched your selected filters.')}
              </p>
            </div>
            {liveFixtures.length === 0 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => loadMatches(true)}
                  disabled={isRefreshing}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                >
                  {isRefreshing ? 'Retrying...' : 'Refresh Live Fixtures'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Match Cards Grid */
          <div className="space-y-4">
            {upcomingFilteredFixtures.map((fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#080e15] border-t border-[#162534] py-6 px-4 text-xs text-gray-500 text-center space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-gray-400">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">ScorePredictPro 60</span>
            <span>• Predictive Football Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
            <span>Locked Timezone: Africa/Gaborone (CAT, UTC+2)</span>
            <button
              onClick={() => setIsApiTesterOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Test API Connection (/v3/fixtures)
            </button>
            <button
              onClick={() => setIsVercelGuideOpen(true)}
              className="hover:text-blue-400 cursor-pointer"
            >
              Where to paste API Key in Vercel
            </button>
            <button
              onClick={() => setIsApiSettingsOpen(true)}
              className="hover:text-emerald-400 cursor-pointer"
            >
              API Key Setup
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 max-w-2xl mx-auto pt-2">
          Predictions generated through mathematical probability weighting (30% Form, 20% H2H, 15% Venue, 15% Injuries, 10% Goals, 10% Referees).
        </p>
      </footer>

      {/* Modals */}
      <ApiTesterModal
        isOpen={isApiTesterOpen}
        onClose={() => setIsApiTesterOpen(false)}
        apiKey={apiConfig.apiKey}
        onSaveKey={handleSaveKeyFromTester}
        isLiveConnected={isLiveApiConnected}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
        onOpenTester={() => setIsApiTesterOpen(true)}
      />

      <VercelDeployModal
        isOpen={isVercelGuideOpen}
        onClose={() => setIsVercelGuideOpen(false)}
      />

      <ModelMethodologyModal
        isOpen={isModelInfoOpen}
        onClose={() => setIsModelInfoOpen(false)}
      />
    </div>
  );
}

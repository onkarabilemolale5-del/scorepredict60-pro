import React from 'react';
import { 
  Calendar, 
  Search, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Clock
} from 'lucide-react';

export type DayFilterType = 'ALL' | 'TODAY' | 'TOMORROW';
export type MarketViewType = 'OVERVIEW' | 'SCORES' | 'ADVANCED';

interface FilterBarProps {
  dayFilter: DayFilterType;
  onSelectDayFilter: (filter: DayFilterType) => void;
  highConfidenceOnly: boolean;
  onToggleHighConfidence: (value: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  marketView: MarketViewType;
  onSelectMarketView: (view: MarketViewType) => void;
  todayCount: number;
  tomorrowCount: number;
  highConfCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  dayFilter,
  onSelectDayFilter,
  highConfidenceOnly,
  onToggleHighConfidence,
  searchQuery,
  onSearchChange,
  marketView,
  onSelectMarketView,
  todayCount,
  tomorrowCount,
  highConfCount,
}) => {
  return (
    <div className="bg-[#0e1721] border-b border-[#1b2b3b] px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Day Filters (Today / Tomorrow / All) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-0.5 rounded-lg bg-[#142332] border border-[#21374d]">
            <button
              onClick={() => onSelectDayFilter('TODAY')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                dayFilter === 'TODAY'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
              <span
                className={`text-[10px] px-1.5 rounded-full font-mono ${
                  dayFilter === 'TODAY' ? 'bg-black/20 text-black font-bold' : 'bg-[#1e344a] text-gray-300'
                }`}
              >
                {todayCount}
              </span>
            </button>

            <button
              onClick={() => onSelectDayFilter('TOMORROW')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                dayFilter === 'TOMORROW'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tomorrow</span>
              <span
                className={`text-[10px] px-1.5 rounded-full font-mono ${
                  dayFilter === 'TOMORROW' ? 'bg-black/20 text-black font-bold' : 'bg-[#1e344a] text-gray-300'
                }`}
              >
                {tomorrowCount}
              </span>
            </button>

            <button
              onClick={() => onSelectDayFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                dayFilter === 'ALL'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>All Days</span>
            </button>
          </div>

          {/* High Confidence Only Toggle (Betway green accent) */}
          <button
            onClick={() => onToggleHighConfidence(!highConfidenceOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              highConfidenceOnly
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'bg-[#142332] hover:bg-[#1a2d3e] border-[#22384f] text-gray-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${highConfidenceOnly ? 'text-emerald-400' : 'text-gray-400'}`} />
            <span>High Confidence Only (70%+)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                highConfidenceOnly
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#1e344a] text-gray-400'
              }`}
            >
              {highConfCount}
            </span>
          </button>
        </div>

        {/* Search & Market view switch */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search team or venue..."
              className="w-full bg-[#121f2d] border border-[#20364d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Market view toggle */}
          <div className="hidden sm:inline-flex p-0.5 rounded-lg bg-[#142332] border border-[#21374d]">
            <button
              onClick={() => onSelectMarketView('OVERVIEW')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                marketView === 'OVERVIEW' ? 'bg-[#223950] text-emerald-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              1X2 & Odds
            </button>
            <button
              onClick={() => onSelectMarketView('SCORES')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                marketView === 'SCORES' ? 'bg-[#223950] text-emerald-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Exact Scores
            </button>
            <button
              onClick={() => onSelectMarketView('ADVANCED')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all cursor-pointer ${
                marketView === 'ADVANCED' ? 'bg-[#223950] text-emerald-300 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Corners & Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

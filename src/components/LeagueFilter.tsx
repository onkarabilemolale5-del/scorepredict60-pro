import React from 'react';
import { LeagueId } from '../types/football';
import { LEAGUES } from '../services/footballApi';

interface LeagueFilterProps {
  selectedLeague: LeagueId | 'ALL';
  onSelectLeague: (leagueId: LeagueId | 'ALL') => void;
  leagueCounts: Record<string, number>;
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({
  selectedLeague,
  onSelectLeague,
  leagueCounts,
}) => {
  const totalCount = Object.values(leagueCounts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-[#0b1319] border-b border-[#182633] py-2.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {/* ALL LEAGUES BUTTON */}
          <button
            onClick={() => onSelectLeague('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              selectedLeague === 'ALL'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-[#121e29] hover:bg-[#1a2b3b] text-gray-300 border border-[#203447]'
            }`}
          >
            <span>All Leagues</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedLeague === 'ALL'
                  ? 'bg-black/30 text-black font-bold'
                  : 'bg-[#1e3245] text-gray-300'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* 9 SPECIFIC LEAGUES */}
          {LEAGUES.map((league) => {
            const count = leagueCounts[league.id] || 0;
            const isSelected = selectedLeague === league.id;

            return (
              <button
                key={league.id}
                onClick={() => onSelectLeague(league.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-[#121e29] hover:bg-[#1a2b3b] text-gray-300 border border-[#203447]'
                }`}
              >
                <img
                  src={league.logo}
                  alt={league.name}
                  className="w-4 h-4 object-contain shrink-0 rounded-sm"
                  onError={(e) => {
                    // Fallback to text initials if image network fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span>{league.shortName}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/30 text-black font-bold'
                        : 'bg-[#1e3245] text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

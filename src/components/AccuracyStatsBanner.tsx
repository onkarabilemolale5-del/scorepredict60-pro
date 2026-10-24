import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Percent, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface AccuracyStatsBannerProps {
  totalMatches: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  onOpenModelModal: () => void;
}

export const AccuracyStatsBanner: React.FC<AccuracyStatsBannerProps> = ({
  totalMatches,
  highConfidenceCount,
  mediumConfidenceCount,
  onOpenModelModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="bg-[#0f1923] border-b border-[#1b2b3b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main highlights */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 bg-[#142332] px-3 py-1.5 rounded-lg border border-[#21374d]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Algorithm Standard</span>
                <span className="font-bold text-white text-xs sm:text-sm">Target 60%+ Strike Rate</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#142332] px-3 py-1.5 rounded-lg border border-[#21374d]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">High Confidence (70%+)</span>
                <span className="font-bold text-emerald-400 text-xs sm:text-sm">{highConfidenceCount} Matches</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#142332] px-3 py-1.5 rounded-lg border border-[#21374d]">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-mono">Medium (60 - 69%)</span>
                <span className="font-bold text-amber-300 text-xs sm:text-sm">{mediumConfidenceCount} Matches</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Low confidence (&lt;60%) matches are automatically suppressed.</span>
            </div>
          </div>

          {/* Toggle details & Model link */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-300 hover:text-emerald-400 flex items-center gap-1 bg-[#142332] hover:bg-[#1a2e42] px-2.5 py-1.5 rounded-lg border border-[#21374d] transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExpanded ? 'Hide Formula' : '6-Factor Model Weights'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenModelModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Methodology</span>
            </button>
          </div>
        </div>

        {/* Expandable Model Weight Breakdown */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#1a2d3e] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Team Form</span>
                <span className="text-emerald-400 font-bold font-mono">30%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[30%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Last 5 games W-D-L + xG momentum</p>
            </div>

            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Head to Head</span>
                <span className="text-emerald-400 font-bold font-mono">20%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[20%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Last 5 head-to-head encounters</p>
            </div>

            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Home / Away</span>
                <span className="text-emerald-400 font-bold font-mono">15%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[15%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Venue strength & away travel burden</p>
            </div>

            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Injuries / Bans</span>
                <span className="text-emerald-400 font-bold font-mono">15%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[15%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Star missing XI impact penalties</p>
            </div>

            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Goals Conceded</span>
                <span className="text-emerald-400 font-bold font-mono">10%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[10%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Clean sheet rates & defense baseline</p>
            </div>

            <div className="bg-[#121f2d] p-2.5 rounded-lg border border-[#1e344a]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Referee Stats</span>
                <span className="text-emerald-400 font-bold font-mono">10%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[10%]"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Cards & penalty tendency correlation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

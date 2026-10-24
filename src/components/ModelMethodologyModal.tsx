import React from 'react';
import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  BarChart3, 
  Target, 
  CheckCircle2, 
  Percent, 
  Flame,
  Award 
} from 'lucide-react';

interface ModelMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelMethodologyModal: React.FC<ModelMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e1722] border border-[#20364d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a111a] px-5 py-4 border-b border-[#1b2f44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ScorePredictPro 60 Logic</h2>
              <p className="text-xs text-gray-400">Target 60%+ Accuracy Quantitative Model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#162536] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-gray-300 max-h-[75vh] overflow-y-auto">
          {/* Key Principle */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Strict Non-Random Principle
            </span>
            <p className="text-gray-200 text-[11.5px] leading-relaxed">
              Predictions are generated using a 6-factor bivariate Poisson distribution combined with Elo team power rankings. Matches with less than 60% computed confidence are strictly filtered out of the system.
            </p>
          </div>

          {/* The 6 Weights Specified in Requirements */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
              Exact 6-Factor Formula Breakdown
            </h3>

            <div className="space-y-2 text-[11.5px]">
              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  30%
                </span>
                <div>
                  <span className="font-bold text-white block">Team Form (Weighted Exponential Decay)</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Analyzes the last 5 matches with exponential weight placed on the most recent 2 matches, including expected goals (xG) generated vs conceded.
                  </p>
                </div>
              </div>

              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  20%
                </span>
                <div>
                  <span className="font-bold text-white block">Head to Head (H2H) Historical Matchups</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Assesses psychological and tactical matchup dominance over the last 5 direct clashes between the two clubs.
                  </p>
                </div>
              </div>

              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  15%
                </span>
                <div>
                  <span className="font-bold text-white block">Home vs. Away Performance</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Calculates venue goal differential, home crowd advantage multiplier (+0.28 lambda xG in European leagues), and visitor travel fatigue.
                  </p>
                </div>
              </div>

              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  15%
                </span>
                <div>
                  <span className="font-bold text-white block">Injuries & Suspensions Penalty Metric</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Applies tiered deductions based on absent starting XI personnel (e.g. key goalkeeper, defensive anchor, or top goalscorer).
                  </p>
                </div>
              </div>

              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  10%
                </span>
                <div>
                  <span className="font-bold text-white block">Goals Scored / Conceded Defensive Baseline</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Season-long attack and defensive coefficients determining likelihood of clean sheets and Over/Under 2.5 goals.
                  </p>
                </div>
              </div>

              <div className="bg-[#121f2d] p-3 rounded-xl border border-[#1e344a] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs font-mono">
                  10%
                </span>
                <div>
                  <span className="font-bold text-white block">Referee Tendencies (Discipline & Penalties)</span>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Tracks the appointed referee's historical bookings/game and spot-kick awards to project total cards and penalty probabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Categories */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <span className="font-bold text-white text-xs block">Confidence Thresholds</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#0b141d] p-2 rounded-lg border border-emerald-500/40">
                <span className="text-emerald-400 font-bold block">HIGH</span>
                <span className="text-white font-mono">70%+</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Prime Value</span>
              </div>

              <div className="bg-[#0b141d] p-2 rounded-lg border border-amber-500/40">
                <span className="text-amber-400 font-bold block">MEDIUM</span>
                <span className="text-white font-mono">60% - 69%</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Qualified</span>
              </div>

              <div className="bg-[#0b141d] p-2 rounded-lg border border-rose-500/40">
                <span className="text-rose-400 font-bold block">LOW</span>
                <span className="text-white font-mono">&lt; 60%</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Suppressed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0a111a] px-5 py-3.5 border-t border-[#1b2f44] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

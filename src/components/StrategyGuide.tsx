import React from 'react';
import { ShieldCheck, Target, Zap, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StrategyGuide: React.FC = () => {
  return (
    <div className="space-y-3.5 pb-24">
      {/* Strategy Title */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Day Trading Strategy Playbook</span>
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Execution hierarchy and mandatory rules. Follow strictly in this order.
        </p>
      </div>

      {/* Step 1 */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
            1
          </span>
          <span>DAILY = BIAS</span>
        </div>
        <p className="text-xs text-gray-300">
          Determine overall institutional order flow direction (Bullish or Bearish).
        </p>
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-2.5 flex items-start gap-2 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="font-semibold">
            GOLDEN RULE: Never trade against Daily Bias. If Daily is Bullish, you ONLY seek longs.
          </span>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
            2
          </span>
          <span>4H = TREND + POI</span>
        </div>
        <p className="text-xs text-gray-300">
          Confirm structural alignment and mark institutional Point of Interest (POI).
        </p>
        <ul className="text-xs text-gray-400 space-y-1 pl-4 list-disc font-mono">
          <li>Bullish Structure: Higher Highs & Higher Lows (HH / HL)</li>
          <li>Bearish Structure: Lower Lows & Lower Highs (LL / LH)</li>
          <li>POI: High timeframe Supply or Demand zone where price must tap</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
            3
          </span>
          <span>1 HR = OB + MSS + LIQUIDITY</span>
        </div>
        <p className="text-xs text-gray-300">
          Wait for the 3-part confirmation formula inside the 4H POI zone:
        </p>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300 bg-gray-900/60 p-1.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Liquidity Sweep: Previous highs/lows purged</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 bg-gray-900/60 p-1.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MSS: Market Structure Shift (displacement break)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 bg-gray-900/60 p-1.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Last Order Block: The mitigation level to enter</span>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
            4
          </span>
          <span>15M / 5M = ENTRY TRIGGER</span>
        </div>
        <p className="text-xs text-gray-300">
          Only look for entry on the lower timeframe when the 1H setup is completely ready.
        </p>
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-300 font-mono">
          ● ENTRY TRIGGERED: BUY or SELL limit/market at the Order Block with predefined Stop Loss and minimum 1:2 R:R target.
        </div>
      </div>

      {/* Order Block Rule */}
      <div className="bg-[#0f172a] border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">
            ★
          </span>
          <span>ORDER BLOCK IDENTIFIER (ICT / SMC)</span>
        </div>
        <p className="text-xs text-emerald-300/90 font-mono">
          <strong>Auto-detect Rule:</strong> Last RED candle before 2 big GREEN candles (Bullish OB).
        </p>
        <ul className="text-xs text-gray-400 space-y-1 pl-4 list-disc font-mono">
          <li><strong>OB High / OB Low:</strong> The boundaries of the detected Order Block candle</li>
          <li><strong>OB Mid:</strong> (OB High + OB Low) / 2 — Your institutional entry point</li>
          <li><strong>Chart Box:</strong> Green translucent rectangle outlining the active OB zone</li>
          <li><strong>Status:</strong> Valid OB (fresh/active) vs. OB Mitigated (already tested)</li>
        </ul>
      </div>

      {/* Entry / SL / TP 1:2 Rule */}
      <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
            ★
          </span>
          <span>ENTRY / SL / TP RULES (LOCKED 1:2 RATIO)</span>
        </div>
        <div className="text-xs font-mono text-gray-300 space-y-1 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800">
          <div><strong className="text-white">Entry:</strong> = OB Mid</div>
          <div><strong className="text-rose-400">Stop Loss (SL):</strong> = OB Low - buffer</div>
          <div className="text-[11px] text-gray-400 pl-2">
            • BTCUSD: 150$ | XAUUSD (Gold): 5$ | NAS100: 30 pts | EUR/GBP: 10 pips
          </div>
          <div><strong className="text-emerald-400">Take Profit (TP):</strong> = Entry + (Entry - SL) × 2</div>
          <div className="text-[11px] text-emerald-300/90 font-bold pl-2">
            • Locked to 1:2 Risk : Reward only (Non-editable)
          </div>
        </div>
      </div>

      {/* Symbol Cheat Sheet & Lot Sizing */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 space-y-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Lot Sizing Reference
        </h3>
        <div className="text-xs font-mono text-gray-300 space-y-1">
          <div><strong className="text-amber-400">XAUUSD (Gold):</strong> 1.0 Lot = 100 oz. $1 move = $100 ($10/pip). Buffer: 5$.</div>
          <div><strong className="text-cyan-400">NAS100:</strong> 1.0 Lot = $1/point (retail CFD) or $20/point (futures). Buffer: 30 pts.</div>
          <div><strong className="text-blue-400">EURUSD/GBPUSD:</strong> 1.0 Lot = 100k units = $10/pip. Buffer: 10 pips.</div>
          <div><strong className="text-purple-400">BTCUSD:</strong> 1.0 Lot = 1 BTC. $1 move = $1. Buffer: 150$.</div>
        </div>
      </div>
    </div>
  );
};

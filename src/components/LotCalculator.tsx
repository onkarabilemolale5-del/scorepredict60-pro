import React, { useState, useEffect } from 'react';
import { calculateLotSize } from '../utils/lotCalculator';
import { Copy, Check, Calculator, ShieldCheck, Target, ArrowRight } from 'lucide-react';

interface LotCalculatorProps {
  initialSymbol?: string;
  initialEntryPrice?: number;
  initialSLPips?: number;
  onSendToJournal?: (calcData: {
    symbol: string;
    lotSize: number;
    riskAmount: number;
    slPips: number;
  }) => void;
}

export const LotCalculator: React.FC<LotCalculatorProps> = ({
  initialSymbol = 'XAUUSD',
  initialEntryPrice = 2652.40,
  initialSLPips = 25,
  onSendToJournal,
}) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('daytrader_balance');
    return saved ? parseFloat(saved) : 10000;
  });
  const [riskPercent, setRiskPercent] = useState<number>(() => {
    const saved = localStorage.getItem('daytrader_risk_pct');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [slPips, setSlPips] = useState<number>(initialSLPips);
  const [nasContractType, setNasContractType] = useState<'CFD_1' | 'STANDARD_20'>('CFD_1');
  const [copied, setCopied] = useState(false);

  // Price distance calculator helper
  const [entryPrice, setEntryPrice] = useState<number>(initialEntryPrice);
  const [slPrice, setSlPrice] = useState<number>(
    initialSymbol === 'XAUUSD' ? initialEntryPrice - 2.5 : initialEntryPrice - 40
  );
  const [calcMode, setCalcMode] = useState<'pips' | 'prices'>('pips');

  // Save balance and risk preferences
  useEffect(() => {
    localStorage.setItem('daytrader_balance', String(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('daytrader_risk_pct', String(riskPercent));
  }, [riskPercent]);

  // Sync symbol from props when passed
  useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol);
  }, [initialSymbol]);

  // If using price mode, calculate pips automatically
  useEffect(() => {
    if (calcMode === 'prices' && entryPrice > 0 && slPrice > 0) {
      const diff = Math.abs(entryPrice - slPrice);
      if (symbol === 'XAUUSD') {
        setSlPips(Math.round(diff * 10)); // 1 pip = $0.10
      } else if (symbol === 'EURUSD' || symbol === 'GBPUSD') {
        setSlPips(Math.round(diff * 10000)); // 1 pip = 0.0001
      } else {
        setSlPips(Math.round(diff)); // 1 pip/point = 1.0
      }
    }
  }, [calcMode, entryPrice, slPrice, symbol]);

  const result = calculateLotSize({
    balance,
    riskPercent,
    slPips,
    symbol,
    nasContractType,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(result.lotSize.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Target prices for 1:2 and 1:3 RR
  const tp2Pips = slPips * 2;
  const tp3Pips = slPips * 3;

  return (
    <div className="space-y-4 pb-24">
      {/* Title Header */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Position Lot Calculator
            </h2>
            <p className="text-[11px] text-gray-400">
              Precise risk calculation tailored for {symbol}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-400 uppercase block">Max Risk</span>
          <span className="text-sm font-bold font-mono text-rose-400">
            ${result.riskAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Parameters Card */}
      <div className="bg-[#0f172a]/90 border border-gray-800 rounded-xl p-4 space-y-3.5">
        {/* Symbol Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Trading Symbol
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {['XAUUSD', 'NAS100', 'EURUSD', 'GBPUSD', 'BTCUSD'].map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`py-2 px-2 text-xs font-mono font-bold rounded-lg border transition ${
                  symbol === s
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Account Balance */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Account Balance ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-sm">$</span>
            <input
              type="number"
              min="1"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#1e293b] text-white font-mono font-bold text-base pl-7 pr-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[5000, 10000, 25000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                onClick={() => setBalance(preset)}
                className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-[10px] font-mono text-gray-400"
              >
                ${preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Percentage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-300">
              Risk Percentage (%)
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {riskPercent}% = ${result.riskAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[0.5, 1.0, 1.5, 2.0].map((pct) => (
              <button
                key={pct}
                onClick={() => setRiskPercent(pct)}
                className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                  riskPercent === pct
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <input
            type="range"
            min="0.25"
            max="5"
            step="0.25"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* NAS100 Specific Setting */}
        {symbol === 'NAS100' && (
          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
            <label className="text-[11px] font-bold text-indigo-300 block mb-1">
              NAS100 Broker Contract Spec:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setNasContractType('CFD_1')}
                className={`p-2 rounded font-mono font-bold border transition ${
                  nasContractType === 'CFD_1'
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <div>CFD standard ($1 / pt)</div>
                <div className="text-[9px] font-normal opacity-80">FTMO, FundedNext, IC</div>
              </button>
              <button
                onClick={() => setNasContractType('STANDARD_20')}
                className={`p-2 rounded font-mono font-bold border transition ${
                  nasContractType === 'STANDARD_20'
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                <div>Futures standard ($20 / pt)</div>
                <div className="text-[9px] font-normal opacity-80">Full size contract</div>
              </button>
            </div>
          </div>
        )}

        {/* Stop Loss Input Mode */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Stop Loss (SL)
            </label>
            <div className="flex items-center text-[10px] bg-gray-800 rounded p-0.5 border border-gray-700">
              <button
                onClick={() => setCalcMode('pips')}
                className={`px-2 py-0.5 rounded font-semibold ${
                  calcMode === 'pips' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                }`}
              >
                Pips / Points
              </button>
              <button
                onClick={() => setCalcMode('prices')}
                className={`px-2 py-0.5 rounded font-semibold ${
                  calcMode === 'prices' ? 'bg-emerald-600 text-white' : 'text-gray-400'
                }`}
              >
                Entry & SL Price
              </button>
            </div>
          </div>

          {calcMode === 'pips' ? (
            <div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={slPips}
                  onChange={(e) => setSlPips(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono font-bold text-base px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-gray-400">
                  {symbol === 'NAS100' ? 'points' : 'pips'}
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {(symbol === 'XAUUSD'
                  ? [15, 20, 25, 30, 40]
                  : symbol === 'NAS100'
                  ? [20, 30, 40, 50, 75]
                  : [10, 15, 20, 25, 30]
                ).map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlPips(val)}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-[10px] font-mono text-gray-400"
                  >
                    {val} {symbol === 'NAS100' ? 'pts' : 'pips'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono font-bold text-xs p-2 rounded border border-gray-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Stop Loss Price</label>
                <input
                  type="number"
                  step="any"
                  value={slPrice}
                  onChange={(e) => setSlPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono font-bold text-xs p-2 rounded border border-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULT CARD */}
      <div className="bg-gradient-to-br from-[#0a1912] via-[#0f172a] to-[#090d16] border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xl">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
            RECOMMENDED LOT SIZE
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
            {result.lotSize.toFixed(2)}{' '}
            <span className="text-lg font-bold text-emerald-500/80">LOTS</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY LOT SIZE'}</span>
            </button>
          </div>
        </div>

        {/* Calculation Details */}
        <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Max Risk ($)</span>
            <span className="font-bold text-rose-400">${result.riskAmount.toFixed(2)}</span>
          </div>
          <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Pip Value per Lot</span>
            <span className="font-bold text-gray-200">${result.pipValuePerLot.toFixed(2)} / pip</span>
          </div>
        </div>

        {/* Take Profit Target Projections */}
        <div className="mt-3 bg-gray-900/80 rounded-xl p-3 border border-gray-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-blue-400" /> Reward Targets
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/20">
              <div className="text-emerald-400 font-bold">1:2 R:R (Target 1)</div>
              <div className="text-white font-bold">+${(result.riskAmount * 2).toFixed(2)}</div>
              <div className="text-[10px] text-gray-400">{tp2Pips} pips reward</div>
            </div>
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/20">
              <div className="text-emerald-400 font-bold">1:3 R:R (Target 2)</div>
              <div className="text-white font-bold">+${(result.riskAmount * 3).toFixed(2)}</div>
              <div className="text-[10px] text-gray-400">{tp3Pips} pips reward</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

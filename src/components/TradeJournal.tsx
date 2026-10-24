import React, { useState } from 'react';
import { JournalEntry } from '../types/trading';
import {
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  MinusCircle,
  Download,
  Calendar,
} from 'lucide-react';

interface TradeJournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  onUpdateStatus: (id: string, status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN', pnl?: number, rr?: number) => void;
  onDeleteEntry: (id: string) => void;
  onClearJournal: () => void;
}

export const TradeJournal: React.FC<TradeJournalProps> = ({
  entries,
  onAddEntry,
  onUpdateStatus,
  onDeleteEntry,
  onClearJournal,
}) => {
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual entry modal state
  const [newSymbol, setNewSymbol] = useState('XAUUSD');
  const [newType, setNewType] = useState<'BUY' | 'SELL'>('BUY');
  const [newEntryPrice, setNewEntryPrice] = useState<number>(2652.4);
  const [newSL, setNewSL] = useState<number>(2648.0);
  const [newTP, setNewTP] = useState<number>(2660.0);
  const [newLotSize, setNewLotSize] = useState<number>(0.5);
  const [newNotes, setNewNotes] = useState<string>('');

  // Editing result modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPnl, setEditPnl] = useState<number>(100);
  const [editStatus, setEditStatus] = useState<'WIN' | 'LOSS' | 'BREAKEVEN'>('WIN');

  // Filtered list
  const filtered = entries.filter((e) => {
    if (filterSymbol !== 'ALL' && e.symbol !== filterSymbol) return false;
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    return true;
  });

  // Calculate statistics
  const closedTrades = entries.filter((e) => e.status !== 'OPEN');
  const winTrades = entries.filter((e) => e.status === 'WIN');
  const winRate = closedTrades.length > 0 ? Math.round((winTrades.length / closedTrades.length) * 100) : 0;
  const totalPnl = entries.reduce((acc, curr) => acc + (curr.pnl || 0), 0);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      symbol: newSymbol,
      type: newType,
      entryPrice: newEntryPrice,
      stopLoss: newSL,
      takeProfit: newTP,
      lotSize: newLotSize,
      status: 'OPEN',
      notes: newNotes,
    });
    setShowAddModal(false);
  };

  const handleSaveResult = (id: string) => {
    const finalPnl = editStatus === 'LOSS' ? -Math.abs(editPnl) : editStatus === 'BREAKEVEN' ? 0 : Math.abs(editPnl);
    onUpdateStatus(id, editStatus, finalPnl);
    setEditingId(null);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trade-journal-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Journal Header with Stats */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Trading Journal
              </h2>
              <p className="text-[10px] text-gray-400">Track entries, setups, and P&L results</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Trade</span>
            </button>
            {entries.length > 0 && (
              <button
                onClick={exportJSON}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                title="Export Journal JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Performance metrics banner */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase block">Total Trades</span>
            <span className="text-sm font-extrabold text-white">{entries.length}</span>
          </div>
          <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase block">Win Rate</span>
            <span
              className={`text-sm font-extrabold ${
                winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {winRate}%
            </span>
          </div>
          <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase block">Net P&L</span>
            <span
              className={`text-sm font-extrabold ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
          {['ALL', 'XAUUSD', 'NAS100', 'EURUSD', 'GBPUSD', 'BTCUSD'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSymbol(s)}
              className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border shrink-0 transition ${
                filterSymbol === s
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-700 shrink-0"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="WIN">Win</option>
          <option value="LOSS">Loss</option>
          <option value="BREAKEVEN">Breakeven</option>
        </select>
      </div>

      {/* Trade Log Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-[#0f172a]/60 border border-gray-800/80 rounded-2xl p-6">
          <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-300">No Trades Recorded Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            When you run "Check For Entry" on Home and entry triggers, tap "Log to Journal" to record it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((trade) => {
            const isBuy = trade.type === 'BUY';
            const dateStr = new Date(trade.timestamp).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={trade.id}
                className="bg-[#0f172a] border border-gray-800 rounded-xl p-3 shadow-md hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trade.type}
                    </span>
                    <span className="font-mono font-bold text-sm text-white">
                      {trade.symbol}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {trade.lotSize.toFixed(2)} lots
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        trade.status === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : trade.status === 'LOSS'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : trade.status === 'BREAKEVEN'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {trade.status}
                    </span>
                    <button
                      onClick={() => onDeleteEntry(trade.id)}
                      className="p-1 text-gray-500 hover:text-rose-400"
                      title="Delete trade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entry & Targets Grid */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono bg-gray-900/60 p-2 rounded-lg border border-gray-800/80 mb-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Entry</span>
                    <span className="font-bold text-gray-200">{trade.entryPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Stop Loss</span>
                    <span className="font-bold text-rose-400">{trade.stopLoss.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Take Profit</span>
                    <span className="font-bold text-emerald-400">{trade.takeProfit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Outcome row */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-500" /> {dateStr}
                  </span>

                  {trade.status === 'OPEN' ? (
                    <button
                      onClick={() => {
                        setEditingId(trade.id);
                        setEditPnl(100);
                        setEditStatus('WIN');
                      }}
                      className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-500 text-white font-semibold text-[10px]"
                    >
                      Update Outcome
                    </button>
                  ) : (
                    <span
                      className={`font-mono font-bold ${
                        (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(trade.pnl || 0) >= 0
                        ? `+$${(trade.pnl || 0).toFixed(2)}`
                        : `-$${Math.abs(trade.pnl || 0).toFixed(2)}`}
                    </span>
                  )}
                </div>

                {/* Setup Snapshot info */}
                {trade.setupSnapshot && (
                  <div className="mt-2 text-[10px] font-mono text-gray-400 bg-gray-950/40 px-2 py-1 rounded border border-gray-800 flex items-center justify-between">
                    <span>Daily: {trade.setupSnapshot.dailyBias}</span>
                    <span>4H: {trade.setupSnapshot.trend4h}</span>
                    <span>MSS: {trade.setupSnapshot.mss ? 'YES' : 'NO'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Editing Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 max-w-xs w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Record Trade Outcome
            </h3>

            <div className="grid grid-cols-3 gap-1.5">
              {(['WIN', 'LOSS', 'BREAKEVEN'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setEditStatus(st)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    editStatus === st
                      ? st === 'WIN'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : st === 'LOSS'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-gray-600 text-white border-gray-400'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {editStatus !== 'BREAKEVEN' && (
              <div>
                <label className="text-xs text-gray-300 block mb-1">Profit / Loss ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editPnl}
                    onChange={(e) => setEditPnl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1e293b] text-white font-mono font-bold text-sm pl-7 pr-3 py-1.5 rounded-lg border border-gray-700"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveResult(editingId)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateEntry}
            className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Log New Trade
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400 block mb-0.5">Symbol</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-[#1e293b] text-white font-mono text-xs p-2 rounded-lg border border-gray-700"
                >
                  <option value="XAUUSD">XAUUSD</option>
                  <option value="NAS100">NAS100</option>
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="BTCUSD">BTCUSD</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-0.5">Type</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setNewType('BUY')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold font-mono ${
                      newType === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('SELL')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold font-mono ${
                      newType === 'SELL' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newEntryPrice}
                  onChange={(e) => setNewEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono text-xs p-1.5 rounded border border-gray-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newSL}
                  onChange={(e) => setNewSL(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono text-xs p-1.5 rounded border border-gray-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newTP}
                  onChange={(e) => setNewTP(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1e293b] text-white font-mono text-xs p-1.5 rounded border border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Lot Size</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={newLotSize}
                onChange={(e) => setNewLotSize(parseFloat(e.target.value) || 0.01)}
                className="w-full bg-[#1e293b] text-white font-mono text-xs p-1.5 rounded border border-gray-700"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Notes</label>
              <input
                type="text"
                placeholder="e.g. 1H MSS confirmation with London session sweep"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#1e293b] text-white text-xs p-1.5 rounded border border-gray-700"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Log Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

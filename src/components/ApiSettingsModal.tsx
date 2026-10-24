import React, { useState } from 'react';
import { 
  Key, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  X,
  Sparkles,
  Database,
  Terminal,
  RefreshCw,
  Layers
} from 'lucide-react';
import { ApiConfig } from '../types/football';
import { 
  DEFAULT_API_FOOTBALL_KEY, 
  getStoredBackupApiKey,
  setStoredBackupApiKey,
  testApiFootballConnection
} from '../services/apiFootballService';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (config: ApiConfig) => void;
  onOpenTester?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onOpenTester,
}) => {
  const [apiKey, setApiKey] = useState<string>(config.apiKey || DEFAULT_API_FOOTBALL_KEY);
  const [backupApiKey, setBackupApiKey] = useState<string>(() => config.backupApiKey || getStoredBackupApiKey());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedPrimary = apiKey.trim();
    const trimmedBackup = backupApiKey.trim();

    onSaveConfig({
      provider: 'api-football',
      apiKey: trimmedPrimary,
      backupApiKey: trimmedBackup,
      isCustomKeyActive: Boolean(trimmedPrimary),
      lastUpdated: new Date().toISOString(),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('NEXT_PUBLIC_API_FOOTBALL_KEY', trimmedPrimary);
      localStorage.setItem('api_football_key', trimmedPrimary);
      setStoredBackupApiKey(trimmedBackup);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleTestKey = async (keyToTest: string, label: string) => {
    if (!keyToTest.trim()) {
      setTestStatus(`Please enter a valid ${label} first.`);
      return;
    }
    setIsTesting(true);
    setTestStatus(`Testing ${label}...`);
    try {
      const res = await testApiFootballConnection(keyToTest.trim(), '2026-10-24');
      if (res.success) {
        setTestStatus(`✓ ${label} Valid! Returned ${res.data?.response?.length || 0} fixtures.`);
      } else {
        setTestStatus(`✗ ${label}: ${res.message}`);
      }
    } catch (err: any) {
      setTestStatus(`Error testing key: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e1722] border border-[#20364d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a111a] px-5 py-4 border-b border-[#1b2f44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">API-Football Keys &amp; Limit Protection</h2>
              <p className="text-xs text-gray-400">Primary Key + Backup Failover • 6-Hour Cache Guard</p>
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
          {/* 6-Hour Cache & Limit Protection Banner */}
          <div className="bg-[#122332] p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                100 Req/Day API Limit Protection Active
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-700">
                6-Hour Cache Enabled
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              API results are saved with timestamp in LocalStorage. Page loads automatically use the cache without consuming requests. Only tapping <strong>Refresh Live Fixtures</strong> forces a new call.
            </p>
          </div>

          {/* Primary API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-bold uppercase font-mono text-[10.5px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Primary API-Football Key
              </label>
              <button
                type="button"
                onClick={() => handleTestKey(apiKey, 'Primary Key')}
                disabled={isTesting}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer disabled:opacity-50"
              >
                Test Primary
              </button>
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. d3810746e485f09be228b26e5386ee16"
              className="w-full bg-[#121f2d] border border-[#20364d] rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-gray-400">
              User real key sent via <code>x-apisports-key</code> header to <code>v3.football.api-sports.io</code>.
            </p>
          </div>

          {/* Secondary Backup API Key Input */}
          <div className="space-y-1.5 bg-[#0a121c] p-3 rounded-xl border border-blue-900/40">
            <div className="flex items-center justify-between">
              <label className="text-blue-300 font-bold uppercase font-mono text-[10.5px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Secondary Backup API Key (Auto Failover)
              </label>
              <button
                type="button"
                onClick={() => handleTestKey(backupApiKey, 'Backup Key')}
                disabled={isTesting || !backupApiKey.trim()}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline cursor-pointer disabled:opacity-50"
              >
                Test Backup
              </button>
            </div>
            <input
              type="text"
              value={backupApiKey}
              onChange={(e) => setBackupApiKey(e.target.value)}
              placeholder="Enter second/backup free API key (optional)"
              className="w-full bg-[#121f2d] border border-blue-900/60 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10.5px] text-gray-400">
              If your primary key reaches 100 requests/day (429 or quota limit), the app automatically switches to this backup key.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div className={`p-2.5 rounded-lg text-xs font-mono border ${
              testStatus.startsWith('✓') 
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300' 
                : 'bg-[#1e1416] border-rose-800/60 text-rose-300'
            }`}>
              {testStatus}
            </div>
          )}

          {/* Quick Test Full JSON Button */}
          {onOpenTester && (
            <div className="bg-[#0b141d] p-3 rounded-xl border border-[#162737] flex items-center justify-between">
              <div>
                <span className="text-white font-bold block text-xs">Full API JSON Inspector</span>
                <span className="text-[10px] text-gray-400">View exact raw JSON response from API-Football</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTester();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open Tester</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0a111a] px-5 py-3.5 border-t border-[#1b2f44] flex items-center justify-between">
          <span className="text-[11px] text-emerald-400 font-mono">
            Primary: {apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}` : 'None'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-[#142332] hover:bg-[#1a2d40] border border-[#20364d] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save & Protect'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

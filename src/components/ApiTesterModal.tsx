import React, { useState } from 'react';
import { 
  Terminal, 
  X, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Code,
  Layers,
  Key
} from 'lucide-react';
import { 
  testApiFootballConnection, 
  ApiTestResult, 
  DEFAULT_API_FOOTBALL_KEY, 
  API_FOOTBALL_BASE,
  getStoredBackupApiKey 
} from '../services/apiFootballService';

interface ApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey?: (key: string) => void;
  isLiveConnected: boolean;
}

export const ApiTesterModal: React.FC<ApiTesterModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  isLiveConnected,
}) => {
  const [testDate, setTestDate] = useState<string>('2026-10-24');
  const [inputKey, setInputKey] = useState<string>(apiKey || DEFAULT_API_FOOTBALL_KEY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'TESTER' | 'VERCEL_GUIDE'>('TESTER');

  if (!isOpen) return null;

  const activeUrl = `${API_FOOTBALL_BASE}/fixtures?date=${testDate}`;

  const runTest = async () => {
    setIsLoading(true);
    const res = await testApiFootballConnection(inputKey, testDate);
    setTestResult(res);
    setIsLoading(false);
  };

  const copyJson = () => {
    if (testResult) {
      navigator.clipboard.writeText(JSON.stringify(testResult.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0c141d] border border-[#1f344a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#070d13] px-5 py-4 border-b border-[#182a3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">API-Football Connection Tester</h2>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                  Live Key: d3810...ee16
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Endpoint: <span className="font-mono text-emerald-400">/fixtures?date={testDate}</span> • Header: <span className="font-mono text-emerald-400">x-apisports-key</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#162536] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-[#162534] bg-[#091118] px-5 text-xs">
          <button
            onClick={() => setActiveTab('TESTER')}
            className={`py-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'TESTER'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Live Endpoint Test & JSON Response</span>
          </button>

          <button
            onClick={() => setActiveTab('VERCEL_GUIDE')}
            className={`py-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'VERCEL_GUIDE'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Where to Paste in Vercel</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'TESTER' ? (
            <>
              {/* Controls bar */}
              <div className="bg-[#101b26] p-3.5 rounded-xl border border-[#1b2f44] space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">
                      Target Fixture Date (Endpoint: /fixtures?date=...)
                    </label>
                    <input
                      type="text"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      placeholder="2026-10-24"
                      className="w-full bg-[#0a1219] border border-[#1d3247] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={runTest}
                      disabled={isLoading}
                      className="w-full sm:w-auto py-2 px-5 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black" />
                      )}
                      <span>{isLoading ? 'Querying...' : 'Execute Test Call (2026-10-24)'}</span>
                    </button>
                  </div>
                </div>

                {/* Live URL Display */}
                <div className="bg-[#080e14] p-2.5 rounded-lg border border-[#16293a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-400 shrink-0">URL:</span>
                    <span className="font-mono text-[11px] text-emerald-400 truncate">
                      {activeUrl}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    Direct API-Football Query • Header: x-apisports-key
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-mono text-gray-400">
                      API-Football Key (api-football.com)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Header: x-apisports-key
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="Paste your api-football key here..."
                      className="flex-1 bg-[#0a1219] border border-[#1d3247] rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    {onSaveKey && (
                      <button
                        onClick={() => {
                          onSaveKey(inputKey);
                          runTest();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#142637] hover:bg-[#1a334a] border border-[#23425e] text-emerald-300 font-semibold cursor-pointer"
                      >
                        Save &amp; Test
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 text-[10.5px] text-gray-400 flex items-center justify-between flex-wrap gap-2">
                    <span>Host: <strong className="text-gray-300 font-mono">https://v3.football.api-sports.io</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInputKey(DEFAULT_API_FOOTBALL_KEY)}
                        className="text-[10px] text-emerald-400 hover:underline font-mono"
                      >
                        Use Primary
                      </button>
                      {getStoredBackupApiKey() && (
                        <button
                          type="button"
                          onClick={() => setInputKey(getStoredBackupApiKey())}
                          className="text-[10px] text-blue-400 hover:underline font-mono"
                        >
                          Use Backup Key
                        </button>
                      )}
                    </div>
                    <span className="text-emerald-400 font-mono">Active Key: {inputKey ? `${inputKey.slice(0, 6)}...${inputKey.slice(-4)}` : 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Response Panel */}
              <div className="bg-[#091118] border border-[#192b3e] rounded-xl overflow-hidden">
                <div className="bg-[#060c12] px-4 py-2 border-b border-[#18293b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gray-400">Response JSON</span>
                    {testResult && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded font-mono ${
                          testResult.success
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        HTTP {testResult.status} {testResult.success ? 'OK' : 'FAIL'}
                      </span>
                    )}
                    {testResult?.rateLimit?.remaining && (
                      <span className="text-[10px] text-gray-400">
                        Calls Remaining: <strong className="text-white">{testResult.rateLimit.remaining}</strong>
                      </span>
                    )}
                  </div>

                  {testResult && (
                    <button
                      onClick={copyJson}
                      className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="p-3">
                  {testResult ? (
                    <div>
                      <div className="mb-2 p-2 rounded bg-[#0e1924] border border-[#1b3147] text-[11px]">
                        <span className="text-gray-400 block font-mono">Status Message:</span>
                        <span className={testResult.success ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                          {testResult.message}
                        </span>
                      </div>
                      <pre className="max-h-72 overflow-y-auto font-mono text-[11px] text-emerald-300/90 leading-tight bg-[#04080c] p-3 rounded-lg border border-[#11202f]">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 space-y-2">
                      <Terminal className="w-8 h-8 mx-auto text-gray-600" />
                      <p>Click &quot;Execute Test Call (2026-10-24)&quot; above to query API-Football directly.</p>
                      <p className="text-[11px] text-gray-600 font-mono">
                        Endpoint: https://v3.football.api-sports.io/fixtures?date=2026-10-24
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* VERCEL KEY SETUP GUIDE */
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Exact Location to Paste in Vercel
                </span>
                <p className="text-gray-300 text-[11.5px] leading-relaxed">
                  To keep your API key permanently active when deployed on Vercel without hardcoding it in your repository:
                </p>
              </div>

              {/* Step by Step visual walkthrough */}
              <div className="space-y-3">
                <div className="bg-[#101b26] p-3.5 rounded-xl border border-[#1b2f44] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="text-white font-bold">Go to your Vercel Project Dashboard</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Open <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com/dashboard</a> and select your <strong>ScorePredictPro 60</strong> project.
                    </p>
                  </div>
                </div>

                <div className="bg-[#101b26] p-3.5 rounded-xl border border-[#1b2f44] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="text-white font-bold">Navigate to &quot;Settings&quot; &gt; &quot;Environment Variables&quot;</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      In the top navigation tabs of your Vercel project, click <strong>Settings</strong>, then click <strong>Environment Variables</strong> in the left sidebar menu.
                    </p>
                  </div>
                </div>

                <div className="bg-[#101b26] p-3.5 rounded-xl border border-[#1b2f44] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div className="w-full">
                    <h4 className="text-white font-bold">Add the Variable</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5 mb-2">
                      Enter the key name and your API-Football token:
                    </p>

                    <div className="bg-[#070d13] p-3 rounded-lg border border-[#1b2f44] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-mono text-[10px]">KEY:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-emerald-300 font-bold font-mono bg-[#11202e] px-2 py-0.5 rounded">
                            NEXT_PUBLIC_API_FOOTBALL_KEY
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('NEXT_PUBLIC_API_FOOTBALL_KEY');
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-gray-400 hover:text-white"
                            title="Copy Key Name"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-[#162737] pt-2">
                        <span className="text-gray-400 font-mono text-[10px]">VALUE:</span>
                        <span className="text-gray-300 font-mono text-[11px]">
                          &lt;paste your api-football.com key&gt;
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-[#162737] pt-2">
                        <span className="text-gray-400 font-mono text-[10px]">TARGET ENV:</span>
                        <span className="text-white font-medium">Production, Preview, Development</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#101b26] p-3.5 rounded-xl border border-[#1b2f44] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="text-white font-bold">Save and Redeploy</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Click <strong>Save</strong>. In the <strong>Deployments</strong> tab, click the three dots &quot;...&quot; next to your latest deployment and select <strong>Redeploy</strong> so Vercel injects the variable into your build.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#070d13] px-5 py-3 border-t border-[#182a3d] flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            api-football.com • Free Plan (100 req/day)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

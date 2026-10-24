import React, { useState } from 'react';
import { 
  Rocket, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  FileCode,
  ShieldCheck 
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const vercelJsonSnippet = `{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e1722] border border-[#20364d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a111a] px-5 py-4 border-b border-[#1b2f44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Deploy ScorePredictPro 60 on Vercel</h2>
              <p className="text-xs text-gray-400">1-Click deploy guide for production</p>
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
          {/* Step 1 */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[11px] font-bold">1</span>
                Push your codebase to GitHub
              </span>
            </div>
            <p className="text-[11.5px] text-gray-300">
              Initialize a git repository if not already done, commit all files, and push to your GitHub account:
            </p>
            <div className="bg-[#080f16] p-2.5 rounded-lg border border-[#192a3b] font-mono text-[11px] text-gray-300 space-y-1">
              <div>git add .</div>
              <div>git commit -m &quot;feat: ScorePredictPro 60 football prediction app&quot;</div>
              <div>git push origin main</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[11px] font-bold">2</span>
                Import Project in Vercel
              </span>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
              >
                vercel.com/new <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11.5px]">
              <li>Log into Vercel and click <strong>&quot;Add New... &gt; Project&quot;</strong>.</li>
              <li>Select your repository from GitHub.</li>
              <li>Vercel automatically detects <strong>Vite</strong> as the framework preset.</li>
            </ul>
          </div>

          {/* Step 3: Build Settings */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <span className="font-bold text-white flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[11px] font-bold">3</span>
              Verify Build & Output Settings
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#080f16] p-2 rounded border border-[#1a2c3d]">
                <span className="text-gray-400 text-[10px] block">Build Command:</span>
                <span className="font-mono text-emerald-400 font-bold">npm run build</span>
              </div>
              <div className="bg-[#080f16] p-2 rounded border border-[#1a2c3d]">
                <span className="text-gray-400 text-[10px] block">Output Directory:</span>
                <span className="font-mono text-emerald-400 font-bold">dist</span>
              </div>
            </div>
          </div>

          {/* Step 4: Environment Variables for API-Football */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <span className="font-bold text-white flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[11px] font-bold">4</span>
              Where to Paste your API Key in Vercel
            </span>
            <p className="text-[11.5px] text-gray-300">
              In your Vercel Project Dashboard: go to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>:
            </p>
            <div className="bg-[#080f16] p-2.5 rounded border border-[#1a2c3d] space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center text-emerald-300">
                <span>Key: NEXT_PUBLIC_API_FOOTBALL_KEY</span>
                <button
                  onClick={() => copyToClipboard('NEXT_PUBLIC_API_FOOTBALL_KEY', 'env-key')}
                  className="text-gray-400 hover:text-white p-1"
                  title="Copy Key Name"
                >
                  {copiedSection === 'env-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-gray-400 border-t border-[#192b3c] pt-1.5 flex justify-between">
                <span>Value: &lt;your_free_api_key_from_api_football&gt;</span>
                <span className="text-[10px] text-gray-500 font-sans">Prod / Preview / Dev</span>
              </div>
            </div>
            <p className="text-[10.5px] text-gray-400">
              After adding, click <strong>Save</strong> and trigger a quick <strong>Redeploy</strong> from the Deployments tab.
            </p>
          </div>

          {/* vercel.json snippet */}
          <div className="bg-[#121f2d] p-3.5 rounded-xl border border-[#1e344a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                vercel.json (SPA Routing)
              </span>
              <button
                onClick={() => copyToClipboard(vercelJsonSnippet, 'json')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'json' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#080f16] p-2.5 rounded-lg border border-[#192a3b] font-mono text-[11px] text-gray-300 overflow-x-auto">
              {vercelJsonSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0a111a] px-5 py-3.5 border-t border-[#1b2f44] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

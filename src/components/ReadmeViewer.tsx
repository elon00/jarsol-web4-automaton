import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Rocket, 
  Copy, 
  Check, 
  Coins,
  Cpu
} from 'lucide-react';
import { playCyberClick } from '../utils/audio';

interface ReadmeViewerProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ReadmeViewer: React.FC<ReadmeViewerProps> = ({ onToast }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    onToast(`Copied ${section} to clipboard`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL OPERATIONS & ARCHITECTURE MANUAL</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              v4.0.0 Production
            </span>
          </div>

          <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
            JarSol // Conway Automaton 4.0 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">README</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-mono">
            Complete architectural reference, terminal command cheatsheet, smart contract specifications, and Google Gemini 3.7 Flash integration details.
          </p>
        </div>
      </div>

      {/* Manual Content Sections */}
      <div className="space-y-6">
        {/* Quick Start */}
        <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>1. QUICK START COMMANDS</span>
            </div>
            <button
              onClick={() => handleCopy(quickStartCmd, 'Quick Start Commands')}
              className="p-1 text-slate-400 hover:text-white"
            >
              {copiedSection === 'Quick Start Commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed">
            {quickStartCmd}
          </pre>
        </div>

        {/* Project Architecture */}
        <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-sm border-b border-cyan-950 pb-2">
            <Cpu className="w-4 h-4" />
            <span>2. CORE PROTOCOL STACK</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold text-xs block">Neural Reasoning</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Google Gemini 3.7 Flash integration with multi-agent persona switching, autonomous execution loops, and real-time regulatory compliance scanning.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-xs block">Solana SPL Token-2022</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1,000 Trillion $JARSOL total supply with 9 decimals on Solana Testnet/Devnet. 100% permanently burned Raydium LP and revocable mint authority.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-purple-400 font-bold text-xs block">Post-Quantum Security</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) lattice cryptography protecting against Shor's discrete logarithm attacks up to 10,000 logical qubits.
              </p>
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-sm border-b border-cyan-950 pb-2">
            <Code2 className="w-4 h-4" />
            <span>3. REST API ENDPOINTS</span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex justify-between items-center">
              <div><strong className="text-emerald-400">POST</strong> <span className="text-cyan-300">/api/gemini/chat</span></div>
              <span className="text-slate-500 text-[11px]">Real Gemini 3.7 Flash reasoning stream</span>
            </div>
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex justify-between items-center">
              <div><strong className="text-emerald-400">POST</strong> <span className="text-cyan-300">/api/gemini/audit</span></div>
              <span className="text-slate-500 text-[11px]">AI SEC Howey & MiCA double-audit scanner</span>
            </div>
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex justify-between items-center">
              <div><strong className="text-emerald-400">POST</strong> <span className="text-cyan-300">/api/solana/airdrop</span></div>
              <span className="text-slate-500 text-[11px]">2.0 Devnet SOL airdrop request</span>
            </div>
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex justify-between items-center">
              <div><strong className="text-emerald-400">POST</strong> <span className="text-cyan-300">/api/solana/deploy-token</span></div>
              <span className="text-slate-500 text-[11px]">Deploy 1,000T SPL Token-2022 on Solana</span>
            </div>
            <div className="p-3 rounded-lg bg-black/50 border border-slate-800 flex justify-between items-center">
              <div><strong className="text-emerald-400">POST</strong> <span className="text-cyan-300">/api/pqc/generate-keys</span></div>
              <span className="text-slate-500 text-[11px]">NIST FIPS 204 ML-DSA lattice key generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const quickStartCmd = `# 1. Install Full-Stack Dependencies
npm install

# 2. Launch Backend Server & Vite UI concurrently
npm start

# 3. Access Full Web 4.0 Dashboard
Open http://localhost:5173 in browser`;

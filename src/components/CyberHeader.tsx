import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Coins, 
  Wallet, 
  RefreshCw, 
  Terminal, 
  Zap, 
  Globe, 
  ExternalLink,
  Radio,
  ArrowDownUp,
  Crown,
  Gamepad2,
  Film
} from 'lucide-react';
import { WalletState, NetworkType } from '../types';
import { playCyberClick, playSuccessChime } from '../utils/audio';
import { requestDevnetAirdrop } from '../utils/solana';

interface CyberHeaderProps {
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onNetworkChange: (net: NetworkType) => void;
  onRefreshBalance: () => void;
  metabolismScore: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  wallet,
  onOpenWalletModal,
  onNetworkChange,
  onRefreshBalance,
  metabolismScore,
  activeTab,
  setActiveTab,
  onToast,
}) => {
  const [requestingAirdrop, setRequestingAirdrop] = React.useState(false);

  const handleAirdrop = async () => {
    if (!wallet.address) {
      onToast('Please connect a wallet first to receive Devnet SOL.', 'warning');
      return;
    }
    playCyberClick();
    setRequestingAirdrop(true);
    onToast('Requesting 2.0 Devnet SOL airdrop from Solana RPC...', 'info');

    const res = await requestDevnetAirdrop(wallet.address, 2, wallet.network as 'devnet' | 'testnet');
    setRequestingAirdrop(false);

    if (res.success) {
      playSuccessChime();
      onToast(`Airdrop of 2.0 SOL confirmed!`, 'success');
      onRefreshBalance();
    } else {
      onToast(res.error || 'Airdrop rate limit reached. Try https://faucet.solana.com', 'error');
    }
  };

  const navItems = [
    { id: 'metaverse', label: '🎮 24/7 Metaverse Game', badge: 'Dual-World' },
    { id: 'videos', label: '🎬 Sci-Fi 4K Videos', badge: '60FPS' },
    { id: 'kingdom', label: '👑 Sci-Fi Kingdom', badge: 'King/Genie' },
    { id: 'jarvis', label: '🎙️ Humanoid Jarvis', badge: 'Face-to-Face' },
    { id: 'dex', label: '🔄 Real DEX Swap', badge: 'Raydium' },
    { id: 'launchpad', label: '🚀 Launchpad', badge: '1,000T' },
    { id: 'conway', label: '🧬 Conway Matrix', badge: 'B3/S23' },
    { id: 'terminal', label: '🤖 Gemini Brain', badge: '3.6 Flash' },
    { id: 'pqc', label: '🛡️ PQC Shield', badge: 'FIPS 204' },
    { id: 'tokenomics', label: '📊 Tokenomics', badge: 'Global Mkt' },
    { id: 'audit', label: '⚖️ Legal Double-Audit', badge: 'SEC/MiCA' },
    { id: 'workflow', label: '⚡ Workflow', badge: 'Web 4.0' },
    { id: 'whitepaper', label: '📄 Whitepaper', badge: '6 Ch' },
    { id: 'readme', label: '📖 Readme', badge: 'Docs' },
  ];

  return (
    <header className="border-b border-cyan-900/60 bg-[#040a0e]/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-cyan-950/20">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-cyan-950/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>24/7 METAVERSE DUAL-WORLD ACTIVE</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">| Real-Time Speech & 60FPS Video Streaming</span>
          <span className="text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 font-mono text-[10px]">
            1,000 Trillion $JARSOL SPL-2022
          </span>
        </div>

        {/* Live Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>METABOLISM:</span>
            <span className={`font-bold ${metabolismScore > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metabolismScore.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">PQC:</span>
            <span className="text-cyan-400 font-bold">NIST FIPS 204</span>
          </div>

          {/* Network Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded px-2 py-0.5 text-[11px]">
            <Globe className="w-3 h-3 text-cyan-400" />
            <select
              value={wallet.network}
              onChange={(e) => {
                playCyberClick();
                onNetworkChange(e.target.value as NetworkType);
              }}
              className="bg-transparent text-cyan-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="devnet" className="bg-slate-900 text-slate-100">Solana Devnet</option>
              <option value="testnet" className="bg-slate-900 text-slate-100">Solana Testnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Nav & Wallet Action Bar */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div 
          onClick={() => { playCyberClick(); setActiveTab('metaverse'); }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 font-cyber font-black text-lg group-hover:border-emerald-300 transition-all shadow-[0_0_15px_rgba(0,255,120,0.3)]">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cyber font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-300 text-base">
                Jarvis Metaverse
              </span>
              <span className="text-[10px] text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/40 bg-emerald-950/40 font-mono">
                24/7 World
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-none">Real World ↔ Virtual Game & Video Matrix</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full no-scrollbar">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playCyberClick();
                  setActiveTab(item.id);
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/80 shadow-[0_0_12px_rgba(0,255,120,0.3)] font-semibold'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[9px] px-1 rounded ${
                  active ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Wallet & Airdrop Actions */}
        <div className="flex items-center gap-2">
          {wallet.connected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAirdrop}
                disabled={requestingAirdrop}
                title="Request 2.0 Devnet SOL airdrop"
                className="px-2 py-1.5 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Coins className={`w-3.5 h-3.5 ${requestingAirdrop ? 'animate-spin' : ''}`} />
                <span>+2.0 SOL</span>
              </button>

              <div 
                onClick={onOpenWalletModal}
                className="px-3 py-1 rounded bg-slate-900/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2 cursor-pointer hover:border-cyan-300 transition-all"
              >
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">
                    {wallet.solBalance.toFixed(3)} SOL
                  </div>
                  <div className="font-bold">
                    {wallet.address?.substring(0, 4)}...{wallet.address?.substring(wallet.address.length - 4)}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                playCyberClick();
                onOpenWalletModal();
              }}
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,120,0.4)] transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

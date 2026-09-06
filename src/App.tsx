import React, { useState, useCallback } from 'react';
import { CyberHeader } from './components/CyberHeader';
import { WalletModal } from './components/WalletModal';
import { MetaverseGameEngine } from './components/MetaverseGameEngine';
import { MetaverseVideoEngine } from './components/MetaverseVideoEngine';
import { SciFiKingdomWorld } from './components/SciFiKingdomWorld';
import { TalkingJarvisWindow } from './components/TalkingJarvisWindow';
import { FloatingJarvisVoice } from './components/FloatingJarvisVoice';
import { RealDexExchange } from './components/RealDexExchange';
import { SolanaLaunchpad } from './components/SolanaLaunchpad';
import { ConwayLifeCanvas } from './components/ConwayLifeCanvas';
import { ConwayTerminal } from './components/ConwayTerminal';
import { PqcSecurityModule } from './components/PqcSecurityModule';
import { TokenomicsModule } from './components/TokenomicsModule';
import { LegalAuditor } from './components/LegalAuditor';
import { WorkflowViewer } from './components/WorkflowViewer';
import { WhitepaperReader } from './components/WhitepaperReader';
import { ReadmeViewer } from './components/ReadmeViewer';

import { WalletState, NetworkType } from './types';
import { fetchWalletBalance } from './utils/solana';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function App() {
  const [activeTab, setActiveTab] = useState<string>('jarvis'); // Default to Face-to-Face Humanoid Jarvis
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [metabolismScore, setMetabolismScore] = useState<number>(98.4);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalBg, setGlobalBg] = useState<string>('/sci_fi_throne_king.jpg');

  // Solana Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    publicKey: null,
    solBalance: 0,
    jarsolBalance: 0,
    walletType: null,
    network: 'devnet',
  });

  // Non-blocking Toast notification system
  const addToast = useCallback(
    (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Refresh Balance
  const refreshBalance = useCallback(async () => {
    if (wallet.address) {
      const b = await fetchWalletBalance(wallet.address, wallet.network);
      setWallet((prev) => ({
        ...prev,
        solBalance: b.sol,
      }));
    }
  }, [wallet.address, wallet.network]);


  const handleNetworkChange = (net: NetworkType) => {
    setWallet((prev) => ({ ...prev, network: net }));
    addToast(`Solana network switched to ${net.toUpperCase()}`, 'info');
  };

  const handleDisconnectWallet = () => {
    setWallet({
      connected: false,
      address: null,
      publicKey: null,
      solBalance: 0,
      jarsolBalance: 0,
      walletType: null,
      network: wallet.network,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030708] text-slate-100 font-mono relative overflow-x-hidden">
      {/* Subtle Global Ambient Sci-Fi Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 bg-cover bg-center z-0 transition-all duration-1000"
        style={{ backgroundImage: `url(${globalBg})` }}
      />

      {/* Toast Notification Container */}
      <div className="fixed top-14 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border flex items-start gap-2.5 shadow-2xl backdrop-blur-md text-xs font-mono animate-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/60 text-red-200 shadow-red-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-amber-950/50'
                : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-cyan-950/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}

            <div className="flex-1 leading-snug">{toast.text}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Cyber Header */}
      <CyberHeader
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onNetworkChange={handleNetworkChange}
        onRefreshBalance={refreshBalance}
        metabolismScore={metabolismScore}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToast={addToast}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onWalletConnected={(w) => {
          setWallet(w);
        }}
        onDisconnect={handleDisconnectWallet}
        onToast={addToast}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20 relative z-10">
        {activeTab === 'jarvis' && (
          <TalkingJarvisWindow
            wallet={wallet}
            onToast={addToast}
          />
        )}

        {activeTab === 'metaverse' && (
          <MetaverseGameEngine
            wallet={wallet}
            onToast={addToast}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'videos' && (
          <MetaverseVideoEngine
            onToast={addToast}
          />
        )}

        {activeTab === 'kingdom' && (
          <SciFiKingdomWorld
            wallet={wallet}
            onToast={addToast}
            onSetGlobalBg={setGlobalBg}
          />
        )}

        {activeTab === 'dex' && (
          <RealDexExchange
            wallet={wallet}
            onRefreshBalance={refreshBalance}
            onToast={addToast}
          />
        )}

        {activeTab === 'launchpad' && (
          <SolanaLaunchpad
            wallet={wallet}
            onRefreshBalance={refreshBalance}
            onToast={addToast}
          />
        )}

        {activeTab === 'conway' && (
          <ConwayLifeCanvas
            onMetabolismChange={setMetabolismScore}
            onToast={addToast}
          />
        )}

        {activeTab === 'terminal' && (
          <ConwayTerminal
            wallet={wallet}
            metabolismScore={metabolismScore}
            onToast={addToast}
          />
        )}

        {activeTab === 'pqc' && (
          <PqcSecurityModule onToast={addToast} />
        )}

        {activeTab === 'tokenomics' && (
          <TokenomicsModule onToast={addToast} />
        )}

        {activeTab === 'audit' && (
          <LegalAuditor onToast={addToast} />
        )}

        {activeTab === 'workflow' && (
          <WorkflowViewer onToast={addToast} />
        )}

        {activeTab === 'whitepaper' && (
          <WhitepaperReader onToast={addToast} />
        )}

        {activeTab === 'readme' && (
          <ReadmeViewer onToast={addToast} />
        )}
      </main>

      {/* Floating 2-Way Voice Assistant */}
      <FloatingJarvisVoice onToast={addToast} />

      {/* Persistent Cyber Footer */}
      <footer className="border-t border-cyan-950/60 bg-[#04080a] py-4 text-xs text-slate-500 font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-bold">Jarvis // JarSol Humanoid Voice AI</span>
            <span>- Solana Devnet/Testnet Active</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>NIST FIPS 203/204 PQC</span>
            <span>•</span>
            <span>1,000,000,000 JARSOL testnet supply</span>
            <span>•</span>
            <span>Reality-First verification enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

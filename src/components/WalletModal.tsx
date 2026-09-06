import React from 'react';
import { X, Wallet, CheckCircle2, Key, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import { WalletState } from '../types';
import { connectPhantomWallet, connectSolflareWallet, connectInstantDevnetKeypair } from '../utils/wallet';
import { playCyberClick, playSuccessChime } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onWalletConnected: (w: WalletState) => void;
  onDisconnect: () => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onWalletConnected,
  onDisconnect,
  onToast,
}) => {
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleConnectPhantom = async () => {
    playCyberClick();
    setConnecting('phantom');
    try {
      const state = await connectPhantomWallet(wallet.network);
      onWalletConnected(state);
      playSuccessChime();
      onToast('Connected to Phantom Wallet on Solana ' + wallet.network, 'success');
      onClose();
    } catch (err: any) {
      onToast(err.message, 'warning');
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectSolflare = async () => {
    playCyberClick();
    setConnecting('solflare');
    try {
      const state = await connectSolflareWallet(wallet.network);
      onWalletConnected(state);
      playSuccessChime();
      onToast('Connected to Solflare Wallet on Solana ' + wallet.network, 'success');
      onClose();
    } catch (err: any) {
      onToast(err.message, 'warning');
    } finally {
      setConnecting(null);
    }
  };

  const handleInstantKeypair = async () => {
    playCyberClick();
    setConnecting('keypair');
    try {
      const { walletState } = await connectInstantDevnetKeypair(wallet.network);
      onWalletConnected(walletState);
      playSuccessChime();
      onToast('Instant Ed25519 Devnet Keypair loaded into session!', 'success');
      onClose();
    } catch (err: any) {
      onToast('Failed to initialize keypair: ' + err.message, 'error');
    } finally {
      setConnecting(null);
    }
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onToast('Address copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#081215] border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-950/80 bg-cyan-950/20">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h3 className="font-cyber font-bold text-slate-100 text-sm tracking-wide">
              {wallet.connected ? 'Active Solana Wallet' : 'Connect Solana Wallet'}
            </h3>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {wallet.connected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900/80 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONNECTED ({wallet.network.toUpperCase()})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">Public Address</div>
                  <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-slate-800 text-xs font-mono text-cyan-300">
                    <span className="truncate mr-2">{wallet.address}</span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:text-white transition-colors"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">SOL Balance</span>
                    <span className="text-slate-200 font-mono font-bold">{wallet.solBalance.toFixed(4)} SOL</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Wallet Type</span>
                    <span className="text-cyan-400 font-mono font-bold capitalize">{wallet.walletType}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://explorer.solana.com/address/${wallet.address}?cluster=${wallet.network}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Solana Explorer</span>
                </a>
                <button
                  onClick={() => {
                    playCyberClick();
                    onDisconnect();
                    onToast('Wallet disconnected', 'info');
                    onClose();
                  }}
                  className="py-2 px-4 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-mono transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Select a Solana wallet provider. Testnet and devnet functionality should be verified before any production use.
              </p>

              {/* Instant Devnet Keypair Option */}
              <button
                onClick={handleInstantKeypair}
                disabled={!!connecting}
                className="w-full p-3.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-400/60 hover:border-cyan-300 text-left transition-all flex items-center justify-between group shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono text-base">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <span>Instant Devnet Keypair</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        1-CLICK FAST
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Auto-generates & stores an Ed25519 keypair for testnet testing</p>
                  </div>
                </div>
                <Key className="w-4 h-4 text-cyan-400" />
              </button>

              {/* Phantom */}
              <button
                onClick={handleConnectPhantom}
                disabled={!!connecting}
                className="w-full p-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-mono text-base">
                    👻
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                      Phantom Wallet
                    </div>
                    <p className="text-[11px] text-slate-400">Browser extension (Solana standard)</p>
                  </div>
                </div>
                {connecting === 'phantom' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
              </button>

              {/* Solflare */}
              <button
                onClick={handleConnectSolflare}
                disabled={!!connecting}
                className="w-full p-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono text-base">
                    🔥
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                      Solflare Wallet
                    </div>
                    <p className="text-[11px] text-slate-400">Web & extension wallet for Solana</p>
                  </div>
                </div>
                {connecting === 'solflare' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

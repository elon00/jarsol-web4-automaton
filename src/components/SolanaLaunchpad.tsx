import React from 'react';
import { Copy, ExternalLink, Lock, Rocket } from 'lucide-react';
import { WalletState } from '../types';
import { CANONICAL_DEPLOYMENTS } from '../utils/solana';

interface SolanaLaunchpadProps {
  wallet: WalletState;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onRefreshBalance: () => void;
}

export const SolanaLaunchpad: React.FC<SolanaLaunchpadProps> = ({ wallet, onToast }) => {
  const copyMint = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      onToast('Mint address copied.', 'info');
    } catch {
      onToast('Copy unavailable. Select the displayed address to copy it.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/40 bg-[#08171c] p-6 space-y-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
          <Rocket className="text-cyan-400" /> Solana launchpad reference
        </h1>
        <p className="text-slate-300">
          Browser deployment is unavailable. Connecting a wallet does not authorize token creation by the server.
          An operator must configure and review the testnet deployment separately.
        </p>
        <button disabled type="button" className="flex items-center gap-2 rounded border border-slate-700 px-4 py-3 text-slate-400 cursor-not-allowed">
          <Lock className="w-4 h-4" /> Operator deployment only
        </button>
        <p className="text-sm text-slate-400">Selected wallet network: {wallet.network}. No deployment or payment is requested by this page.</p>
      </section>
      <section className="rounded-2xl border border-cyan-500/40 bg-[#061217] p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Repository-recorded deployments</h2>
        <p className="text-sm text-slate-400">
          These records are static repository data. Supply, metadata and authority state are not verified by opening this page.
          Verify current chain state before relying on a record.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {(['devnet', 'testnet'] as const).map(network => {
            const record = CANONICAL_DEPLOYMENTS[network];
            return (
              <article key={network} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 space-y-3">
                <h3 className="font-bold text-cyan-300">{record.label}</h3>
                <div className="text-sm text-slate-400">Recorded mint address</div>
                <div className="break-all font-mono text-xs text-cyan-200">{record.mintAddress}</div>
                <div className="text-sm text-slate-400">Recorded supply: {record.totalSupply}</div>
                <div className="flex gap-4 text-sm text-cyan-300">
                  <button type="button" onClick={() => void copyMint(record.mintAddress)} className="flex items-center gap-1">
                    <Copy className="w-4 h-4" /> Copy mint
                  </button>
                  <a href={record.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" /> Verify in explorer
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

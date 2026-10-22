import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { WalletState } from '../types';

interface X402BazaarCommerceProps {
  wallet: WalletState;
  onRefreshBalance: () => void;
  onToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const X402BazaarCommerce: React.FC<X402BazaarCommerceProps> = ({ wallet }) => (
  <section className="p-6 rounded-2xl bg-[#08171c] border border-amber-500/40 space-y-4">
    <div className="flex items-center gap-2 text-amber-300">
      <ShieldCheck className="w-5 h-5" />
      <h1 className="font-bold text-xl">Agent commerce</h1>
      <span className="text-xs border border-amber-500/40 rounded px-2 py-1">Unavailable</span>
    </div>
    <p className="text-slate-300">No payment services are enabled on {wallet.network}. This page does not request or accept SOL.</p>
    <p className="text-sm text-slate-400">Commerce remains an experimental project feature. Live payment and service delivery are not available.</p>
  </section>
);

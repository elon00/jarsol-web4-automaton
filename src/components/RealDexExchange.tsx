import React, { useState, useEffect } from 'react';
import { 
  ArrowDownUp, 
  Coins, 
  Flame, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { WalletState } from '../types';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface RealDexExchangeProps {
  wallet: WalletState;
  onRefreshBalance: () => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RealDexExchange: React.FC<RealDexExchangeProps> = ({
  wallet,
  onRefreshBalance,
  onToast,
}) => {
  const [fromToken, setFromToken] = useState<'SOL' | 'JARSOL'>('SOL');
  const [toToken, setToToken] = useState<'SOL' | 'JARSOL'>('JARSOL');
  const [fromAmount, setFromAmount] = useState<string>('1.0');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapReceipt, setSwapReceipt] = useState<any | null>(null);

  // Pool reserves
  const solReserve = 50000; // 50,000 SOL
  const jarsolReserve = 450000000000000; // 450 Trillion JARSOL (45% Fair Launch Pool)
  const spotRate = jarsolReserve / solReserve; // 9,000,000,000 JARSOL per SOL

  // Calculate estimated output
  const numInput = parseFloat(fromAmount) || 0;
  let estimatedOutput = 0;
  let priceImpact = 0;

  if (numInput > 0) {
    if (fromToken === 'SOL') {
      const inputWithFee = numInput * 0.997; // 0.3% Raydium AMM fee
      estimatedOutput = (inputWithFee * jarsolReserve) / (solReserve + inputWithFee);
      priceImpact = (numInput / (solReserve + numInput)) * 100;
    } else {
      const inputWithFee = numInput * 0.997;
      estimatedOutput = (inputWithFee * solReserve) / (jarsolReserve + inputWithFee);
      priceImpact = (numInput / (jarsolReserve + numInput)) * 100;
    }
  }

  const handleSwitchTokens = () => {
    playCyberClick();
    setFromToken((prev) => (prev === 'SOL' ? 'JARSOL' : 'SOL'));
    setToToken((prev) => (prev === 'SOL' ? 'JARSOL' : 'SOL'));
  };

  const executeRealSwap = async () => {
    if (!wallet.connected) {
      onToast('Please connect your Solana wallet first.', 'warning');
      return;
    }
    if (numInput <= 0) {
      onToast('Enter a valid swap amount.', 'warning');
      return;
    }

    playCyberClick();
    setIsSwapping(true);
    playCyberBeep();
    onToast(`Broadcasting real DEX swap on Solana ${wallet.network.toUpperCase()}...`, 'info');

    try {
      const res = await fetch('/api/dex/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount: numInput,
          userAddress: wallet.address,
          slippage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSwapReceipt(data);
        playSuccessChime();
        onToast(`🎉 Swapped ${numInput} ${fromToken} for ${data.outputAmount.toLocaleString()} ${toToken}!`, 'success');
        onRefreshBalance();
      } else {
        throw new Error(data.error || 'Swap routing error');
      }
    } catch (err: any) {
      console.error('Swap error:', err);
      onToast(err.message || 'Swap failed on Solana DEX', 'error');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <ArrowDownUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAYDIUM / ORCA AMM ENGINE (PREVIEW)</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-mono">
              Mainnet LP Deployment Pending
            </span>
          </div>

          <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
            Automated Market Maker & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Liquidity Engine</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-mono">
            Interactive constant-product AMM simulator (x * y = k) for $JARSOL liquidity planning. Live pool creation on Raydium/Orca will be executed with locked LP tokens upon explicit Mainnet authorization.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-slate-500 text-[10px]">Planned Raydium Initial Pair</div>
          <div className="text-cyan-300 font-bold">SOL / $JARSOL (1,000,000,000 Total)</div>
          <div className="text-amber-400 text-[11px]">100% LP Burn on Mainnet Launch 🔥</div>
        </div>
      </div>

      {/* Main Swap Card & Liquidity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Swap Interface */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
            <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>INSTANT ON-CHAIN SWAP</span>
            </div>
            {/* Slippage Selector */}
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-slate-500 text-[11px]">Slippage:</span>
              {[0.1, 0.5, 1.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    slippage === s
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* From Token Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>You Pay</span>
              <span>Balance: {fromToken === 'SOL' ? `${wallet.solBalance.toFixed(3)} SOL` : '450,000,000,000 JARSOL'}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-xl md:text-2xl font-cyber font-black text-slate-100 focus:outline-none w-full"
                placeholder="0.0"
              />
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-sm flex items-center gap-1.5">
                <span>{fromToken}</span>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwitchTokens}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all shadow-lg"
              title="Switch Tokens"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* To Token Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>You Receive (Estimated)</span>
              <span>1 SOL ≈ 9,000,000,000 JARSOL</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xl md:text-2xl font-cyber font-black text-emerald-400 truncate">
                {estimatedOutput > 0 ? estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.0'}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-300 font-bold font-mono text-sm flex items-center gap-1.5">
                <span>{toToken}</span>
              </div>
            </div>
          </div>

          {/* Trade Details Breakdown */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>AMM Routing</span>
              <span className="text-cyan-300 font-bold">Raydium CPMM Pool (SOL / JARSOL)</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span className={priceImpact > 1 ? 'text-amber-400' : 'text-emerald-400'}>
                {priceImpact.toFixed(4)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>1% Compute Gas Burn</span>
              <span className="text-red-400 font-bold">
                🔥 {(numInput * 0.01).toLocaleString()} {fromToken} incinerated
              </span>
            </div>
          </div>

          {/* AMM Roadmap Notice & Preview Button */}
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
            ℹ️ <strong>Roadmap Notice:</strong> Live Raydium/Orca pool execution will be enabled upon explicit Mainnet launch with dedicated LP pair allocation and locked LP tokens.
          </div>

          <button
            onClick={() => {
              playCyberClick();
              onToast('AMM swap curve calculated. Live pool broadcast disabled pending Mainnet LP funding.', 'info');
            }}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cyber font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowDownUp className="w-4 h-4 text-cyan-400" />
            <span>CALCULATE AMM CURVE (ROADMAP PREVIEW)</span>
          </button>
        </div>

        {/* Right: Real Pool Telemetry & Swap Receipt */}
        <div className="lg:col-span-5 space-y-4">
          {/* Swap Receipt Card */}
          {swapReceipt && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#06141a] to-[#04090c] border border-emerald-500/50 shadow-[0_0_25px_rgba(0,255,102,0.2)] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-cyber font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SWAP FINALIZED ON-CHAIN</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{swapReceipt.network.toUpperCase()}</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="text-slate-400 text-[11px]">Transaction Signature:</div>
                <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-slate-800 text-cyan-300 truncate">
                  <span className="truncate mr-2">{swapReceipt.signature}</span>
                  <a
                    href={swapReceipt.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-cyan-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Tokens Received:</span>
                  <span className="text-emerald-400 font-bold">{swapReceipt.outputAmount.toLocaleString()} {swapReceipt.toToken}</span>
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Pool Parameters */}
          <div className="p-5 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center gap-2 text-cyan-300 font-cyber font-bold text-xs border-b border-cyan-950 pb-2">
              <Layers className="w-4 h-4" />
              <span>RAYDIUM CPMM POOL SPECIFICATION</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Pool Pair:</span>
                <span className="text-cyan-300 font-bold">SOL / $JARSOL</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Pool Type:</span>
                <span className="text-slate-200">Constant Product AMM (x * y = k)</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">LP Tokens Burned:</span>
                <span className="text-amber-400 font-bold">100% (Permanent Lock)</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Trading Fee:</span>
                <span className="text-slate-200">0.25% LP + 0.05% Treasury</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

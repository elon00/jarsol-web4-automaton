import React, { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Flame, 
  Percent, 
  Lock, 
  Globe2, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Calculator,
  Layers
} from 'lucide-react';
import { 
  TOKEN_ALLOCATIONS, 
  MARKETING_ROADMAP, 
  DEFLATIONARY_METRICS, 
  TOTAL_SUPPLY_FORMATTED 
} from '../data/tokenomicsData';
import { playCyberClick } from '../utils/audio';

interface TokenomicsModuleProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const TokenomicsModule: React.FC<TokenomicsModuleProps> = ({ onToast }) => {
  const [stakedAmount, setStakedAmount] = useState<number>(1000000000); // 1 Billion $JARSOL default
  const [stakeDurationMonths, setStakeDurationMonths] = useState<number>(12);
  const [dailyTxVolumeTrillions, setDailyTxVolumeTrillions] = useState<number>(5);

  // Staking reward calculation
  const calculatedRewards = (stakedAmount * (DEFLATIONARY_METRICS.stakingApyBase / 100) * (stakeDurationMonths / 12));
  const estimatedDailyBurnTokens = (dailyTxVolumeTrillions * 1_000_000_000_000 * (DEFLATIONARY_METRICS.burnTaxPercent / 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                <span>GLOBAL STANDARD TOKENOMICS</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                1,000 Trillion Hard Cap
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              $JARSOL Economic Model & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Marketing Strategy</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Designed according to Tier-1 global institutional crypto standards. Featuring 100% permanently burned Raydium liquidity, zero-inflation fixed supply, dynamic staking yields, and a 1% autonomous AI compute burn tax.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px] text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Total Fixed Supply</div>
              <div className="text-cyan-300 font-bold text-sm">1,000 Trillion</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Target Staking APY</div>
              <div className="text-emerald-400 font-bold text-sm">18.4% APY</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-slate-500 text-[10px]">LP Lock Status</div>
              <div className="text-amber-300 font-bold text-sm">100% Burned</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Gas Burn Tax</div>
              <div className="text-red-400 font-bold text-sm">1.0% Deflation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Distribution Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cyber font-bold text-slate-100 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>1,000 Trillion $JARSOL Macro Allocation Breakdown</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Fixed SPL-2022 Genesis Distribution</span>
        </div>

        {/* Visual Allocation Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-900 border border-slate-800">
          {TOKEN_ALLOCATIONS.map((item, idx) => (
            <div
              key={idx}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              title={`${item.category}: ${item.percentage}% (${item.amountTrillions}T)`}
              className="h-full transition-all hover:opacity-80 cursor-pointer"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOKEN_ALLOCATIONS.map((alloc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#081215] border border-cyan-950/80 hover:border-cyan-500/40 transition-all space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: alloc.color }}
                  />
                  <span className="font-bold text-xs text-slate-200">{alloc.category}</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {alloc.percentage}%
                </span>
              </div>

              <div className="text-lg font-cyber font-black text-slate-100">
                {alloc.amountTrillions} Trillion <span className="text-xs font-mono font-normal text-slate-400">$JARSOL</span>
              </div>

              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {alloc.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 space-y-1">
                <div><strong className="text-slate-400">Vesting:</strong> {alloc.vestingTerms}</div>
                <div><strong className="text-slate-400">Purpose:</strong> {alloc.purpose}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Marketing Strategy Roadmap */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-950/80 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-cyber font-bold text-slate-100 text-sm">
              Tier-1 Global Marketing & CEX Listing Execution Plan
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">
            Multi-Phase Growth Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKETING_ROADMAP.map((phase, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-3 ${
                phase.status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                  : phase.status === 'active'
                  ? 'bg-cyan-950/30 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-slate-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-400 font-bold">{phase.period}</span>
                <span className={`px-1.5 py-0.2 rounded uppercase text-[9px] font-bold ${
                  phase.status === 'completed' ? 'bg-emerald-900 text-emerald-300' : (phase.status === 'active' ? 'bg-cyan-900 text-cyan-300' : 'bg-slate-800 text-slate-500')
                }`}>
                  {phase.status}
                </span>
              </div>

              <div className="font-cyber font-bold text-xs text-slate-100">
                {phase.title}
              </div>

              <ul className="space-y-1.5 text-[11px] font-mono text-slate-300">
                {phase.deliverables.map((item, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">›</span>
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Staking & Deflationary Burn Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staking Calculator */}
        <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/40 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-xs">
            <Calculator className="w-4 h-4" />
            <span>CONWAY STAKING YIELD ESTIMATOR (18.4% APY)</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400">Staked $JARSOL Amount</label>
              <input
                type="number"
                value={stakedAmount}
                onChange={(e) => setStakedAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded bg-black/60 border border-slate-700 text-cyan-300 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Lock Duration: {stakeDurationMonths} Months</span>
                <span className="text-emerald-400 font-bold">18.4% Target APY</span>
              </div>
              <input
                type="range"
                min="1"
                max="48"
                value={stakeDurationMonths}
                onChange={(e) => setStakeDurationMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Projected Staking Yield</span>
                <span className="text-emerald-400 font-bold text-sm">
                  +{calculatedRewards.toLocaleString(undefined, { maximumFractionDigits: 0 })} $JARSOL
                </span>
              </div>
              <Percent className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Deflationary Burn Simulator */}
        <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/40 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-cyber font-bold text-xs">
            <Flame className="w-4 h-4" />
            <span>1% AUTONOMOUS AGENT GAS BURN SIMULATOR</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Daily Agentic Compute Volume: {dailyTxVolumeTrillions}T Tokens/Day</span>
                <span className="text-red-400 font-bold">1% Protocol Burn Tax</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={dailyTxVolumeTrillions}
                onChange={(e) => setDailyTxVolumeTrillions(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-red-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Daily Permanently Incinerated</span>
                  <span className="text-red-400 font-bold text-sm">
                    {estimatedDailyBurnTokens.toLocaleString()} $JARSOL / Day
                  </span>
                </div>
                <Flame className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500">
                Estimated Year 1 Circulating Supply Reduction: ~{(estimatedDailyBurnTokens * 365 / 1_000_000_000_000).toFixed(2)} Trillion Tokens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  GitCommit, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Rocket, 
  Flame, 
  Terminal, 
  Copy, 
  Check 
} from 'lucide-react';
import { WorkflowStage } from '../types';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface WorkflowViewerProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ onToast }) => {
  const [stages, setStages] = useState<WorkflowStage[]>([
    {
      id: 1,
      name: 'Stage 1: Cellular Entropy Harvest',
      category: 'AUTONOMOUS_CYCLE',
      description: 'Collects 2D Conway matrix generation state and computes cryptographic high-entropy seed.',
      status: 'pending',
      codeSnippet: `const seed = sha3_512(conwayGridState.buffer);
const vitalityScore = (activeCells / maxCapacity) * 100;`,
    },
    {
      id: 2,
      name: 'Stage 2: Gemini 3.7 Flash Neural Brain',
      category: 'AUTONOMOUS_CYCLE',
      description: 'Processes environmental sensory data and generates autonomous execution decisions on-chain.',
      status: 'pending',
      codeSnippet: `const action = await gemini.generateContent({
  contents: [{ role: 'agent', text: 'Evaluate on-chain liquidity depth & gas burn rate' }]
});`,
    },
    {
      id: 3,
      name: 'Stage 3: NIST FIPS 204 PQC Dual-Signing',
      category: 'PQC_ENCRYPTION',
      description: 'Wraps payload with hybrid Ed25519 + ML-DSA-65 quantum-resistant lattice signature.',
      status: 'pending',
      codeSnippet: `const signature = signHybridMessage(txPayload, mldsaKeyPair.publicKey);
assert(signature.quantumBits >= 192);`,
    },
    {
      id: 4,
      name: 'Stage 4: Solana Testnet SPL-2022 Settlement',
      category: 'SOLANA_ONCHAIN',
      description: 'Broadcasts atomic transaction to Solana Devnet/Testnet cluster with sub-second finality.',
      status: 'pending',
      codeSnippet: `const txSig = await sendAndConfirmTransaction(connection, transaction, [payer]);
console.log('Finalized on Solana Explorer:', txSig);`,
    },
    {
      id: 5,
      name: 'Stage 5: 1% Gas Deflationary Incineration',
      category: 'SOLANA_ONCHAIN',
      description: 'Automatically burns 1.0% $JARSOL execution fee to null address, boosting token scarcity.',
      status: 'pending',
      codeSnippet: `await burnChecked(connection, payer, ata, mint, payer, burnAmount, 9);
emit Event('DeflationaryBurnExecuted', { amount: burnAmount });`,
    },
    {
      id: 6,
      name: 'Stage 6: Autonomous Rent & Self-Funding',
      category: 'COMPLIANCE_SCAN',
      description: 'Agent pays for cloud compute and RPC rent from earned autonomous revenue stream.',
      status: 'pending',
      codeSnippet: `agentTreasury.balance -= hostingRentUsdc;
if (agentTreasury.balance > minThreshold) agent.maintainStatus('HEALTHY');`,
    },
  ]);

  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const runWorkflowPipeline = async () => {
    playCyberClick();
    setIsRunningPipeline(true);
    onToast('Starting Web 4.0 Autonomous Execution Pipeline...', 'info');

    // Reset stages
    setStages((prev) => prev.map((s) => ({ ...s, status: 'pending', outputLog: undefined })));

    for (let i = 0; i < stages.length; i++) {
      playCyberBeep();
      // Set current stage to running
      setStages((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s))
      );

      await new Promise((r) => setTimeout(r, 650));

      // Mark completed with log
      const mockLog = `[OK] Stage ${i + 1} completed at ${new Date().toLocaleTimeString()} // Verified 0x00`;
      setStages((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: 'completed', outputLog: mockLog } : s
        )
      );
    }

    setIsRunningPipeline(false);
    playSuccessChime();
    onToast('✅ Web 4.0 Pipeline executed autonomously across all 6 stages!', 'success');
  };

  const copySnippet = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(`stage-${id}`);
    setTimeout(() => setCopiedCode(null), 2000);
    onToast(`Copied Stage ${id} code snippet`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#07161b] via-[#040e13] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                <span>WEB 4.0 AUTONOMOUS AGENT WORKFLOW</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                Continuous Autonomous Cycle
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              6-Stage Autonomous Execution <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Architecture</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Watch how JarSol autonomously harvests cellular entropy, queries Google Gemini neural reasoning, signs with NIST Post-Quantum lattice keys, settles on Solana Testnet, and burns 1% $JARSOL gas in a closed-loop machine economy.
            </p>
          </div>

          <button
            onClick={runWorkflowPipeline}
            disabled={isRunningPipeline}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-cyber font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>EXECUTING WORKFLOW...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>RUN PIPELINE TEST</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6 Stages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const isDone = stage.status === 'completed';
          const isRunning = stage.status === 'running';

          return (
            <div
              key={stage.id}
              className={`p-5 rounded-xl border transition-all space-y-3 relative overflow-hidden ${
                isDone
                  ? 'bg-[#061715] border-emerald-500/50 text-slate-200 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                  : isRunning
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] animate-pulse'
                  : 'bg-[#081215] border-cyan-950/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-slate-800 text-cyan-400 font-bold">
                  {stage.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  {isDone && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                    </span>
                  )}
                  {isRunning && (
                    <span className="text-cyan-300 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> RUNNING
                    </span>
                  )}
                  {stage.status === 'pending' && <span className="text-slate-500">READY</span>}
                </div>
              </div>

              <div className="font-cyber font-bold text-xs text-slate-100">
                {stage.name}
              </div>

              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {stage.description}
              </p>

              {/* Code Snippet Box */}
              <div className="relative p-2.5 rounded-lg bg-black/70 border border-slate-800/80 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                <button
                  onClick={() => copySnippet(stage.codeSnippet, stage.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedCode === `stage-${stage.id}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <pre className="pr-6">{stage.codeSnippet}</pre>
              </div>

              {stage.outputLog && (
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                  {stage.outputLog}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

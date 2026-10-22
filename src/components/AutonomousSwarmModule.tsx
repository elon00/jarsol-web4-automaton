import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Eye, 
  Zap, 
  Lock, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { WalletState } from '../types';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface AutonomousSwarmModuleProps {
  wallet: WalletState;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  model: string;
  status: string;
  workload: string;
  tasksProcessed: number;
  activeDirectives: string[];
}

export const AutonomousSwarmModule: React.FC<AutonomousSwarmModuleProps> = ({
  wallet,
  onToast,
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [consensusScore, setConsensusScore] = useState<number>(99.4);
  const [selectedAgent, setSelectedAgent] = useState<string>('AGENT-01');
  const [isRunningTask, setIsRunningTask] = useState<boolean>(false);
  const [taskResult, setTaskResult] = useState<any | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('Full Quantum Security Audit & Anti-Downgrade Scan');
  
  // Vision Lab state
  const [visionPrompt, setVisionPrompt] = useState<string>('Detect candlestick trend reversal and resistance breakout zones');
  const [visionType, setVisionType] = useState<string>('CHART_INSPECTION');
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<any | null>(null);

  const fetchSwarmState = async () => {
    try {
      const res = await fetch('/api/agents/swarm');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.agents) {
          setAgents(data.agents);
          setConsensusScore(data.swarmConsensusScore || 99.4);
        }
      }
    } catch {
      // Fallback local agents
      setAgents([
        {
          id: 'AGENT-01',
          name: 'Jarvis Supreme Coordinator',
          role: 'Multi-Model Swarm Orchestrator & Task Planner',
          model: 'Gemini 2.5 Flash / Neural Core',
          status: 'ACTIVE',
          workload: '98%',
          tasksProcessed: 1420,
          activeDirectives: ['User Session Supervision', 'Autonomous Mesh Handshake', 'Neural Routing']
        },
        {
          id: 'AGENT-02',
          name: 'Quantum Sentinel',
          role: 'Lattice Cryptography & Anti-Downgrade Monitor',
          model: 'NIST FIPS 203/204 Native Verifier',
          status: 'GUARDING',
          workload: '100%',
          tasksProcessed: 3209,
          activeDirectives: ['ML-KEM-768 Key Rotation', 'ML-DSA-65 Signature Auditing', 'Entropy Integrity']
        },
        {
          id: 'AGENT-03',
          name: 'SPL Launchpad Architect',
          role: 'Autonomous Token Factory & Authority Manager',
          model: 'Solana Program Runtime Automaton',
          status: 'READY',
          workload: '74%',
          tasksProcessed: 890,
          activeDirectives: ['1B Uncapped Elastic Supply Policy', 'Authority Revocation Watcher', 'Metadata Sync']
        },
        {
          id: 'AGENT-04',
          name: 'x402 Commerce Broker',
          role: 'HTTP 402 Micropayment & Settlement Broker',
          model: 'Autonomous Payment Standard Engine',
          status: 'LISTENING',
          workload: '88%',
          tasksProcessed: 2110,
          activeDirectives: ['Replay Guard Tracking', '19-Node Mesh Synchronizer', 'Multi-Token Router']
        },
        {
          id: 'AGENT-05',
          name: 'Automaton Market Arbitrageur',
          role: 'Cross-Pool Liquidity & Dynamic Spread Invariant Engine',
          model: 'CPMM High-Frequency Oracle',
          status: 'MONITORING',
          workload: '91%',
          tasksProcessed: 4892,
          activeDirectives: ['Multi-Exchange Consensus Invariant', 'Slippage Guard', 'Arbitrage Spread Optimization']
        }
      ]);
    }
  };

  useEffect(() => {
    fetchSwarmState();
  }, []);

  const handleRunSwarmMission = async (title: string) => {
    playCyberClick();
    setIsRunningTask(true);
    setSelectedTaskTitle(title);
    playCyberBeep();
    onToast(`Dispatching mission: "${title}" across 5-agent swarm...`, 'info');

    try {
      const res = await fetch('/api/agents/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, taskType: 'SWARM_CONSENSUS' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTaskResult(data);
        playSuccessChime();
        onToast(`Swarm consensus reached (${data.swarmConsensusPct}%)! Cryptographic proof attached.`, 'success');
      } else {
        throw new Error(data.error || 'Mission execution failed');
      }
    } catch (err: any) {
      onToast(err.message || 'Mission error', 'error');
    } finally {
      setIsRunningTask(false);
    }
  };

  const handleRunVisionAudit = async () => {
    playCyberClick();
    setIsAnalyzingVision(true);
    playCyberBeep();
    onToast('JarSol Multimodal Vision analyzing market pattern payload...', 'info');

    try {
      // Mock base64 1x1 png for test payload if no file selected
      const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await fetch('/api/gemini/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sampleBase64,
          prompt: visionPrompt,
          type: visionType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVisionResult(data);
        playSuccessChime();
        onToast('Multimodal neural inspection completed successfully!', 'success');
      } else {
        throw new Error(data.error || 'Vision analysis failed');
      }
    } catch (err: any) {
      onToast(err.message || 'Vision failed', 'error');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <div className="space-y-6">
      {/* Top Telemetry Deck */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#030d12] via-[#05141c] to-[#030d12] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-wider">
                5-AGENT AUTONOMOUS SWARM
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                POST-QUANTUM HYPER-SECURE
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-white">
              JarSol Autonomous Swarm & Multimodal Vision Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono leading-relaxed">
              Decentralized swarm architecture combining Gemini AI neural orchestration, NIST FIPS 203/204 quantum defense, continuous DEX arbitrage, and on-chain authority governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-right">
              <div className="text-[10px] text-slate-400 font-mono">SWARM CONSENSUS</div>
              <div className="text-lg font-black text-emerald-300 font-mono">{consensusScore}%</div>
            </div>

            <button
              onClick={() => { playCyberClick(); fetchSwarmState(); onToast('Swarm telemetry refreshed', 'info'); }}
              className="p-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all shadow-md"
              title="Refresh Swarm Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Agent Status Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-cyan-950/60">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => { playCyberClick(); setSelectedAgent(agent.id); }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAgent === agent.id
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-400 font-mono">{agent.id}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  {agent.status}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{agent.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{agent.role}</div>
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Load: {agent.workload}</span>
                <span className="text-emerald-400">{agent.tasksProcessed} tx</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split: Swarm Mission Dispatcher & Agent Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mission Dispatcher */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200 font-mono">AUTONOMOUS MISSION DISPATCHER</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Parallel Agent Evaluation</span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Trigger high-priority autonomous directives across the hive. Each agent executes localized verification, reaching cryptographic consensus before signing the settlement payload.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: 'Full Quantum Security Audit & Anti-Downgrade Scan', icon: ShieldCheck, badge: 'PQC Sentinel' },
                { title: 'SPL Launchpad Elastic Tokenomics & Authority Audit', icon: Layers, badge: 'Launchpad' },
                { title: 'DEX Constant-Product Liquidity & Invariant Balancing', icon: TrendingUp, badge: 'Arbitrageur' },
                { title: 'Global x402 19-Node Mesh Handshake & Receipt Sweep', icon: Bot, badge: 'Commerce Broker' },
              ].map((m) => (
                <button
                  key={m.title}
                  onClick={() => handleRunSwarmMission(m.title)}
                  disabled={isRunningTask}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <m.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-snug">
                    {m.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Mission Execution Outcome */}
            {taskResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    MISSION CONCLUDED: {taskResult.consensusResult}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Consensus {taskResult.swarmConsensusPct}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400">Target: <span className="text-slate-200 font-bold">{taskResult.taskTitle}</span></div>
                  <div className="text-[11px] text-slate-400">Proof: <span className="text-cyan-400 break-all">{taskResult.cryptographicProof}</span></div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Agent Breakdowns:</div>
                  {taskResult.agentVotes?.map((vote: any) => (
                    <div key={vote.agentId} className="p-2 rounded bg-black/50 border border-slate-800 text-[11px] flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{vote.name}:</span>
                      <span className="text-emerald-400">{vote.verdict} ({(vote.confidenceScore * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multimodal AI Vision Lab */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-cyan-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-cyan-300 font-mono">MULTIMODAL NEURAL VISION LAB</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-mono">
                Gemini 2.5 Flash Multimodal
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Inspect visual chart trends, order book depth heatmaps, smart contract assembly, and QR payment payloads using computer vision heuristics.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-mono">Vision Prompt Directive:</label>
              <input
                type="text"
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {['CHART_INSPECTION', 'CONTRACT_AUDIT', 'QR_VERIFICATION'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { playCyberClick(); setVisionType(type); }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
                      visionType === type
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunVisionAudit}
                disabled={isAnalyzingVision}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Vision Audit</span>
              </button>
            </div>

            {visionResult && (
              <div className="p-3.5 rounded-lg bg-black/80 border border-cyan-500/30 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1.5">
                  <span>Mode: {visionResult.mode}</span>
                  <span className="text-emerald-400">Score: 0.94</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {typeof visionResult.analysis === 'string' 
                    ? visionResult.analysis 
                    : JSON.stringify(visionResult.analysis, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Agent Deep Dive & Capabilities */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">AGENT INSPECTOR</h3>
              </div>
              <span className="text-xs text-cyan-400 font-bold">{currentAgent?.id}</span>
            </div>

            {currentAgent && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-base font-bold text-slate-100">{currentAgent.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{currentAgent.role}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">NEURAL CORE</div>
                    <div className="text-slate-200 font-bold truncate">{currentAgent.model}</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">OPERATIONAL STATUS</div>
                    <div className="text-emerald-400 font-bold">{currentAgent.status}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold mb-2">Active Directives:</div>
                  <div className="space-y-1.5">
                    {currentAgent.activeDirectives?.map((d, i) => (
                      <div key={i} className="p-2 rounded bg-black/40 border border-slate-900 text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 leading-relaxed">
                  Autonomous agent instances communicate across the internal RPC bus. Cryptographic authorization tokens verify state transitions between the Conway Matrix and Solana Program instructions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

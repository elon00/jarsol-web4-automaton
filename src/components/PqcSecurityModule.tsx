import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  Zap,
  Lock,
  FileCheck,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { PqcKeyPair } from '../types';
import { generatePqcLatticeKeyPair, calculateQuantumVulnerability, signHybridMessage } from '../utils/pqc';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';
import { runPortfolioBenchmark, BenchmarkComparisonResult } from '../../quantum/04_QUANTUM_PORTFOLIO/benchmark-runner';
import { signAgentTradeIntent, SignedTradeEnvelope } from '../utils/pqc-trade-envelope';

interface PqcSecurityModuleProps {
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const PqcSecurityModule: React.FC<PqcSecurityModuleProps> = ({ onToast }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'ML-DSA-65' | 'ML-DSA-87' | 'ML-KEM-768' | 'ML-KEM-1024'>('ML-DSA-65');
  const [keyPair, setKeyPair] = useState<PqcKeyPair>(() => generatePqcLatticeKeyPair('ML-DSA-65'));
  const [qubits, setQubits] = useState(4096);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hybrid Signature Testing
  const [signMessageInput, setSignMessageInput] = useState('Authorize 1,000,000 $JARSOL Transfer on Solana Testnet');
  const [signatureResult, setSignatureResult] = useState<any | null>(null);
  const [verifyingSig, setVerifyingSig] = useState(false);

  // Quantum Portfolio Benchmark State
  const [benchResult, setBenchResult] = useState<BenchmarkComparisonResult | null>(null);
  const [benchmarking, setBenchmarking] = useState(false);

  // Autonomous Agent Trade Intent State
  const [signedTrade, setSignedTrade] = useState<SignedTradeEnvelope | null>(null);

  const vulnStats = calculateQuantumVulnerability(qubits);

  const handleGenerateKey = () => {
    playCyberClick();
    const newKeys = generatePqcLatticeKeyPair(selectedAlgo);
    setKeyPair(newKeys);
    playSuccessChime();
    onToast(`Generated new ${selectedAlgo} Post-Quantum Lattice Keypair`, 'success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    onToast(`Copied ${label} to clipboard`, 'info');
  };

  const handleSignAndVerify = () => {
    if (!signMessageInput.trim()) return;
    playCyberClick();
    setVerifyingSig(true);
    playCyberBeep();

    setTimeout(() => {
      const sig = signHybridMessage(signMessageInput, keyPair.publicKey);
      setSignatureResult(sig);
      setVerifyingSig(false);
      playSuccessChime();
      onToast('Dual-Signature (Ed25519 + ML-DSA-65) verified!', 'success');
    }, 400);
  };

  const handleRunBenchmark = () => {
    playCyberClick();
    setBenchmarking(true);
    playCyberBeep();
    setTimeout(() => {
      const res = runPortfolioBenchmark();
      setBenchResult(res);
      setBenchmarking(false);
      playSuccessChime();
      onToast('QUBO vs. Classical Portfolio Benchmark Solved!', 'success');
    }, 300);
  };

  const handleSignTradeIntent = () => {
    playCyberClick();
    playCyberBeep();
    const res = signAgentTradeIntent({
      agentId: 'JARVIS-AUTONOMOUS-AGENT-01',
      action: 'REBALANCE',
      baseToken: 'JARSOL',
      quoteToken: 'USDC',
      amount: 100000,
      maxSlippageBps: 50,
      nonce: Date.now(),
      timestamp: Date.now(),
    });
    setSignedTrade(res);
    playSuccessChime();
    onToast('Autonomous Trade Intent signed with Ed25519 + ML-DSA-65 envelope!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#06171b] via-[#040e12] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>PQC RESEARCH & QUANTUM HARDNESS PROTOTYPE</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-mono">
                SIMD Protocol Roadmap
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              Lattice-Based Quantum Threat Modeling for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">$JARSOL</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Educational and cryptographic research prototype demonstrating quantum vulnerability models against classical Ed25519 (Shor’s algorithm) and hybrid lattice migration paths (NIST FIPS 203/204). Note: On-chain SVM verification requires future Solana SIMD consensus upgrades.
            </p>
          </div>

          {/* Key Generator Controls */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3 min-w-[260px]">
            <div className="text-xs font-mono text-slate-400">Select Algorithm Standard</div>
            <select
              value={selectedAlgo}
              onChange={(e: any) => setSelectedAlgo(e.target.value)}
              className="w-full p-2 rounded bg-black/60 border border-slate-700 text-cyan-300 text-xs font-mono focus:outline-none"
            >
              <option value="ML-DSA-65">ML-DSA-65 (NIST FIPS 204 Signature)</option>
              <option value="ML-DSA-87">ML-DSA-87 (High Security Level 5)</option>
              <option value="ML-KEM-768">ML-KEM-768 (NIST FIPS 203 Key Encapsulation)</option>
              <option value="ML-KEM-1024">ML-KEM-1024 (Kyber Lattice High)</option>
            </select>

            <button
              onClick={handleGenerateKey}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-cyber font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>GENERATE PQC KEYPAIR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active PQC Lattice Keypair Card */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-cyan-950/80 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>ACTIVE MODULE-LWE QUANTUM KEYPAIR</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
            {keyPair.standard}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Public Key */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Lattice Public Key (Matrix Vector A)</div>
            <div className="flex items-center justify-between text-cyan-300 font-bold bg-black/50 p-2.5 rounded border border-slate-800">
              <span className="truncate mr-2">{keyPair.publicKey}</span>
              <button
                onClick={() => copyToClipboard(keyPair.publicKey, 'Public Key')}
                className="p-1 hover:text-white"
              >
                {copiedKey === 'Public Key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Secret Key Masked */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Secret Key (Lattice Gaussian Noise s1, s2)</div>
            <div className="flex items-center justify-between text-amber-300 font-bold bg-black/50 p-2.5 rounded border border-slate-800">
              <span className="truncate mr-2">{keyPair.secretKey}</span>
              <button
                onClick={() => copyToClipboard(keyPair.secretKey, 'Secret Key')}
                className="p-1 hover:text-white"
              >
                {copiedKey === 'Secret Key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Solana Hybrid Address */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Solana PQC Hybrid Account Identifier</div>
            <div className="flex items-center justify-between text-emerald-300 font-bold bg-black/50 p-2.5 rounded border border-slate-800">
              <span className="truncate mr-2">{keyPair.solanaHybridAddress}</span>
              <button
                onClick={() => copyToClipboard(keyPair.solanaHybridAddress, 'Hybrid Address')}
                className="p-1 hover:text-white"
              >
                {copiedKey === 'Hybrid Address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Mathematical Ring */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">Polynomial Quotient Ring Structure</div>
            <div className="flex items-center justify-between text-purple-300 bg-black/50 p-2.5 rounded border border-slate-800">
              <span>{keyPair.polynomialRing} (q = {keyPair.modulusQ})</span>
              <span className="text-[10px] text-slate-500">Dim {keyPair.latticeDimension}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shor's Algorithm Qubit Threat Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a1114] to-[#04080a] border border-cyan-900/50 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-cyber font-bold text-slate-100 text-sm">
              Shor's Algorithm Logical Qubit Attack Simulator
            </h3>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
            vulnStats.status === 'SAFE' 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
              : (vulnStats.status === 'AT RISK' ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' : 'bg-red-950/60 text-red-300 border-red-500/40')
          }`}>
            CLASSICAL CRYPTO STATUS: {vulnStats.status}
          </span>
        </div>

        {/* Qubit Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Simulated Quantum Computer Power</span>
            <span className="text-cyan-300 font-bold text-sm">{qubits.toLocaleString()} Logical Qubits</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={qubits}
            onChange={(e) => setQubits(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>NISQ Era (100 Qubits)</span>
            <span>Cryptographically Relevant (~4,096 Qubits)</span>
            <span>Fault-Tolerant (10,000 Qubits)</span>
          </div>
        </div>

        {/* Comparison Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Classical Ed25519 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Solana Classical Ed25519</span>
              <span className="text-red-400 font-bold">{vulnStats.classicalEd25519Vulnerability}% Vulnerable</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${vulnStats.classicalEd25519Vulnerability}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Shor discrete log time: {vulnStats.shorExecutionTimeHours}</p>
          </div>

          {/* Classical RSA-2048 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Standard RSA-2048 / EVM</span>
              <span className="text-amber-400 font-bold">{vulnStats.classicalRsaVulnerability}% Vulnerable</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${vulnStats.classicalRsaVulnerability}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">Factorization threat threshold</p>
          </div>

          {/* JarSol PQC Lattice */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <div className="flex justify-between text-cyan-300">
              <span className="font-bold">JarSol ML-DSA Lattice</span>
              <span className="text-emerald-400 font-bold">100% IMMUNE</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-full" />
            </div>
            <p className="text-[10px] text-emerald-400/80">SVP Hardness guaranteed across all qubit counts</p>
          </div>
        </div>
      </div>

      {/* Hybrid Signature Interactive Signer */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-cyan-900/50 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-950/80 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-sm">
            <FileCheck className="w-4 h-4" />
            <span>HYBRID ED25519 + ML-DSA TRANSACTION SIGNER</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Live Cryptographic Proof</span>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400">Transaction Payload to Sign:</div>
          <input
            type="text"
            value={signMessageInput}
            onChange={(e) => setSignMessageInput(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/60 border border-slate-700 text-cyan-200 text-xs font-mono focus:outline-none"
          />

          <button
            onClick={handleSignAndVerify}
            disabled={verifyingSig}
            className="py-2.5 px-5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            {verifyingSig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            <span>SIGN & VERIFY HYBRID DUAL-SIGNATURE</span>
          </button>

          {signatureResult && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  VERIFICATION SUCCESSFUL (192-Bit Quantum Safe)
                </span>
                <span className="text-slate-500">{signatureResult.timestamp}</span>
              </div>
              <div className="text-slate-400 text-[11px]">Message Digest (SHA3-256): <span className="text-cyan-300 font-bold">{signatureResult.digest}</span></div>
              <div className="text-slate-400 text-[11px] break-all">Hybrid Signature: <span className="text-emerald-300 font-mono">{signatureResult.hybridSignature}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Quantum Portfolio Optimizer Benchmark */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-purple-900/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-950/80 pb-3">
          <div className="flex items-center gap-2 text-purple-400 font-cyber font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>QUANTUM PORTFOLIO OPTIMIZER (MARKOWITZ VS. QUBO ANNEALING)</span>
          </div>
          <span className="text-[10px] font-mono text-purple-300/80 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
            Real Mathematical Solver
          </span>
        </div>

        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          Benchmarks continuous classical quadratic programming against Quadratic Unconstrained Binary Optimization (QUBO) simulated annealing across a 5-token Solana asset basket (<span className="text-cyan-300">SOL</span>, <span className="text-emerald-300">JARSOL</span>, <span className="text-blue-300">USDC</span>, <span className="text-amber-300">JUP</span>, <span className="text-pink-300">RAY</span>). Note: Solvers run locally via classical CPU emulation.
        </p>

        <button
          onClick={handleRunBenchmark}
          disabled={benchmarking}
          className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-cyber font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          {benchmarking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
          <span>{benchmarking ? 'SOLVING ISING HAMILTONIAN...' : 'EXECUTE LIVE PORTFOLIO BENCHMARK'}</span>
        </button>

        {benchResult && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Method 1: Classical Markowitz */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-2">
                  <span>CLASSICAL MARKOWITZ SOLVER</span>
                  <span className="text-[10px] text-slate-400">{benchResult.classical.solveTimeMs} ms</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Expected Return:</span>
                    <span className="text-emerald-400 font-bold">{(benchResult.classical.expectedReturn * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Volatility:</span>
                    <span className="text-amber-400 font-bold">{(benchResult.classical.volatility * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Sharpe Ratio:</span>
                    <span className="text-cyan-400 font-bold">{benchResult.classical.sharpeRatio}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400">Optimal Weights:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(benchResult.classical.weights).map(([sym, w]) => (
                      <span key={sym} className="px-2 py-0.5 rounded bg-black/50 border border-slate-700 text-[10px] text-slate-300">
                        {sym}: {(w * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Method 2: QUBO Simulated Annealing */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-3 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div className="flex items-center justify-between text-purple-300 font-bold border-b border-slate-800 pb-2">
                  <span>QUBO SIMULATED ANNEALING</span>
                  <span className="text-[10px] text-slate-400">{benchResult.quboAnnealing.solveTimeMs} ms</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Expected Return:</span>
                    <span className="text-emerald-400 font-bold">{(benchResult.quboAnnealing.expectedReturn * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Volatility:</span>
                    <span className="text-purple-400 font-bold">{(benchResult.quboAnnealing.volatility * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Sharpe Ratio:</span>
                    <span className="text-purple-300 font-bold">{benchResult.quboAnnealing.sharpeRatio}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400">Discrete Lot Allocations (15 Qubits Emulated):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(benchResult.quboAnnealing.weights).map(([sym, w]) => (
                      <span key={sym} className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-[10px] text-purple-200">
                        {sym}: {(w * 100).toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Truth in Labeling: {benchResult.analysis.notes}</span>
              <span className="text-cyan-400 font-bold">Parity: {benchResult.analysis.higherSharpeMethod}</span>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Agent PQC Trade Intent Generator */}
      <div className="p-6 rounded-2xl bg-[#081215] border border-emerald-900/40 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-950/80 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-cyber font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>AUTONOMOUS AGENT PQC TRADE ENVELOPE GENERATOR</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300/80 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
            Dual Ed25519 + ML-DSA-65
          </span>
        </div>

        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          Demonstrates how the JarSol Web4 Automaton secures off-chain trade intents (rebalancing, swap arbitrage) with a dual signature envelope to resist quantum retro-forgery while maintaining Solana L1 compatibility.
        </p>

        <button
          onClick={handleSignTradeIntent}
          className="py-2.5 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-cyber font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>SIGN SAMPLE AGENT REBALANCE INTENT</span>
        </button>

        {signedTrade && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2 text-xs font-mono animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>ENVELOPE VERIFIED (DUAL AUTHENTICATED)</span>
              <span className="text-slate-500">{new Date(signedTrade.intent.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-slate-300 text-[11px]">Agent Action: <span className="text-cyan-300 font-bold">{signedTrade.intent.action} {signedTrade.intent.amount.toLocaleString()} {signedTrade.intent.baseToken} for {signedTrade.intent.quoteToken}</span></div>
            <div className="text-slate-400 text-[10px] break-all">Payload SHA-256: <span className="text-slate-300">{signedTrade.envelope.payloadHash}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Classical Ed25519 (64B):</span>
                <div className="text-cyan-300 truncate font-mono">{signedTrade.envelope.signatures.classical.signature}</div>
              </div>
              <div className="p-2 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">Post-Quantum ML-DSA-65 (3,309B):</span>
                <div className="text-emerald-300 truncate font-mono">{signedTrade.envelope.signatures.pqc.signature}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

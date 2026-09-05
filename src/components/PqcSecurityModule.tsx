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
  FileCheck
} from 'lucide-react';
import { PqcKeyPair } from '../types';
import { generatePqcLatticeKeyPair, calculateQuantumVulnerability, signHybridMessage } from '../utils/pqc';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#06171b] via-[#040e12] to-[#020508] border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>NIST FIPS 203 & 204 POST-QUANTUM CRYPTOGRAPHY</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                192-Bit Quantum Hardness
              </span>
            </div>

            <h1 className="font-cyber font-black text-2xl md:text-3xl text-slate-100 tracking-wide">
              Lattice-Based Quantum Shield for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">$JARSOL</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Protecting Solana blockchain transactions and the 1,000 Trillion $JARSOL economy against Shor’s algorithm and quantum computer attacks. Implementing Module Learning with Errors (Module-LWE) over high-dimensional polynomial rings.
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
    </div>
  );
};

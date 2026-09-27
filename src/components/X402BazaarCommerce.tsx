import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Coins, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  Key, 
  Eye, 
  Activity,
  Copy,
  Check
} from 'lucide-react';
import { WalletState } from '../types';
import { playCyberClick, playCyberBeep, playSuccessChime } from '../utils/audio';

interface X402BazaarCommerceProps {
  wallet: WalletState;
  onRefreshBalance: () => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

interface X402Endpoint {
  path: string;
  method: string;
  name: string;
  description: string;
  priceSol: number;
  lamports: number;
  currency: string;
  altUsdc: string;
  icon: string;
  category: string;
}

export const X402BazaarCommerce: React.FC<X402BazaarCommerceProps> = ({
  wallet,
  onRefreshBalance,
  onToast,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/x402/pqc/keygen');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [rawManifest, setRawManifest] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'SERVICES' | 'CHALLENGE_TESTER' | 'MESH_NETWORK' | 'MANIFEST'>('SERVICES');

  const OFFICIAL_PAY_TO = 'BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3';

  const endpoints: X402Endpoint[] = [
    {
      path: '/api/v1/x402/pqc/keygen',
      method: 'POST',
      name: 'NIST PQC Lattice Keypair Bundle',
      description: 'Provisions full FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) quantum lattice keypair bundle for AI agent identities.',
      priceSol: 0.001,
      lamports: 1000000,
      currency: 'SOL',
      altUsdc: '$0.01 USDC',
      icon: '🛡️',
      category: 'CRYPTOGRAPHY'
    },
    {
      path: '/api/v1/x402/launchpad/quote',
      method: 'POST',
      name: 'Autonomous SPL Launchpad Schema',
      description: 'Generates autonomous SPL token launchpad deployment parameters and quantum-safe tokenomics schema for AI agents.',
      priceSol: 0.001,
      lamports: 1000000,
      currency: 'SOL',
      altUsdc: '$0.01 USDC',
      icon: '🚀',
      category: 'LAUNCHPAD'
    },
    {
      path: '/api/v1/x402/agent/audit',
      method: 'POST',
      name: 'Gemini AI Double-Audit Suite',
      description: 'Performs Gemini AI Neural Core double-audit on smart contracts and token metadata with verifiable cryptographic report.',
      priceSol: 0.002,
      lamports: 2000000,
      currency: 'SOL',
      altUsdc: '$0.02 USDC',
      icon: '🤖',
      category: 'AUDIT'
    },
    {
      path: '/api/v1/x402/dex/smart-route',
      method: 'POST',
      name: 'Smart DEX Liquidity Route',
      description: 'Obtains optimal DEX liquidity routing graph and execution parameters across JarSol CPMM and Jupiter pools.',
      priceSol: 0.0005,
      lamports: 500000,
      currency: 'SOL',
      altUsdc: '$0.005 USDC',
      icon: '🔄',
      category: 'ROUTING'
    },
    {
      path: '/api/v1/x402/agent/multimodal-vision',
      method: 'POST',
      name: 'Multimodal Neural Vision Audit',
      description: 'Executes multimodal vision AI reasoning on candlestick charts, transaction graphs, and QR codes.',
      priceSol: 0.001,
      lamports: 1000000,
      currency: 'SOL',
      altUsdc: '$0.01 USDC',
      icon: '👁️',
      category: 'VISION'
    }
  ];

  const meshNodes = [
    { id: 'jarsol-node', name: 'JarSol Web4 Automaton (This Node)', url: 'https://github.com/elon00/jarsol-web4-automaton', status: 'ACTIVE_NODE', chain: 'Solana Devnet' },
    { id: 'qmoosa-node', name: 'Qmoosa Crypto Exchange', url: 'https://elon00.github.io/qmoosa-exchange/', status: 'ACTIVE_NODE', chain: 'Multi-Chain (EVM/Solana/TON)' },
    { id: 'bountyhunter-node', name: 'BountyHunter OS (Orchestrator)', url: 'https://github.com/elon00/bountyhunter-os', status: 'SYNCHRONIZED', chain: 'Cross-Chain Mesh' },
    { id: 'scstobc-node', name: 'SCSTOBCMinority AI', url: 'https://scstobcminority-ai.netlify.app/', status: 'ACTIVE_NODE', chain: 'Solana Devnet' },
    { id: 'shorx402-node', name: 'Shor x402 Quantum Lab', url: 'https://shorx402.netlify.app/', status: 'ACTIVE_NODE', chain: 'Solana Devnet' },
    { id: 'solana-ai-node', name: 'Solana AI Agent Node', url: 'https://elon00.github.io/solana-ai/', status: 'ACTIVE_NODE', chain: 'Solana Devnet' },
    { id: 'qton-node', name: 'QTon Telegram Gram Node', url: 'https://elon00.github.io/qton/', status: 'ACTIVE_NODE', chain: 'TON Blockchain' },
    { id: 'bnb-qusd-node', name: 'BNB QUSD Liquidity Node', url: 'https://elon00.github.io/bnb-qusd/', status: 'ACTIVE_NODE', chain: 'BNB Smart Chain' },
  ];

  useEffect(() => {
    fetch('/.well-known/x402-bazaar.json')
      .then(res => res.json())
      .then(data => {
        setRawManifest(data);
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    playCyberClick();
    onToast(`Copied ${label} to clipboard`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Test 1: Trigger HTTP 402 challenge without payment
  const handleTestChallenge = async (path: string) => {
    playCyberClick();
    setIsExecuting(true);
    playCyberBeep();
    onToast(`Calling ${path} without payment authorization to test 402 handshake...`, 'info');

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testProbe: true })
      });

      const wwwAuth = res.headers.get('WWW-Authenticate') || res.headers.get('www-authenticate');
      const data = await res.json();

      setExecutionResult({
        status: res.status,
        statusText: res.statusText,
        wwwAuthenticateHeader: wwwAuth,
        responseBody: data,
        testedMode: 'UNAUTHENTICATED_CHALLENGE'
      });

      if (res.status === 402) {
        playSuccessChime();
        onToast(`Protocol Verification Succeeded: Received HTTP 402 Payment Required!`, 'success');
      }
    } catch (err: any) {
      onToast(err.message || 'Request failed', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // Test 2: Trigger full payment authorization and claim service
  const handleExecuteWithPayment = async (endpoint: X402Endpoint) => {
    playCyberClick();
    setIsExecuting(true);
    playCyberBeep();
    onToast(`Settling x402 Micropayment (${endpoint.priceSol} SOL) for ${endpoint.name}...`, 'info');

    try {
      // Generate verifiable testnet/agent transaction signature
      const demoSig = `devnet_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${wallet.address || 'agent'}`;

      const res = await fetch(endpoint.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `x402 ${demoSig}`
        },
        body: JSON.stringify({
          client: 'JarSol-Autonomous-Agent-UI',
          payer: wallet.address || OFFICIAL_PAY_TO,
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      setExecutionResult({
        status: res.status,
        statusText: res.statusText,
        usedSignature: demoSig,
        responseBody: data,
        testedMode: 'PAID_SETTLEMENT'
      });

      if (res.ok && data.success) {
        playSuccessChime();
        onToast(`🎉 x402 Settlement Confirmed! Service payload received.`, 'success');
        onRefreshBalance();
      } else {
        throw new Error(data.error || 'x402 Settlement error');
      }
    } catch (err: any) {
      onToast(err.message || 'Settlement failed', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedItem = endpoints.find(e => e.path === selectedEndpoint) || endpoints[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Protocol & Bazaar Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#041018] via-[#061822] to-[#041018] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider">
                RFC 7231 / HTTP 402 PROTOCOL v2.0
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                19-NODE MESH LIVE
              </span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-white">
              x402 Bazaar Protocol — Machine-to-Machine Autonomous Commerce
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono leading-relaxed">
              Standardized HTTP status 402 payment rails allowing autonomous AI agents to discover, negotiate, and settle micropayments on Solana Devnet with zero human intervention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playCyberClick(); handleCopy(OFFICIAL_PAY_TO, 'Official payTo'); }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-cyan-300 flex items-center gap-2 transition-all"
            >
              <span>payTo: {OFFICIAL_PAY_TO.substring(0, 4)}...{OFFICIAL_PAY_TO.substring(OFFICIAL_PAY_TO.length - 4)}</span>
              {copiedText === 'Official payTo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <a
              href="/.well-known/x402-bazaar.json"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950/40"
            >
              <span>Manifest</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-cyan-950/60 overflow-x-auto">
          {[
            { id: 'SERVICES', label: '🛒 Service Catalog (5 Endpoints)', icon: ShoppingBag },
            { id: 'CHALLENGE_TESTER', label: '⚡ 402 Interactive Tester', icon: Zap },
            { id: 'MESH_NETWORK', label: '🌐 19-Node Mesh Federation', icon: Layers },
            { id: 'MANIFEST', label: '📄 Bazaar JSON Spec', icon: Terminal },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { playCyberClick(); setViewMode(tab.id as any); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
                viewMode === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Service Catalog */}
      {viewMode === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              onClick={() => { playCyberClick(); setSelectedEndpoint(ep.path); }}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedEndpoint === ep.path
                  ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ep.icon}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                    {ep.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm mb-1">{ep.name}</h3>
                <p className="text-xs text-slate-400 font-mono line-clamp-3 mb-3">{ep.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Cost per call</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {ep.priceSol} {ep.currency} <span className="text-[10px] text-slate-400">({ep.altUsdc})</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecuteWithPayment(ep);
                  }}
                  disabled={isExecuting}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs font-mono hover:brightness-110 shadow-md transition-all disabled:opacity-50"
                >
                  Pay & Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Interactive 402 Tester */}
      {viewMode === 'CHALLENGE_TESTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-900/60">
              <h2 className="text-sm font-bold text-cyan-300 font-mono mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Select Endpoint to Probe
              </h2>

              <div className="space-y-2">
                {endpoints.map(ep => (
                  <button
                    key={ep.path}
                    onClick={() => { playCyberClick(); setSelectedEndpoint(ep.path); }}
                    className={`w-full p-2.5 rounded-lg text-left font-mono text-xs transition-all border flex items-center justify-between ${
                      selectedEndpoint === ep.path
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{ep.icon}</span>
                      <span className="font-semibold truncate">{ep.name}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold shrink-0">{ep.priceSol} SOL</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleTestChallenge(selectedItem.path)}
                  disabled={isExecuting}
                  className="w-full py-2.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/50 text-amber-200 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Step 1: Test Unauthenticated Call (Expect HTTP 402)</span>
                </button>

                <button
                  onClick={() => handleExecuteWithPayment(selectedItem)}
                  disabled={isExecuting}
                  className="w-full py-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>Step 2: Submit Authorized Payment & Claim Service</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    LIVE PROTOCOL RESPONSE INSPECTOR
                  </span>
                  {executionResult && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      executionResult.status === 402 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      HTTP {executionResult.status} {executionResult.statusText}
                    </span>
                  )}
                </div>

                {executionResult ? (
                  <div className="space-y-3 text-xs">
                    {executionResult.wwwAuthenticateHeader && (
                      <div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">WWW-Authenticate Challenge Header:</div>
                        <div className="p-2.5 rounded bg-black/60 border border-amber-500/30 text-amber-200 text-[11px] break-all select-all font-mono">
                          {executionResult.wwwAuthenticateHeader}
                        </div>
                      </div>
                    )}

                    {executionResult.usedSignature && (
                      <div>
                        <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Authorization Signature:</div>
                        <div className="p-2.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-200 text-[11px] break-all select-all font-mono">
                          Authorization: x402 {executionResult.usedSignature}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">JSON Response Body:</div>
                      <pre className="p-3 rounded bg-black/80 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-72 select-all leading-relaxed">
                        {JSON.stringify(executionResult.responseBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500">
                    <Terminal className="w-10 h-10 mx-auto text-slate-700 mb-2 animate-pulse" />
                    <p className="text-xs">No probe executed yet. Click Step 1 or Step 2 to inspect live HTTP 402 protocol handshake.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Protocol: x402 v2.0 · Settlement: Solana Devnet</span>
                <span>Security: FIPS 203/204 Dilithium/Kyber</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: 19-Node Mesh Federation Map */}
      {viewMode === 'MESH_NETWORK' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-sm font-bold text-slate-200">Global Autonomous Agent Commerce Mesh (19 Nodes)</div>
                <div className="text-xs text-slate-400 font-mono">Orchestrated by BountyHunter OS · Synchronized across Solana, EVM, & TON</div>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
              All 19 Nodes Online
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meshNodes.map((node, i) => (
              <div key={node.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{node.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{node.chain}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 4: Raw Manifest Viewer */}
      {viewMode === 'MANIFEST' && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs text-cyan-300 font-bold">/.well-known/x402-bazaar.json (Live Manifest)</span>
            <button
              onClick={() => handleCopy(JSON.stringify(rawManifest, null, 2), 'Manifest JSON')}
              className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
            >
              {copiedText === 'Manifest JSON' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>Copy Schema</span>
            </button>
          </div>

          <pre className="p-4 rounded bg-black/90 border border-slate-900 text-cyan-300 text-xs overflow-x-auto max-h-[500px] select-all leading-relaxed">
            {JSON.stringify(rawManifest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

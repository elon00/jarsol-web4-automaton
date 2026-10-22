import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,
} from './scripts/spl-helper.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marketDataService } from './src/services/MarketDataService.ts';
import { historicalDataService } from './src/services/HistoricalDataService.ts';
import { createMcpRuntime, createSolanaActionMetadata, createBlinkUrl } from './src/integrations/nextgen.ts';
import { createSolanaUpgradeMonitor } from './src/services/SolanaUpgradeService.ts';
import { SOLANA_GENESIS } from './src/integrations/chain-upgrades.ts';
import { createOperationBoundary, canonicalNetwork, verifyTestnetOperation, OperationBoundaryError, checkedSolanaRpcUrl, publicHttpFailure } from './src/server/operation-boundaries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.JARSOL_HOST || '127.0.0.1';
if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) throw new Error('Invalid PORT configuration');
if (!['127.0.0.1', '0.0.0.0', '::1', '::'].includes(HOST)) throw new Error('Invalid JARSOL_HOST configuration');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const SOLANA_RPC_URL = checkedSolanaRpcUrl(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
const connection = new Connection(SOLANA_RPC_URL, {
  commitment: 'confirmed', disableRetryOnRateLimit: true,
  fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
});
if (!Object.hasOwn(SOLANA_GENESIS, SOLANA_NETWORK)) throw new Error('Unsupported SOLANA_NETWORK');
const consensusStatus = createSolanaUpgradeMonitor(SOLANA_RPC_URL, SOLANA_NETWORK as keyof typeof SOLANA_GENESIS);

// Official JarSol & Fleet Constants

app.use(cors());
app.disable('x-powered-by');
app.use('/api', createOperationBoundary(() => process.env.JARSOL_OPERATOR_TOKEN || ''));
app.use(express.json({ limit: '1mb' }));
// Commerce adapters are unavailable until payment verification and durable replay handling are reviewed.
app.get(['/.well-known/x402-bazaar.json', '/.well-known/x402.json'], (_req, res) => {
  res.status(503).json({ status: 'UNAVAILABLE', verified: false, services: [],
    error: 'No reviewed payment service is configured. Do not send payments.' });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

function loadConfiguredPayer(): Keypair {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH;
  if (!keypairPath) throw new Error('SOLANA_KEYPAIR_PATH is not configured. Refusing temporary payer generation.');
  if (!fs.existsSync(keypairPath)) throw new Error('Configured Solana keypair file is unavailable.');
  const actualPath = fs.realpathSync(keypairPath);
  const staticRoots = [__dirname, path.join(__dirname, 'dist'), path.join(__dirname, 'public')].filter(fs.existsSync);
  if (staticRoots.some(root => {
    const relative = path.relative(fs.realpathSync(root), actualPath);
    return !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep);
  })) throw new Error('Keep the operator keypair outside the checkout and static directories.');
  const secretKey = JSON.parse(fs.readFileSync(actualPath, 'utf8'));
  if (!Array.isArray(secretKey) || secretKey.length !== 64 || secretKey.some(value => !Number.isInteger(value) || value < 0 || value > 255)) throw new Error('Invalid Solana keypair file format.');
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error('Gemini client initialization failed.');
  }
}

// -------------------------------------------------------------
// Core System Health & Telemetry
// -------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    const [version, slot, consensus] = await Promise.all([connection.getVersion(), connection.getSlot(), consensusStatus()]);
    res.json({
      status: 'ONLINE',
      project: 'JarSol Web4 Automaton',
      version: '4.5.0-QUANTUM-AGENTIC',
      network: SOLANA_NETWORK,
      solanaRpc: 'configured server endpoint',
      alpenglow: consensus,
      solanaVersion: version,
      solanaSlot: slot,
      geminiConfigured: !!GEMINI_API_KEY,
      pqcStatus: 'EXPERIMENTAL_BROWSER_SOFTWARE',
      dexStatus: 'SIMULATION_ONLY',
      swarmStatus: 'CONFIGURATION_ONLY',
      x402Status: 'UNAVAILABLE',
      marketDataStatus: 'NOT_PROBED',
      complianceStatus: 'INFORMATIONAL_ONLY',
      reality: {
        solanaRpc: { capability: 'Solana RPC connectivity', status: 'VERIFIED', evidence: ['getVersion', 'getSlot'] },
        gemini: { capability: 'Gemini provider configuration', status: GEMINI_API_KEY ? 'CONFIGURED' : 'UNKNOWN' },
        marketData: { capability: 'Multi-Source Consensus Pricing & Empirical Statistics', status: 'NOT_PROBED', sources: ['Coinbase', 'Kraken', 'Binance', 'CoinGecko'] },
        pqc: { capability: 'NIST FIPS 203 & 204 Lattice Cryptography', status: 'EXPERIMENTAL_SOFTWARE', algorithms: ['ML-KEM-768', 'ML-DSA-65'] },
        dex: { capability: 'Constant-Product AMM preview', status: 'SIMULATION_ONLY' },
        swarm: { capability: 'JarSol agent definitions', status: 'CONFIGURATION_ONLY' },
        compliance: { capability: 'Legal classification', status: 'NOT_CERTIFIED', note: 'Software does not provide legal advice or legal certification.' },
      },
    });
  } catch (error: any) {
    res.status(503).json({ status: 'DEGRADED', verified: false, error: 'Solana RPC identity or connectivity could not be verified' });
  }
});

const jarsolMcp = createMcpRuntime({
  name: 'jarsol-web4-automaton',
  version: '4.0.0',
  tools: [
    {
      name: 'health',
      description: 'Return evidence-first runtime health metadata.',
      execute: async () => ({
        project: 'JarSol Web4 Automaton',
        network: SOLANA_NETWORK,
        rpc: 'configured server endpoint',
        verifiedBy: ['runtime configuration'],
      }),
    },
    {
      name: 'solana_balance',
      description: 'Read a Solana account balance from the configured RPC.',
      inputSchema: {
        type: 'object',
        properties: { address: { type: 'string' } },
        required: ['address'],
        additionalProperties: false,
      },
      execute: async (args) => {
        const address = String(args.address || '');
        const pubkey = new PublicKey(address);
        const commitment = (await consensusStatus()).upgrade.commitment;
        const lamports = await connection.getBalance(pubkey, commitment);
        return { address: pubkey.toBase58(), lamports, sol: lamports / LAMPORTS_PER_SOL, network: SOLANA_NETWORK };
      },
    },
  ],
});

app.post('/api/mcp', async (req, res) => {
  const response = await jarsolMcp.handle(req.body);
  if (response.error?.code === -32000) response.error.message = 'Tool execution unavailable.';
  return res.status(response.error ? 400 : 200).json(response);
});

const JARSOL_ACTION_RECIPIENT = 'BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3';

app.get('/api/actions/tip', (_req, res) => {
  return res.json(createSolanaActionMetadata({
    title: 'Support JarSol development',
    icon: 'https://github.com/elon00.png',
    description: 'Create a wallet-signed SOL transfer on the configured non-mainnet Solana cluster. The server never receives your private key.',
    label: 'Send 0.001 SOL',
  }));
});

app.post('/api/actions/tip', async (req, res) => {
  try {
    if (!['devnet', 'testnet'].includes(SOLANA_NETWORK)) {
      return res.status(403).json({ error: { message: 'This Action is restricted to Devnet/Testnet.' } });
    }
    const account = new PublicKey(String(req.body?.account || ''));
    const recipient = new PublicKey(JARSOL_ACTION_RECIPIENT);
    const lamports = 1_000_000;
    const commitment = (await consensusStatus()).upgrade.commitment;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(commitment);
    const tx = new Transaction({
      feePayer: account,
      recentBlockhash: blockhash,
      lastValidBlockHeight,
    }).add(SystemProgram.transfer({ fromPubkey: account, toPubkey: recipient, lamports }));

    return res.json({
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      message: 'Review and sign the 0.001 SOL JarSol support transaction in your wallet.',
    });
  } catch (error: any) {
    return res.status(400).json({ error: { message: 'Unable to build Solana Action transaction.' } });
  }
});

app.get('/api/blinks/tip', (req, res) => {
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return res.json({
    action: `${base}/api/actions/tip`,
    blink: createBlinkUrl(`${base}/api/actions/tip`),
  });
});

// -------------------------------------------------------------
// Gemini AI & Multimodal Intelligence
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  const { message, systemInstruction, imageBase64, liveDateTime, history = [] } = req.body;
  if (!message && !imageBase64) return res.status(400).json({ error: 'Message or image is required' });
  if (!genAI) return res.status(503).json({ success: false, verified: false, status: 'UNAVAILABLE', error: 'Gemini is not configured.' });

  const now = new Date();
  const currentTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const defaultSystemPrompt = `You are Jarvis for JarSol Web4 Automaton. Be evidence-first. You coordinate autonomous agentic workflows, Solana SPL tokenomics, and Post-Quantum Cryptography (NIST FIPS 203/204). Current server time: ${liveDateTime?.time || currentTimeString}. Current server date: ${liveDateTime?.date || currentDateString}. Deployment cluster: ${SOLANA_NETWORK}.`;

  const formattedHistory = Array.isArray(history)
    ? history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.text || item.parts?.[0]?.text || '' }] })).filter((item: any) => item.parts[0].text.trim())
    : [];

  const currentContent: any = { role: 'user', parts: [] };
  if (imageBase64) currentContent.parts.push({ inlineData: { data: imageBase64.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/jpeg' } });
  currentContent.parts.push({ text: message || 'Hello Jarvis' });

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', systemInstruction: systemInstruction || defaultSystemPrompt });
    const result = await model.generateContent({ contents: [...formattedHistory, currentContent] });
    const reply = result.response.text();
    if (!reply?.trim()) throw new Error('Gemini returned an empty response');
    return res.json({ success: true, verified: false, execution: 'provider_response', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', reply: reply.trim(), timestamp: new Date().toISOString() });
  } catch (error: any) {
    return res.status(502).json({ success: false, verified: false, status: 'FAILED', error: 'Gemini request failed' });
  }
});

app.post('/api/gemini/multimodal', async (req, res) => {
  const { imageBase64, prompt, type = 'CHART_INSPECTION' } = req.body;
  if (!imageBase64) return res.status(400).json({ success: false, error: 'imageBase64 is required for multimodal vision inspection' });

  if (!genAI) {
    return res.status(503).json({ success: false, verified: false, status: 'UNAVAILABLE', error: 'Gemini is not configured.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const visionPrompt = prompt || `Perform deep technical vision audit on this image (${type}). Identify visual patterns, risk signals, anomalies, and provide strategic action steps.`;

    const result = await model.generateContent([
      visionPrompt,
      { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } }
    ]);

    return res.json({
      success: true,
      mode: 'GEMINI_MULTIMODAL_LIVE',
      type,
      analysis: result.response.text(),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Multimodal vision inspection failed' });
  }
});

app.post('/api/gemini/audit', async (_req, res) => {
  return res.status(501).json({
    success: false,
    verified: false,
    status: 'NOT_CERTIFIED',
    error: 'AI-generated legal/regulatory analysis is informational only and is not a legal certification.',
    supportedScope: ['factual software/configuration audit', 'technical risk identification'],
    excludedClaims: ['Howey classification certification', 'MiCA compliance certification', 'legal advice'],
  });
});

// -------------------------------------------------------------
// Solana On-Chain & Deployment Endpoints
// -------------------------------------------------------------
app.get('/api/solana/consensus', async (_req, res) => {
  try { res.json(await consensusStatus()); }
  catch { res.status(503).json({ status: 'unavailable', error: 'Consensus RPC identity or connectivity could not be verified' }); }
});

app.get('/api/solana/balance/:pubkey', async (req, res) => {
  try {
    const pubkey = new PublicKey(req.params.pubkey);
    const commitment = (await consensusStatus()).upgrade.commitment;
    const [balanceLamports, tokenAccounts] = await Promise.all([
      connection.getBalance(pubkey, commitment),
      connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }, commitment),
    ]);
    const tokens = tokenAccounts.value.map((ta) => {
      const info: any = ta.account.data.parsed.info;
      return { pubkey: ta.pubkey.toBase58(), mint: info.mint, amount: info.tokenAmount.uiAmountString, decimals: info.tokenAmount.decimals };
    });
    res.json({ address: pubkey.toBase58(), sol: balanceLamports / LAMPORTS_PER_SOL, lamports: balanceLamports, tokens, network: SOLANA_NETWORK, verified: true });
  } catch (error: any) {
    res.status(503).json({ success: false, verified: false, error: 'Balance query failed; check RPC identity and connectivity' });
  }
});

app.post('/api/solana/airdrop', async (req, res) => {
  try {
    const { address, amount = 1, network } = req.body;
    const commitment = (await verifyTestnetOperation(network, SOLANA_NETWORK as keyof typeof SOLANA_GENESIS, consensusStatus)).upgrade.commitment;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 2 || !Number.isSafeInteger(amount * LAMPORTS_PER_SOL)) return res.status(400).json({ success: false, error: 'Airdrop amount must be a positive value of at most 2 SOL in whole lamports.' });
    if (!address) return res.status(400).json({ success: false, error: 'Solana wallet address is required' });
    if (!['devnet', 'testnet'].includes(SOLANA_NETWORK)) return res.status(403).json({ success: false, verified: false, error: 'Airdrop endpoint is limited to non-mainnet test clusters.' });
    const pubkey = new PublicKey(address);
    const signature = await connection.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, commitment);
    const balanceLamports = await connection.getBalance(pubkey, commitment);
    return res.json({ success: true, verified: true, signature, airdroppedSol: amount, newBalanceSol: balanceLamports / LAMPORTS_PER_SOL, explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}` });
  } catch (error: any) {
    if (error instanceof OperationBoundaryError) return res.status(error.status).json({ success: false, verified: false, error: error.message });
    return res.status(503).json({ success: false, verified: false, error: 'Airdrop failed.' });
  }
});

const REGISTRY_PATH = path.join(__dirname, 'jarsol-deployment.json');
app.get('/api/solana/canonical-mint', (req, res) => {
  let network: ReturnType<typeof canonicalNetwork>;
  try { network = canonicalNetwork(req.query.network); }
  catch { return res.status(400).json({ success: false, error: 'Unsupported Solana network.' }); }
  const candidate = network ? path.join(__dirname, 'deployments', `${network}.json`) : REGISTRY_PATH;
  if (!fs.existsSync(candidate)) return res.status(404).json({ success: false, error: 'No canonical deployment registered for requested network' });
  try { return res.json({ ...JSON.parse(fs.readFileSync(candidate, 'utf8')), success: true, verified: false, evidence: 'repository_record_not_live_rpc' }); }
  catch (error: any) { return res.status(500).json({ success: false, error: 'Canonical registry unavailable.' }); }
});

app.post('/api/solana/deploy-token', async (req, res) => {
  try {
    await verifyTestnetOperation(req.body?.network, SOLANA_NETWORK as keyof typeof SOLANA_GENESIS, consensusStatus);
    if (!['devnet', 'testnet'].includes(SOLANA_NETWORK)) return res.status(403).json({ success: false, verified: false, error: 'Use the dedicated hard-gated mainnet deployment script for mainnet.' });
    const { forceRedeploy = false, revokeMintAuthority = true } = req.body || {};
    if (typeof forceRedeploy !== 'boolean' || typeof revokeMintAuthority !== 'boolean') return res.status(400).json({ success: false, error: 'Deployment flags must be boolean.' });
    const payer = loadConfiguredPayer();
    if (!forceRedeploy && fs.existsSync(REGISTRY_PATH)) {
      try {
        const existing = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        if (existing.mintAddress) {
          const info = await connection.getParsedAccountInfo(new PublicKey(existing.mintAddress), 'confirmed');
          if (info.value) return res.json({ ...existing, idempotent: true, verified: true });
        }
      } catch {}
    }
    const payerBalance = await connection.getBalance(payer.publicKey, 'confirmed');
    if (payerBalance < 0.05 * LAMPORTS_PER_SOL) return res.status(400).json({ success: false, verified: false, error: 'Configured payer has insufficient SOL.', payer: payer.publicKey.toBase58(), balanceSol: payerBalance / LAMPORTS_PER_SOL });
    const mintKeypair = Keypair.generate();
    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 9, mintKeypair);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    const totalSupplyRaw = 1000000000n * 1000000000n;
    const MAX_U64 = (1n << 64n) - 1n;
    if (totalSupplyRaw > MAX_U64) throw new Error('Configured supply exceeds SPL Token u64 maximum.');
    const mintTxSig = await mintTo(connection, payer, mint, tokenAccount.address, payer, totalSupplyRaw);
    const supply = await connection.getTokenSupply(mint, 'confirmed');
    if (supply.value.amount !== totalSupplyRaw.toString()) throw new Error(`On-chain supply mismatch: ${supply.value.amount}`);
    let revokeTxSig: string | null = null;
    if (revokeMintAuthority) revokeTxSig = await setAuthority(connection, payer, mint, payer, AuthorityType.MintTokens, null);
    const result = { success: true, verified: true, tokenName: 'JarSol', tokenSymbol: 'JARSOL', mintAddress: mint.toBase58(), tokenAccountAddress: tokenAccount.address.toBase58(), deployerAddress: payer.publicKey.toBase58(), totalSupplyFormatted: '1,000,000,000 $JARSOL', decimals: 9, rawSupply: totalSupplyRaw.toString(), mintTxSignature: mintTxSig, revokeTxSignature: revokeTxSig, mintAuthorityRevoked: !!revokeMintAuthority, network: SOLANA_NETWORK, confirmedOnChain: true, explorerMintUrl: `https://explorer.solana.com/address/${mint.toBase58()}?cluster=${SOLANA_NETWORK}`, explorerMintTxUrl: `https://explorer.solana.com/tx/${mintTxSig}?cluster=${SOLANA_NETWORK}` };
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error: any) {
    if (error instanceof OperationBoundaryError) return res.status(error.status).json({ success: false, verified: false, error: error.message });
    return res.status(500).json({ success: false, verified: false, error: 'On-chain token deployment failed.' });
  }
});

// -------------------------------------------------------------
// Server key export demos are disabled by the operation boundary.
// Browser cryptography remains local and experimental.

// Real DEX Swapping & Smart Order Router (SOR)
// -------------------------------------------------------------
// State for JarSol Virtual Liquidity Pool (50k SOL / 450T JARSOL)
let VIRTUAL_POOL = {
  solReserve: 50000,
  jarsolReserve: 450000000000000,
  feeBps: 30, // 0.3%
};

app.get('/api/dex/quote', (req, res) => {
  const fromToken = ((req.query.fromToken as string) || 'SOL').toUpperCase();
  const toToken = ((req.query.toToken as string) || 'JARSOL').toUpperCase();
  const amount = parseFloat((req.query.amount as string) || '1.0');

  if (amount <= 0 || !Number.isFinite(amount)) {
    return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
  }

  const feeMultiplier = (10000 - VIRTUAL_POOL.feeBps) / 10000;
  let estimatedOutput = 0;
  let priceImpactPct = 0;

  if (fromToken === 'SOL' && toToken === 'JARSOL') {
    const inputWithFee = amount * feeMultiplier;
    estimatedOutput = (inputWithFee * VIRTUAL_POOL.jarsolReserve) / (VIRTUAL_POOL.solReserve + inputWithFee);
    priceImpactPct = (amount / (VIRTUAL_POOL.solReserve + amount)) * 100;
  } else if (fromToken === 'JARSOL' && toToken === 'SOL') {
    const inputWithFee = amount * feeMultiplier;
    estimatedOutput = (inputWithFee * VIRTUAL_POOL.solReserve) / (VIRTUAL_POOL.jarsolReserve + inputWithFee);
    priceImpactPct = (amount / (VIRTUAL_POOL.jarsolReserve + amount)) * 100;
  } else {
    return res.status(400).json({ success: false, error: `Pair ${fromToken}/${toToken} not supported` });
  }

  const spotRate = VIRTUAL_POOL.jarsolReserve / VIRTUAL_POOL.solReserve;
  return res.json({
    success: true,
    fromToken,
    toToken,
    inputAmount: amount,
    estimatedOutput,
    priceImpactPct: Number(priceImpactPct.toFixed(4)),
    spotRate,
    feePct: 0.3,
    mode: 'simulation', verified: false,
    scope: 'Mathematical preview only; no live pool or execution router.',
    route: ['Constant-product preview'],
    computeUnits: 140000
  });
});

// Live DEX execution is unavailable; the quote endpoint is a mathematical preview.

// Autonomous Multi-Agent Swarm (JarSol Hive)
// -------------------------------------------------------------
const SWARM_AGENTS = [
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
];

app.get('/api/agents/swarm', (_req, res) => {
  return res.json({
    success: true,
    swarmName: 'JarSol Autonomous Multi-Agent Swarm',
    version: '2.0.0',
    totalAgents: SWARM_AGENTS.length,
    activeAgents: SWARM_AGENTS.filter(a => a.status !== 'OFFLINE').length,
    swarmConsensusScore: 99.4,
    hiveUptimeSeconds: Math.floor(process.uptime()),
    agents: SWARM_AGENTS,
    federatedMeshNodes: 19,
    timestamp: new Date().toISOString()
  });
});

// Agent definitions do not establish a running autonomous execution service.

// Market Data Consensus & Empirical Stats
// -------------------------------------------------------------
app.get('/api/market/consensus/:symbol?', async (req, res) => {
  try {
    const symbol = (req.params.symbol || (req.query.symbol as string) || 'SOL').toUpperCase();
    const result = await marketDataService.getConsensusPrice(symbol);
    return res.json({ success: true, verified: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, verified: false, error: 'Consensus price query failed' });
  }
});

app.get('/api/market/statistics', async (req, res) => {
  try {
    const forceRefresh = false; // Explicit cache synchronization uses the protected POST endpoint.
    const stats = await marketDataService.getAutomatedEmpiricalStatistics(forceRefresh);
    return res.json({ success: true, verified: true, ...stats });
  } catch (error: any) {
    return res.status(500).json({ success: false, verified: false, error: 'Statistical derivation failed' });
  }
});

app.get('/api/market/historical', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const dataset = await historicalDataService.getHistoricalDataset(forceRefresh);
    return res.json({ success: true, verified: dataset.status === 'LIVE_VERIFIED', ...dataset });
  } catch (error: any) {
    return res.status(500).json({ success: false, verified: false, status: 'DATA_UNAVAILABLE', error: 'Historical data fetch failed' });
  }
});

app.post('/api/market/historical/sync', async (_req, res) => {
  try {
    const dataset = await historicalDataService.getHistoricalDataset(true);
    return res.json({ success: true, verified: dataset.status === 'LIVE_VERIFIED', dataset });
  } catch (error: any) {
    return res.status(500).json({ success: false, verified: false, error: 'Historical sync failed' });
  }
});

// -------------------------------------------------------------
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const failure = publicHttpFailure(error);
  res.status(failure.status).json({ success: false, verified: false, error: failure.message });
});
const server = app.listen(PORT, HOST, () => {
  console.log(`JarSol backend listening on ${HOST}:${(server.address() as { port: number }).port}; network=${SOLANA_NETWORK}; operator actions require authorization.`);
});
server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

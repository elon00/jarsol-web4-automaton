import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

function loadConfiguredPayer(): Keypair {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH;
  if (!keypairPath) throw new Error('SOLANA_KEYPAIR_PATH is not configured. Refusing temporary payer generation.');
  if (!fs.existsSync(keypairPath)) throw new Error(`Solana keypair file not found: ${keypairPath}`);
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  if (!Array.isArray(secretKey)) throw new Error('Invalid Solana keypair file format.');
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  try { genAI = new GoogleGenerativeAI(GEMINI_API_KEY); } catch (err) { console.error('Error initializing Gemini client:', err); }
}

app.get('/api/health', async (_req, res) => {
  try {
    const [version, slot] = await Promise.all([connection.getVersion(), connection.getSlot()]);
    res.json({
      status: 'ONLINE',
      project: 'JarSol Web4 Automaton',
      version: '4.0.0',
      network: SOLANA_NETWORK,
      solanaRpc: SOLANA_RPC_URL,
      solanaVersion: version,
      solanaSlot: slot,
      geminiConfigured: !!GEMINI_API_KEY,
      pqcStatus: 'UNKNOWN',
      dexStatus: 'UNKNOWN',
      complianceStatus: 'INFORMATIONAL_ONLY',
      reality: {
        solanaRpc: { capability: 'Solana RPC connectivity', status: 'VERIFIED', evidence: ['getVersion', 'getSlot'] },
        gemini: { capability: 'Gemini provider configuration', status: GEMINI_API_KEY ? 'CONFIGURED' : 'UNKNOWN' },
        pqc: { capability: 'PQC cryptography', status: 'UNKNOWN' },
        dex: { capability: 'Live DEX execution', status: 'UNKNOWN' },
        compliance: { capability: 'Legal classification', status: 'NOT_CERTIFIED', note: 'Software does not provide legal advice or legal certification.' },
      },
    });
  } catch (error: any) {
    res.status(503).json({ status: 'DEGRADED', verified: false, error: error?.message || 'Solana RPC unavailable' });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  const { message, systemInstruction, imageBase64, liveDateTime, history = [] } = req.body;
  if (!message && !imageBase64) return res.status(400).json({ error: 'Message or image is required' });
  if (!genAI) return res.status(503).json({ success: false, verified: false, status: 'UNAVAILABLE', error: 'Gemini is not configured.' });

  const now = new Date();
  const currentTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const defaultSystemPrompt = `You are Jarvis for JarSol. Be evidence-first. Never claim a simulated, unverified, planned, or legally uncertified capability is live. Current server time: ${liveDateTime?.time || currentTimeString}. Current server date: ${liveDateTime?.date || currentDateString}. Deployment cluster: ${SOLANA_NETWORK}.`;
  const formattedHistory = Array.isArray(history) ? history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.text || item.parts?.[0]?.text || '' }] })).filter((item: any) => item.parts[0].text.trim()) : [];
  const currentContent: any = { role: 'user', parts: [] };
  if (imageBase64) currentContent.parts.push({ inlineData: { data: imageBase64.replace(/^data:image\/\w+;base64,/, ''), mimeType: 'image/jpeg' } });
  currentContent.parts.push({ text: message || 'Hello Jarvis' });

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', systemInstruction: systemInstruction || defaultSystemPrompt });
    const result = await model.generateContent({ contents: [...formattedHistory, currentContent] });
    const reply = result.response.text();
    if (!reply?.trim()) throw new Error('Gemini returned an empty response');
    return res.json({ success: true, verified: true, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', reply: reply.trim(), timestamp: new Date().toISOString() });
  } catch (error: any) {
    return res.status(502).json({ success: false, verified: false, status: 'FAILED', error: error?.message || 'Gemini request failed' });
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

app.get('/api/solana/balance/:pubkey', async (req, res) => {
  try {
    const pubkey = new PublicKey(req.params.pubkey);
    const [balanceLamports, tokenAccounts] = await Promise.all([
      connection.getBalance(pubkey, 'confirmed'),
      connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }, 'confirmed'),
    ]);
    const tokens = tokenAccounts.value.map((ta) => { const info: any = ta.account.data.parsed.info; return { pubkey: ta.pubkey.toBase58(), mint: info.mint, amount: info.tokenAmount.uiAmountString, decimals: info.tokenAmount.decimals }; });
    res.json({ address: pubkey.toBase58(), sol: balanceLamports / LAMPORTS_PER_SOL, lamports: balanceLamports, tokens, network: SOLANA_NETWORK, verified: true });
  } catch (error: any) { res.status(503).json({ success: false, verified: false, error: error?.message || 'Balance query failed' }); }
});

app.post('/api/solana/airdrop', async (req, res) => {
  try {
    const { address, amount = 1 } = req.body;
    if (!address) return res.status(400).json({ success: false, error: 'Solana wallet address is required' });
    if (!['devnet', 'testnet'].includes(SOLANA_NETWORK)) return res.status(403).json({ success: false, verified: false, error: 'Airdrop endpoint is limited to non-mainnet test clusters.' });
    const pubkey = new PublicKey(address);
    const signature = await connection.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature, 'confirmed');
    const balanceLamports = await connection.getBalance(pubkey, 'confirmed');
    return res.json({ success: true, verified: true, signature, airdroppedSol: amount, newBalanceSol: balanceLamports / LAMPORTS_PER_SOL, explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}` });
  } catch (error: any) { return res.status(503).json({ success: false, verified: false, error: error?.message || 'Airdrop failed' }); }
});

const REGISTRY_PATH = path.join(__dirname, 'jarsol-deployment.json');
app.get('/api/solana/canonical-mint', (req, res) => {
  const network = typeof req.query.network === 'string' ? req.query.network.toLowerCase() : '';
  const candidate = network ? path.join(__dirname, 'deployments', `${network}.json`) : REGISTRY_PATH;
  if (!fs.existsSync(candidate)) return res.status(404).json({ success: false, error: 'No canonical deployment registered for requested network' });
  try { return res.json({ success: true, verified: true, ...JSON.parse(fs.readFileSync(candidate, 'utf8')) }); }
  catch (error: any) { return res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/solana/deploy-token', async (req, res) => {
  try {
    if (!['devnet', 'testnet'].includes(SOLANA_NETWORK)) return res.status(403).json({ success: false, verified: false, error: 'Use the dedicated hard-gated mainnet deployment script for mainnet.' });
    const { forceRedeploy = false, revokeMintAuthority = true } = req.body || {};
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
  } catch (error: any) { return res.status(500).json({ success: false, verified: false, error: error?.message || 'On-chain token deployment failed' }); }
});

app.post('/api/dex/swap', (_req, res) => res.status(501).json({ success: false, verified: false, status: 'NOT_IMPLEMENTED', error: 'Live DEX execution is not implemented by this endpoint.' }));
app.post('/api/pqc/generate-keys', (_req, res) => res.status(501).json({ success: false, verified: false, status: 'NOT_IMPLEMENTED', error: 'Real ML-KEM/ML-DSA implementation is not exposed by this endpoint.' }));
app.post('/api/pqc/verify-signature', (_req, res) => res.status(501).json({ success: false, verified: false, status: 'NOT_IMPLEMENTED', error: 'Real ML-DSA verification is not exposed by this endpoint.' }));

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`JarSol backend listening on ${PORT} | Solana: ${SOLANA_RPC_URL}`));

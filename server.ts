import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl, Transaction, SystemProgram } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { sha3_512, sha3_256 } from '@noble/hashes/sha3';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
}

function realityStatus(capability: string, status: 'VERIFIED' | 'IMPLEMENTED' | 'SIMULATION' | 'PLANNED' | 'UNKNOWN', evidence: string[] = []) {
  return {
    capability,
    status,
    environment: SOLANA_NETWORK,
    evidence,
    lastVerifiedAt: status === 'VERIFIED' ? new Date().toISOString() : null,
  };
}

function generateSafePolymathResponse(query: string, timeStr: string, dateStr: string): string {
  const q = query.toLowerCase();
  if (q.includes('conway') || q.includes('automaton') || q.includes('cellular')) {
    return 'JarSol currently contains a Conway-style simulation layer. Any compute-gas or on-chain Conway execution claims require separate executable evidence; I will not label the simulation as live protocol compute.';
  }
  if (q.includes('quantum') || q.includes('pqc') || q.includes('lattice') || q.includes('fips') || q.includes('shor') || q.includes('dilithium') || q.includes('kyber')) {
    return 'JarSol documents NIST PQC targets, but this server endpoint does not implement ML-DSA or ML-KEM. Cryptographic security must be established by a real, tested implementation and vectors, not by a hash-based demo.';
  }
  if (q.includes('solana') || q.includes('jarsol') || q.includes('token') || q.includes('supply') || q.includes('raydium') || q.includes('mint')) {
    return 'JarSol includes Solana Devnet token functionality. A mint, transaction, DEX pool, or authority state is only reported as verified when its actual on-chain evidence is available.';
  }
  if (q.includes('audit') || q.includes('compliance') || q.includes('howey') || q.includes('mica')) {
    return 'The in-app audit is informational software output only. It cannot certify SEC/Howey classification, MiCA compliance, or legal approval.';
  }
  if (q.includes('time') || q.includes('date') || q.includes('aaj') || q.includes('waqt') || q.includes('samay')) {
    return `Current server time is ${timeStr}; current server date is ${dateStr}. Infrastructure health is reported separately from feature verification.`;
  }
  return 'JarSol is being evaluated using an evidence-first rule: build success proves the software builds, while on-chain, cryptographic, DEX, and legal claims require their own reproducible evidence.';
}

app.get('/api/health', async (_req, res) => {
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    res.json({
      status: 'ONLINE',
      project: 'JarSol Web4 Automaton',
      version: '4.0.0',
      network: SOLANA_NETWORK,
      solanaRpc: SOLANA_RPC_URL,
      solanaVersion: version,
      solanaSlot: slot,
      geminiConfigured: !!GEMINI_API_KEY,
      geminiModel: genAI ? GEMINI_MODEL : null,
      pqcStandard: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) - documented target, not proof of implementation',
      reality: {
        solanaRpc: realityStatus('Solana RPC connectivity', 'VERIFIED', ['getVersion', 'getSlot']),
        gemini: realityStatus('Gemini provider configuration', GEMINI_API_KEY ? 'IMPLEMENTED' : 'UNKNOWN'),
        pqc: realityStatus('PQC cryptography', 'UNKNOWN'),
        dex: realityStatus('Raydium/Orca live swap', 'UNKNOWN'),
        compliance: realityStatus('Regulatory classification/compliance', 'UNKNOWN'),
      },
    });
  } catch (error: any) {
    res.status(503).json({ status: 'DEGRADED', error: error.message });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  const { message, systemInstruction, imageBase64, liveDateTime, history = [] } = req.body;
  if (!message && !imageBase64) return res.status(400).json({ error: 'Message or image is required' });

  const now = new Date();
  const currentTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const defaultSystemPrompt = `You are Jarvis for JarSol. Be energetic but evidence-first. Never claim a simulated, unverified, or planned capability is live. Never certify legal status. Current server time: ${liveDateTime?.time || currentTimeString}. Current server date: ${liveDateTime?.date || currentDateString}. Deployment cluster: ${SOLANA_NETWORK}.`;

  const formattedHistory = Array.isArray(history) ? history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.text || item.parts?.[0]?.text || '' }] })).filter((item: any) => item.parts[0].text.trim()) : [];
  const currentContent: any = { role: 'user', parts: [] };
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    currentContent.parts.push({ inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } });
  }
  currentContent.parts.push({ text: message || 'Hello Jarvis' });
  const fullContents = [...formattedHistory, currentContent];

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: systemInstruction || defaultSystemPrompt, generationConfig: { maxOutputTokens: 250, temperature: 0.85 } });
      const result = await model.generateContent({ contents: fullContents });
      const responseText = result.response.text();
      if (responseText?.trim()) return res.json({ success: true, model: GEMINI_MODEL, reply: responseText.trim(), timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.warn('Gemini request failed:', err?.message || err);
    }
  }

  const intelligentReply = generateSafePolymathResponse(message || 'Hello', liveDateTime?.time || currentTimeString, liveDateTime?.date || currentDateString);
  return res.json({ success: false, model: 'safe-local-fallback', reply: intelligentReply, reason: 'No verified live Gemini response was available.', timestamp: new Date().toISOString() });
});

app.post('/api/gemini/audit', async (req, res) => {
  const target = typeof req.body?.target === 'string' ? req.body.target : '$JARSOL / JarSol';
  const prompt = `Produce an informational software audit for ${target}. Do not give legal advice or a legal conclusion. Explicitly separate verified evidence, implementation evidence, simulation, planned work, and unknowns. For US law and EU MiCA, state that legal classification/compliance requires qualified legal review and source-specific evidence.`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return res.json({ success: true, report: text, auditTimestamp: new Date().toISOString(), auditor: `JarSol Regulatory Analysis // ${GEMINI_MODEL}`, legalStatus: 'INFORMATIONAL_ONLY' });
    } catch (e) {
      console.warn('Audit model request failed:', e);
    }
  }

  return res.status(503).json({
    success: false,
    error: 'No live audit model available.',
    legalStatus: 'INFORMATIONAL_ONLY',
    report: 'No legal classification, MiCA compliance status, or Howey conclusion is certified by this software. Required evidence should be reviewed by qualified counsel.',
  });
});

app.get('/api/solana/balance/:pubkey', async (req, res) => {
  try {
    const pubkey = new PublicKey(req.params.pubkey);
    const balanceLamports = await connection.getBalance(pubkey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID });
    const parsedTokens = tokenAccounts.value.map((ta) => {
      const info = ta.account.data.parsed.info;
      return { pubkey: ta.pubkey.toBase58(), mint: info.mint, amount: info.tokenAmount.uiAmountString, decimals: info.tokenAmount.decimals };
    });
    res.json({ address: pubkey.toBase58(), sol: balanceLamports / LAMPORTS_PER_SOL, lamports: balanceLamports, tokens: parsedTokens, network: SOLANA_NETWORK });
  } catch (error: any) {
    res.status(502).json({ error: error.message, verified: false });
  }
});

app.post('/api/solana/airdrop', async (req, res) => {
  try {
    const { address, amount = 2 } = req.body;
    if (!address) return res.status(400).json({ error: 'Solana wallet address is required' });
    const pubkey = new PublicKey(address);
    const airdropSignature = await connection.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ blockhash: latestBlockHash.blockhash, lastValidBlockHeight: latestBlockHash.lastValidBlockHeight, signature: airdropSignature });
    const balanceLamports = await connection.getBalance(pubkey);
    return res.json({ success: true, verified: true, signature: airdropSignature, airdroppedSol: amount, newBalanceSol: balanceLamports / LAMPORTS_PER_SOL, explorerUrl: `https://explorer.solana.com/tx/${airdropSignature}?cluster=${SOLANA_NETWORK}` });
  } catch (error: any) {
    return res.status(503).json({ success: false, verified: false, error: error.message, note: 'Devnet faucet/RPC action did not complete. Use an external faucet when rate-limited.' });
  }
});

app.post('/api/solana/deploy-token', async (req, res) => {
  try {
    const { payerSecretKey, revokeMintAuthority = true } = req.body;
    let payer: Keypair;
    if (payerSecretKey && Array.isArray(payerSecretKey)) payer = Keypair.fromSecretKey(Uint8Array.from(payerSecretKey));
    else payer = Keypair.generate();

    const mintKeypair = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight, signature: airdropSignature });

    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 9, mintKeypair);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    const totalSupplyRaw = BigInt('1000000000000000') * BigInt('1000000000');
    const mintTxSignature = await mintTo(connection, payer, mint, tokenAccount.address, payer, totalSupplyRaw);
    let revokeTxSignature: string | null = null;
    if (revokeMintAuthority) revokeTxSignature = await setAuthority(connection, payer, mint, payer, AuthorityType.MintTokens, null);

    const mintInfo = await connection.getParsedAccountInfo(mint);
    const supply = await connection.getTokenSupply(mint);
    const parsedMint = (mintInfo.value?.data as any)?.parsed?.info;
    const authorityRevoked = parsedMint?.mintAuthority === null;
    const verified = supply.value.amount === '1000000000000000' && (!revokeMintAuthority || authorityRevoked);
    if (!verified) return res.status(502).json({ success: false, verified: false, error: 'On-chain postcondition verification failed.' });

    return res.json({
      success: true,
      verified: true,
      tokenName: 'JarSol',
      tokenSymbol: 'JARSOL',
      mintAddress: mint.toBase58(),
      tokenAccountAddress: tokenAccount.address.toBase58(),
      deployerAddress: payer.publicKey.toBase58(),
      totalSupplyFormatted: '1,000,000,000,000,000 $JARSOL',
      rawSupply: supply.value.amount,
      decimals: supply.value.decimals,
      mintTxSignature,
      revokeTxSignature,
      mintAuthorityRevoked: authorityRevoked,
      tokenProgram: 'SPL Token (legacy TOKEN_PROGRAM_ID)',
      network: SOLANA_NETWORK,
      explorerMintUrl: `https://explorer.solana.com/address/${mint.toBase58()}?cluster=${SOLANA_NETWORK}`,
      explorerMintTxUrl: `https://explorer.solana.com/tx/${mintTxSignature}?cluster=${SOLANA_NETWORK}`,
    });
  } catch (error: any) {
    console.error('Token deployment error:', error);
    return res.status(503).json({ success: false, verified: false, error: error.message, note: 'No mint was reported because on-chain deployment did not complete.' });
  }
});

app.post('/api/dex/swap', async (_req, res) => {
  return res.status(501).json({
    success: false,
    verified: false,
    status: 'UNKNOWN',
    error: 'Live Raydium/Orca swap execution is not implemented by this endpoint.',
    simulationAvailable: true,
    note: 'The previous endpoint returned a locally hashed transaction as a fake swap signature; this route now fails closed instead of reporting that simulation as an on-chain swap.',
  });
});

app.post('/api/pqc/generate-keys', (_req, res) => {
  return res.status(501).json({
    success: false,
    verified: false,
    status: 'UNKNOWN',
    error: 'Real ML-DSA / ML-KEM key generation is not implemented by this endpoint.',
    note: 'The previous implementation used Math.random() plus SHA3 labels and was not a NIST PQC implementation.',
  });
});

app.post('/api/pqc/verify-signature', (_req, res) => {
  return res.status(501).json({
    success: false,
    verified: false,
    status: 'UNKNOWN',
    error: 'Real ML-DSA signature verification is not implemented by this endpoint.',
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('=====================================================================');
  console.log('⚡ JARSOL // REALITY-FIRST BACKEND ONLINE');
  console.log(`⚡ Model:         ${genAI ? GEMINI_MODEL : 'not configured'}`);
  console.log(`⚡ Local URL:     http://localhost:${PORT}`);
  console.log(`⚡ Solana Cluster: ${SOLANA_RPC_URL}`);
  console.log('=====================================================================');
});

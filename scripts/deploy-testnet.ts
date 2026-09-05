import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTNET_RPC = 'https://api.testnet.solana.com';
const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'testnet.json');
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH || 'C:/Users/marti/.config/solana/id.json';

async function deployTestnet() {
  console.log('🚀 [TESTNET DEPLOY] Starting JarSol SPL Token Deployment on Solana Testnet...');
  console.log(`📡 [RPC] Cluster URL: ${TESTNET_RPC}`);

  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Keypair not found at: ${KEYPAIR_PATH}`);
  }

  const rawKey = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(rawKey));
  console.log(`👤 [PAYER] Wallet: ${payer.publicKey.toBase58()}`);

  const connection = new Connection(TESTNET_RPC, 'confirmed');
  const balanceLamports = await connection.getBalance(payer.publicKey, 'confirmed');
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`💰 [BALANCE] Payer Testnet Balance: ${balanceSol} SOL (${balanceLamports} lamports)`);

  if (balanceLamports < 0.05 * LAMPORTS_PER_SOL) {
    throw new Error(`Insufficient Testnet SOL: ${balanceSol} SOL found, minimum 0.05 SOL required.`);
  }

  const mintKeypair = Keypair.generate();
  const mintAddress = mintKeypair.publicKey.toBase58();
  console.log(`💎 [MINT] Creating SPL Token Mint: ${mintAddress}...`);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    9,
    mintKeypair
  );
  console.log(`✅ [CONFIRMED] Mint Created: ${mint.toBase58()}`);

  console.log(`📦 [ATA] Deriving Associated Token Account for payer...`);
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✅ [CONFIRMED] Token Account: ${tokenAccount.address.toBase58()}`);

  const totalSupplyRaw = BigInt('1000000000000000') * BigInt('1000000000');
  console.log(`🪙 [MINT_TO] Minting 1,000,000,000,000,000 $JARSOL to payer token account...`);
  const mintTxSig = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    totalSupplyRaw
  );
  console.log(`✅ [CONFIRMED] Mint Transaction Signature: ${mintTxSig}`);

  console.log(`🔒 [REVOKE] Revoking Mint Authority (Immutable Supply)...`);
  const revokeTxSig = await setAuthority(
    connection,
    payer,
    mint,
    payer,
    AuthorityType.MintTokens,
    null
  );
  console.log(`✅ [CONFIRMED] Revoke Transaction Signature: ${revokeTxSig}`);

  const deploymentData = {
    network: 'testnet',
    status: 'DEPLOYED',
    token: {
      name: 'JarSol',
      symbol: 'JARSOL',
      mintAddress: mint.toBase58(),
      tokenAccountAddress: tokenAccount.address.toBase58(),
      deployerAddress: payer.publicKey.toBase58(),
      decimals: 9,
      totalSupplyFormatted: '1,000,000,000,000,000 $JARSOL',
      rawSupply: totalSupplyRaw.toString()
    },
    deployment: {
      confirmedOnChain: true,
      mintAuthorityRevoked: true,
      freezeAuthority: payer.publicKey.toBase58(),
      mintTxSignature: mintTxSig,
      revokeTxSignature: revokeTxSig,
      deployedAt: new Date().toISOString(),
      explorerMintUrl: `https://explorer.solana.com/address/${mint.toBase58()}?cluster=testnet`,
      explorerMintTxUrl: `https://explorer.solana.com/tx/${mintTxSig}?cluster=testnet`
    }
  };

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(deploymentData, null, 2), 'utf-8');
  console.log(`💾 [REGISTRY] Saved canonical Testnet deployment record to ${REGISTRY_PATH}`);

  console.log('\n======================================================');
  console.log('🏆 JARSOL WEB4 AUTOMATON // TESTNET DEPLOYMENT SUCCESSFUL');
  console.log('======================================================');
  console.log(`💎 Mint Address:       ${mint.toBase58()}`);
  console.log(`📦 Token Account:      ${tokenAccount.address.toBase58()}`);
  console.log(`👤 Deployer:           ${payer.publicKey.toBase58()}`);
  console.log(`🪙 Total Supply:       1,000,000,000,000,000 $JARSOL`);
  console.log(`🔒 Mint Authority:     REVOKED (null)`);
  console.log(`🔗 Explorer Mint:      https://explorer.solana.com/address/${mint.toBase58()}?cluster=testnet`);
  console.log(`🔗 Explorer Tx:        https://explorer.solana.com/tx/${mintTxSig}?cluster=testnet`);
  console.log('======================================================\n');
}

deployTestnet().catch(err => {
  console.error('❌ Testnet deployment error:', err);
  process.exit(1);
});

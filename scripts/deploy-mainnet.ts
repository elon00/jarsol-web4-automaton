import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } from './spl-helper.js';
import { findMetadataPda, createMetadataAccountV3Instruction } from './metaplex-helper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAINNET_RPC = process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com';
const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'mainnet.json');
const ROOT_REGISTRY_PATH = path.join(__dirname, '..', 'jarsol-deployment.json');
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH;
const METADATA_URI = 'https://raw.githubusercontent.com/elon00/jarsol-web4-automaton/main/public/jarsol-metadata.json';

async function deployMainnet() {
  console.log('=====================================================================');
  console.log('🛑 JARSOL // PHASE 5 MAINNET PRODUCTION DEPLOYMENT (HARD-GATED)');
  console.log('=====================================================================');

  if (process.env.SOLANA_NETWORK !== 'mainnet-beta') {
    console.error('\n❌ SAFETY ABORT: SOLANA_NETWORK must be explicitly set to "mainnet-beta".');
    console.error('   Current value: "' + process.env.SOLANA_NETWORK + '"');
    process.exit(1);
  }

  if (process.env.MAINNET_DEPLOYMENT_APPROVED !== 'true') {
    console.error('\n❌ SAFETY ABORT: MAINNET_DEPLOYMENT_APPROVED is not set to "true".');
    console.error('   Mainnet deployment carries permanent economic and on-chain consequences.');
    console.error('   Execution is strictly locked until explicit authorization is granted.\n');
    process.exit(1);
  }

  console.log(`📡 [RPC] Cluster URL: ${MAINNET_RPC}`);
  console.log(`🌐 [METADATA URI] ${METADATA_URI}`);

  if (!KEYPAIR_PATH) {
    throw new Error('SOLANA_KEYPAIR_PATH must be explicitly configured. Refusing to use a default keypair path.');
  }
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Keypair not found at: ${KEYPAIR_PATH}`);
  }

  const rawKey = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(rawKey));
  console.log(`👤 [PAYER] Deployer Wallet: ${payer.publicKey.toBase58()}`);

  const connection = new Connection(MAINNET_RPC, 'confirmed');
  const balanceLamports = await connection.getBalance(payer.publicKey, 'confirmed');
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`💰 [BALANCE] Payer Mainnet Balance: ${balanceSol} SOL (${balanceLamports} lamports)`);

  if (balanceLamports < 0.05 * LAMPORTS_PER_SOL) {
    throw new Error(`Insufficient Mainnet SOL: ${balanceSol} SOL found, minimum 0.05 SOL required.`);
  }

  const SUPPLY_HUMAN = BigInt('1000000000');
  const DECIMALS = 9;
  const RAW_SUPPLY = SUPPLY_HUMAN * BigInt(10) ** BigInt(DECIMALS);
  const MAX_U64 = (BigInt(1) << BigInt(64)) - BigInt(1);

  if (RAW_SUPPLY > MAX_U64) {
    throw new Error(`FATAL: RAW_SUPPLY ${RAW_SUPPLY} exceeds u64 limit ${MAX_U64}`);
  }

  const mintKeypair = Keypair.generate();
  const mintAddress = mintKeypair.publicKey.toBase58();
  console.log(`\n💎 [STEP 1] Creating SPL Token Mint: ${mintAddress}...`);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    DECIMALS,
    mintKeypair
  );

  // Derive Metaplex Metadata PDA
  const metadataPDA = findMetadataPda(mint);
  console.log(`📍 [PDA] Derived Metaplex Metadata PDA: ${metadataPDA.toBase58()}`);

  // 4. Step 2: Create Metaplex Metadata Account V3 BEFORE revoking authority
  console.log('\n🎨 [STEP 2] Creating On-Chain Metaplex Metadata V3...');
  let metadataTxSig = '';
  try {
    const tx = new Transaction().add(
      createMetadataAccountV3Instruction(
        metadataPDA,
        mint,
        payer.publicKey,
        payer.publicKey,
        payer.publicKey,
        'JarSol',
        'JARSOL',
        METADATA_URI
      )
    );
    metadataTxSig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(`✅ [CONFIRMED] Metaplex Metadata attached on-chain! Tx: ${metadataTxSig}`);
  } catch (metaErr: any) {
    console.error('❌ Metaplex metadata attachment error:', metaErr);
    throw metaErr;
  }

  console.log('\n📦 [STEP 3] Creating recipient ATA...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);

  console.log(`\n🪙 [STEP 4] Minting exactly ${SUPPLY_HUMAN.toLocaleString()} JARSOL...`);
  const mintTxSig = await mintTo(connection, payer, mint, tokenAccount.address, payer, RAW_SUPPLY);

  const supplyInfo = await connection.getTokenSupply(mint, 'confirmed');
  if (supplyInfo.value.amount !== RAW_SUPPLY.toString()) {
    throw new Error(`On-chain supply mismatch! Expected ${RAW_SUPPLY}, found ${supplyInfo.value.amount}`);
  }

  console.log('\n🔒 [STEP 5] Revoking mint authority...');
  const revokeMintTxSig = await setAuthority(connection, payer, mint, payer, AuthorityType.MintTokens, null);

  console.log('❄️ [STEP 6] Revoking freeze authority...');
  const revokeFreezeTxSig = await setAuthority(connection, payer, mint, payer, AuthorityType.FreezeAccount, null);

  const finalMintInfo = await connection.getParsedAccountInfo(mint, 'confirmed');
  const parsedFinal = (finalMintInfo.value?.data as any)?.parsed?.info;
  if (parsedFinal?.mintAuthority !== null || parsedFinal?.freezeAuthority !== null) {
    throw new Error('Authority revocation postcondition verification failed.');
  }

  const mainnetRecord = {
    network: 'mainnet-beta',
    status: 'DEPLOYED',
    phase: 'PHASE_5_MAINNET_PRODUCTION',
    token: {
      name: 'JarSol',
      symbol: 'JARSOL',
      mintAddress,
      tokenAccountAddress: tokenAccount.address.toBase58(),
      deployerAddress: payer.publicKey.toBase58(),
      decimals: DECIMALS,
      totalSupplyFormatted: '1,000,000,000 $JARSOL',
      rawSupply: RAW_SUPPLY.toString(),
      supplyModel: 'Safe u64 (1 Billion @ 9 Decimals)',
      metadataPDA: metadataPDA.toBase58(),
      metadataUri: METADATA_URI,
    },
    deployment: {
      confirmedOnChain: true,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
      mintAuthority: null,
      freezeAuthority: null,
      metadataAttachedOnChain: true,
      metadataTxSignature: metadataTxSig,
      mintTxSignature: mintTxSig,
      revokeMintTxSignature: revokeMintTxSig,
      revokeFreezeTxSignature: revokeFreezeTxSig,
      deployedAt: new Date().toISOString(),
      explorerMintUrl: `https://explorer.solana.com/address/${mintAddress}`,
      explorerMintTxUrl: `https://explorer.solana.com/tx/${mintTxSig}`,
      explorerMetadataPdaUrl: `https://explorer.solana.com/address/${metadataPDA.toBase58()}`,
    },
  };

  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(mainnetRecord, null, 2), 'utf-8');

  let rootRegistry: any = {};
  if (fs.existsSync(ROOT_REGISTRY_PATH)) {
    rootRegistry = JSON.parse(fs.readFileSync(ROOT_REGISTRY_PATH, 'utf-8'));
  }
  rootRegistry.clusters ??= {};
  rootRegistry.clusters['mainnet-beta'] = mainnetRecord.token;
  fs.writeFileSync(ROOT_REGISTRY_PATH, JSON.stringify(rootRegistry, null, 2), 'utf-8');

  console.log('✅ Mainnet deployment workflow completed; all postconditions verified.');
  console.log(`💎 Mint: ${mintAddress}`);
}

deployMainnet().catch((err) => {
  console.error('\n❌ FATAL: Mainnet deployment failed:', err);
  process.exit(1);
});

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } from '@solana/spl-token';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
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
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function deployMainnet() {
  console.log('=====================================================================');
  console.log('🛑 JARSOL // PHASE 5 MAINNET PRODUCTION DEPLOYMENT (HARD-GATED)');
  console.log('=====================================================================');

  // SAFETY GATE 1: Explicit Network Environment Check
  if (process.env.SOLANA_NETWORK !== 'mainnet-beta') {
    console.error('\n❌ SAFETY ABORT: SOLANA_NETWORK must be explicitly set to "mainnet-beta".');
    console.error('   Current value: "' + process.env.SOLANA_NETWORK + '"');
    console.error('   Refusing to proceed without explicit network confirmation.\n');
    process.exit(1);
  }

  // SAFETY GATE 2: Explicit Human Approval Gate
  if (process.env.MAINNET_DEPLOYMENT_APPROVED !== 'true') {
    console.error('\n❌ SAFETY ABORT: MAINNET_DEPLOYMENT_APPROVED is not set to "true".');
    console.error('   Mainnet deployment carries permanent economic and on-chain consequences.');
    console.error('   Execution is strictly locked until explicit authorization is granted.\n');
    process.exit(1);
  }

  console.log(`📡 [RPC] Cluster URL: ${MAINNET_RPC}`);
  console.log(`🌐 [METADATA URI] ${METADATA_URI}`);

  // SAFETY GATE 3: Keypair path must be explicitly supplied; no machine-specific fallback.
  if (!KEYPAIR_PATH) {
    throw new Error('SOLANA_KEYPAIR_PATH must be explicitly configured. Refusing to use a default keypair path.');
  }

  // 1. Validate environment and keypair
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
    throw new Error(`Insufficient Mainnet SOL: ${balanceSol} SOL found, minimum 0.05 SOL required to cover account rent, Metaplex metadata, and fees.`);
  }

  // 2. Supply Mathematics Assertion (Safe u64 limit)
  const SUPPLY_HUMAN = BigInt('1000000000'); // 1 Billion $JARSOL
  const DECIMALS = 9;
  const RAW_SUPPLY = SUPPLY_HUMAN * BigInt(10 ** DECIMALS); // 10^18
  const MAX_U64 = (BigInt(1) << BigInt(64)) - BigInt(1);

  console.log('\n--- 📐 MATHEMATICAL SUPPLY VALIDATION ---');
  console.log(`🪙 Human-Readable Supply: ${SUPPLY_HUMAN.toLocaleString()} $JARSOL (1 Billion)`);
  console.log(`🔢 Decimals:             ${DECIMALS}`);
  console.log(`🔢 Raw Supply (Units):    ${RAW_SUPPLY.toString()} (10^18)`);
  console.log(`🛡️ Max Safe uint64:      ${MAX_U64.toString()} (~1.84 x 10^19)`);

  if (RAW_SUPPLY > MAX_U64) {
    throw new Error(`FATAL: RAW_SUPPLY ${RAW_SUPPLY} exceeds u64 limit ${MAX_U64}`);
  }
  console.log('✅ Mathematical assertion: RAW_SUPPLY fits strictly within u64 without overflow/truncation.');

  // 3. Step 1: Create Mint Account
  const mintKeypair = Keypair.generate();
  const mintAddress = mintKeypair.publicKey.toBase58();
  console.log(`\n💎 [STEP 1] Allocating SPL Token Mint: ${mintAddress}...`);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mintAuthority
    payer.publicKey, // freezeAuthority initially set to payer
    DECIMALS,
    mintKeypair
  );
  console.log(`✅ [CONFIRMED] Mint Created: ${mint.toBase58()}`);

  // Derive Metaplex Metadata PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID
  );
  console.log(`📍 [PDA] Derived Metaplex Metadata PDA: ${metadataPDA.toBase58()}`);

  // 4. Step 2: Create Metaplex Metadata Account V3 BEFORE revoking authority
  console.log('\n🎨 [STEP 2] Creating On-Chain Metaplex Metadata V3...');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));
  let metadataTxSig = '';
  try {
    const sftResult = await metaplex.nfts().createSft({
      useExistingMint: mint,
      name: 'JarSol',
      symbol: 'JARSOL',
      uri: METADATA_URI,
      sellerFeeBasisPoints: 0,
      isMutable: true,
    });
    metadataTxSig = sftResult.response.signature;
    console.log(`✅ [CONFIRMED] Metaplex Metadata attached on-chain! Tx: ${metadataTxSig}`);
  } catch (metaErr: any) {
    console.error('❌ Metaplex metadata attachment error:', metaErr);
    throw metaErr;
  }

  // 5. Step 3: Create Recipient ATA
  console.log('\n📦 [STEP 3] Creating Associated Token Account (ATA) for deployer...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✅ [CONFIRMED] Deployer Token Account: ${tokenAccount.address.toBase58()}`);

  // 6. Step 4: Mint Verified Safe Supply
  console.log(`\n🪙 [STEP 4] Minting exactly ${SUPPLY_HUMAN.toLocaleString()} $JARSOL to ATA...`);
  const mintTxSig = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    RAW_SUPPLY
  );
  console.log(`✅ [CONFIRMED] Mint Transaction Signature: ${mintTxSig}`);

  // 7. Step 5: Verify On-Chain Supply Post-Condition
  console.log('\n🔍 [STEP 5] Verifying On-Chain Supply State...');
  const supplyInfo = await connection.getTokenSupply(mint, 'confirmed');
  console.log(`📊 On-Chain Raw Supply:    ${supplyInfo.value.amount}`);
  console.log(`📊 On-Chain Decimals:      ${supplyInfo.value.decimals}`);
  console.log(`📊 On-Chain UI Amount:     ${supplyInfo.value.uiAmountString}`);

  if (supplyInfo.value.amount !== RAW_SUPPLY.toString()) {
    throw new Error(`On-chain supply mismatch! Expected ${RAW_SUPPLY}, found ${supplyInfo.value.amount}`);
  }
  console.log('✅ Postcondition verification: Supply matches 100% of mathematical target.');

  // 8. Step 6: Revoke Mint Authority (100% Fixed Supply)
  console.log('\n🔒 [STEP 6] Revoking Mint Authority (Mathematically Immutable Supply)...');
  const revokeMintTxSig = await setAuthority(
    connection,
    payer,
    mint,
    payer,
    AuthorityType.MintTokens,
    null
  );
  console.log(`✅ [CONFIRMED] Mint Authority Revoked Tx: ${revokeMintTxSig}`);

  // 9. Step 7: Revoke Freeze Authority (Option A - 100% Trustless)
  console.log('\n❄️ [STEP 7] Revoking Freeze Authority (Option A - 100% Trustless Censorship Resistance)...');
  const revokeFreezeTxSig = await setAuthority(
    connection,
    payer,
    mint,
    payer,
    AuthorityType.FreezeAccount,
    null
  );
  console.log(`✅ [CONFIRMED] Freeze Authority Revoked Tx: ${revokeFreezeTxSig}`);

  // 10. Step 8: Final RPC State Audit
  console.log('\n🔍 [STEP 8] Performing Final RPC State Audit...');
  const finalMintInfo = await connection.getParsedAccountInfo(mint, 'confirmed');
  const parsedFinal = (finalMintInfo.value?.data as any)?.parsed?.info;
  const isMintAuthNull = parsedFinal.mintAuthority === null;
  const isFreezeAuthNull = parsedFinal.freezeAuthority === null;

  console.log(`✅ Final Mint Authority:   ${isMintAuthNull ? 'REVOKED (null) [VERIFIED]' : parsedFinal.mintAuthority}`);
  console.log(`✅ Final Freeze Authority: ${isFreezeAuthNull ? 'REVOKED (null) [100% TRUSTLESS]' : parsedFinal.freezeAuthority}`);

  if (!isMintAuthNull || !isFreezeAuthNull) {
    throw new Error('Authority revocation postcondition verification failed!');
  }

  // 11. Step 9: Save to Canonical Registries
  const mainnetRecord = {
    network: 'mainnet-beta',
    status: 'DEPLOYED',
    phase: 'PHASE_5_MAINNET_PRODUCTION',
    token: {
      name: 'JarSol',
      symbol: 'JARSOL',
      mintAddress: mintAddress,
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

  const deploymentsDir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(mainnetRecord, null, 2), 'utf-8');
  console.log(`\n💾 Saved mainnet canonical deployment to: ${REGISTRY_PATH}`);

  // Sync root jarsol-deployment.json
  try {
    let rootRegistry: any = {};
    if (fs.existsSync(ROOT_REGISTRY_PATH)) {
      rootRegistry = JSON.parse(fs.readFileSync(ROOT_REGISTRY_PATH, 'utf-8'));
    }
    if (!rootRegistry.clusters) rootRegistry.clusters = {};
    rootRegistry.clusters['mainnet-beta'] = {
      mintAddress: mintAddress,
      tokenAccountAddress: tokenAccount.address.toBase58(),
      deployerAddress: payer.publicKey.toBase58(),
      status: 'DEPLOYED',
      decimals: DECIMALS,
      totalSupplyFormatted: '1,000,000,000 $JARSOL',
      rawSupply: RAW_SUPPLY.toString(),
      confirmedOnChain: true,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
      metadataAttachedOnChain: true,
      metadataPDA: metadataPDA.toBase58(),
      mintTxSignature: mintTxSig,
      revokeMintTxSignature: revokeMintTxSig,
      revokeFreezeTxSignature: revokeFreezeTxSig,
      deployedAt: mainnetRecord.deployment.deployedAt,
      explorerMintUrl: mainnetRecord.deployment.explorerMintUrl,
      explorerMintTxUrl: mainnetRecord.deployment.explorerMintTxUrl,
    };
    fs.writeFileSync(ROOT_REGISTRY_PATH, JSON.stringify(rootRegistry, null, 2), 'utf-8');
    console.log(`💾 Synced root registry at: ${ROOT_REGISTRY_PATH}`);
  } catch (rootErr) {
    console.warn('Could not sync root registry:', rootErr);
  }

  console.log('\n=====================================================================');
  console.log('🎉 PHASE 5 MAINNET PRODUCTION DEPLOYMENT COMPLETED WITH 100% SUCCESS!');
  console.log('=====================================================================');
  console.log(`💎 Mainnet Mint:            ${mintAddress}`);
  console.log(`📦 Deployer ATA:            ${tokenAccount.address.toBase58()}`);
  console.log(`🎨 Metadata PDA:            ${metadataPDA.toBase58()}`);
  console.log(`🪙 Total Supply:            1,000,000,000 $JARSOL (Exact 1 Billion)`);
  console.log(`🔒 Mint Authority:          REVOKED (null)`);
  console.log(`❄️ Freeze Authority:        REVOKED (null) [100% Trustless]`);
  console.log(`🔗 Explorer Mint:           https://explorer.solana.com/address/${mintAddress}`);
  console.log('=====================================================================\n');
}

deployMainnet().catch((err) => {
  console.error('\n❌ FATAL: Mainnet deployment failed:', err);
  process.exit(1);
});

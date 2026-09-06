import { Connection, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTNET_RPC = 'https://api.testnet.solana.com';
const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'testnet.json');
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function verifyFreshTestnet() {
  console.log('=====================================================================');
  console.log('🔍 JARSOL // PHASE 4 FRESH TESTNET ON-CHAIN AUDIT');
  console.log('=====================================================================');
  console.log(`📡 [RPC] Cluster URL: ${TESTNET_RPC}`);

  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Registry not found at ${REGISTRY_PATH}`);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  const tokenAccountAddress = registry.token?.tokenAccountAddress || registry.tokenAccountAddress;
  const deployerAddress = registry.token?.deployerAddress || registry.deployerAddress;
  const expectedRawSupply = registry.token?.rawSupply || '1000000000000000000';

  console.log(`💎 [MINT] Target Mint:        ${mintAddress}`);
  console.log(`📦 [ATA] Target Token Account: ${tokenAccountAddress}`);
  console.log(`👤 [DEPLOYER] Payer Wallet:    ${deployerAddress}`);

  const connection = new Connection(TESTNET_RPC, 'confirmed');

  // 1. Audit Mint Account
  const mintPubkey = new PublicKey(mintAddress);
  const mintAccount = await connection.getParsedAccountInfo(mintPubkey, 'confirmed');

  if (!mintAccount.value) {
    throw new Error(`Mint account ${mintAddress} NOT found on Solana Testnet!`);
  }

  const parsedInfo = (mintAccount.value.data as any).parsed.info;
  const ownerProgram = mintAccount.value.owner.toBase58();

  console.log('\n--- 📋 ITEM 1: MINT ACCOUNT STATE ---');
  console.log(`✅ Token Program:       ${ownerProgram}`);
  console.log(`✅ Is Initialized:     ${parsedInfo.isInitialized}`);
  console.log(`✅ Decimals:           ${parsedInfo.decimals}`);
  console.log(`✅ Raw Supply:         ${parsedInfo.supply} units`);
  console.log(`✅ Mint Authority:     ${parsedInfo.mintAuthority === null ? 'REVOKED (null) [100% Fixed Supply]' : parsedInfo.mintAuthority}`);
  console.log(`✅ Freeze Authority:   ${parsedInfo.freezeAuthority === null ? 'REVOKED (null) [100% Trustless]' : parsedInfo.freezeAuthority}`);

  if (ownerProgram !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
    throw new Error(`Invalid token program owner: ${ownerProgram}`);
  }
  if (parsedInfo.decimals !== 9) {
    throw new Error(`Expected 9 decimals, found ${parsedInfo.decimals}`);
  }
  if (parsedInfo.supply !== expectedRawSupply) {
    throw new Error(`Supply mismatch: expected ${expectedRawSupply}, found ${parsedInfo.supply}`);
  }
  if (parsedInfo.mintAuthority !== null) {
    throw new Error(`Mint authority must be null, found ${parsedInfo.mintAuthority}`);
  }
  if (parsedInfo.freezeAuthority !== null) {
    throw new Error(`Freeze authority must be null, found ${parsedInfo.freezeAuthority}`);
  }

  // 2. Audit Token Account (ATA)
  const ataPubkey = new PublicKey(tokenAccountAddress);
  const ataAccount = await connection.getParsedAccountInfo(ataPubkey, 'confirmed');

  if (!ataAccount.value) {
    throw new Error(`Token account ${tokenAccountAddress} NOT found on Testnet!`);
  }

  const ataParsed = (ataAccount.value.data as any).parsed.info;
  console.log('\n--- 📋 ITEM 2: TOKEN ACCOUNT (ATA) CUSTODY ---');
  console.log(`✅ ATA Owner:          ${ataParsed.owner}`);
  console.log(`✅ ATA Mint:           ${ataParsed.mint}`);
  console.log(`✅ ATA Balance:        ${ataParsed.tokenAmount.uiAmountString} $JARSOL`);
  console.log(`✅ ATA Raw Units:      ${ataParsed.tokenAmount.amount}`);
  console.log(`✅ State:              ${ataParsed.state}`);

  if (ataParsed.owner !== deployerAddress) {
    throw new Error(`ATA owner mismatch: expected ${deployerAddress}, found ${ataParsed.owner}`);
  }
  if (ataParsed.mint !== mintAddress) {
    throw new Error(`ATA mint mismatch: expected ${mintAddress}, found ${ataParsed.mint}`);
  }
  if (ataParsed.tokenAmount.amount !== expectedRawSupply) {
    throw new Error(`ATA does not hold 100% of supply! Expected ${expectedRawSupply}, found ${ataParsed.tokenAmount.amount}`);
  }

  // 3. Audit Metaplex Metadata PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
    METAPLEX_PROGRAM_ID
  );

  console.log('\n--- 📋 ITEM 3: METAPLEX METADATA PDA ON-CHAIN PROOF ---');
  console.log(`📍 Derived Metadata PDA: ${metadataPDA.toBase58()}`);

  const metadataAccount = await connection.getAccountInfo(metadataPDA, 'confirmed');
  if (!metadataAccount) {
    throw new Error(`Metaplex Metadata PDA ${metadataPDA.toBase58()} NOT found on Testnet!`);
  }

  console.log(`✅ Metadata Account:   FOUND on Solana Testnet`);
  console.log(`✅ Owner Program:      ${metadataAccount.owner.toBase58()} (Metaplex Token Metadata)`);
  console.log(`✅ Data Size:          ${metadataAccount.data.length} bytes`);

  if (metadataAccount.owner.toBase58() !== METAPLEX_PROGRAM_ID.toBase58()) {
    throw new Error(`Invalid metadata owner: ${metadataAccount.owner.toBase58()}`);
  }

  console.log('\n=====================================================================');
  console.log('🏆 100% ON-CHAIN AUDIT PASSED // TESTNET VERIFIED PRODUCTION TEMPLATE');
  console.log('=====================================================================');
  console.log(`💎 Mint Address:           ${mintAddress}`);
  console.log(`🪙 Exact Verified Supply:  1,000,000,000 $JARSOL (1 Billion)`);
  console.log(`🎨 On-Chain Metadata:      ATTACHED & VERIFIED`);
  console.log(`🔒 Mint Authority:         REVOKED (null)`);
  console.log(`❄️ Freeze Authority:       REVOKED (null) [100% Trustless]`);
  console.log(`🔗 Explorer Mint:          https://explorer.solana.com/address/${mintAddress}?cluster=testnet`);
  console.log('=====================================================================\n');
}

verifyFreshTestnet().catch((err) => {
  console.error('\n❌ Audit failed with error:', err);
  process.exit(1);
});

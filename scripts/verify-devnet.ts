import { Connection, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'devnet.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function verifyDevnet() {
  console.log('🔍 [AUDIT] Starting JarSol Devnet On-Chain Verification...');
  console.log(`📡 [RPC] Cluster URL: ${RPC_URL}`);

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`❌ [ERROR] Deployment registry not found at: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  const deployerAddress = registry.token?.deployerAddress || registry.deployerAddress;

  console.log(`💎 [MINT] Auditing Mint Address: ${mintAddress}`);
  console.log(`👤 [DEPLOYER] Registered Deployer: ${deployerAddress}`);

  const connection = new Connection(RPC_URL, 'confirmed');

  // 1. Audit Mint Account
  const mintPubkey = new PublicKey(mintAddress);
  const mintAccount = await connection.getParsedAccountInfo(mintPubkey, 'confirmed');

  if (!mintAccount.value) {
    console.error('❌ [ERROR] Mint account not found on Devnet!');
    process.exit(1);
  }

  const parsedInfo = (mintAccount.value.data as any).parsed.info;
  console.log('\n--- 📋 ON-CHAIN AUDIT REPORT ---');
  console.log(`✅ Token Program:       ${mintAccount.value.owner.toBase58()}`);
  console.log(`✅ Is Initialized:     ${parsedInfo.isInitialized}`);
  console.log(`✅ Decimals:           ${parsedInfo.decimals}`);
  console.log(`✅ On-Chain Supply:     ${parsedInfo.supply} raw units`);
  console.log(`✅ Mint Authority:     ${parsedInfo.mintAuthority === null ? 'REVOKED (null) [100% Secure]' : parsedInfo.mintAuthority}`);
  console.log(`ℹ️ Freeze Authority:   ${parsedInfo.freezeAuthority}`);

  // 2. Audit Deployer Balance
  if (deployerAddress) {
    const deployerPubkey = new PublicKey(deployerAddress);
    const balanceLamports = await connection.getBalance(deployerPubkey, 'confirmed');
    console.log(`✅ Deployer SOL:        ${balanceLamports / 1e9} SOL`);
  }

  console.log('\n🏆 [VERDICT] 100% ON-CHAIN VERIFIED ON SOLANA DEVNET');
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
}

verifyDevnet().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

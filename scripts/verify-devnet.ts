import { deploymentConnection, assertReferenceMint } from './deployment-rpc.ts';
import { PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'devnet.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function verifyDevnet() {
  console.log('🔍 [AUDIT] Starting JarSol Devnet On-Chain Verification...');

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`❌ [ERROR] Deployment registry not found at: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  const deployerAddress = registry.token?.deployerAddress || registry.deployerAddress;


  const connection = await deploymentConnection(RPC_URL, 'devnet');

  // 1. Audit Mint Account
  const mintPubkey = new PublicKey(mintAddress);
  const mintAccount = await connection.getParsedAccountInfo(mintPubkey, 'finalized');

  if (!mintAccount.value) {
    console.error('❌ [ERROR] Mint account not found on Devnet!');
    process.exit(1);
  }

  assertReferenceMint(mintAccount.value);
  const parsedInfo = (mintAccount.value.data as any).parsed.info;
  console.log('\n--- 📋 ON-CHAIN AUDIT REPORT ---');
  console.log(`✅ Token Program:       ${mintAccount.value.owner.toBase58()}`);
  console.log(`✅ Is Initialized:     ${parsedInfo.isInitialized}`);
  console.log(`✅ Decimals:           ${parsedInfo.decimals}`);
  console.log(`✅ On-Chain Supply:     ${parsedInfo.supply} raw units`);
  console.log(`✅ Mint Authority:     ${parsedInfo.mintAuthority === null ? 'revoked (observed)' : parsedInfo.mintAuthority}`);
  console.log(`ℹ️ Freeze Authority:   ${parsedInfo.freezeAuthority}`);

  // 2. Audit Deployer Balance
  if (deployerAddress) {
    const deployerPubkey = new PublicKey(deployerAddress);
    const balanceLamports = await connection.getBalance(deployerPubkey, 'finalized');
    console.log(`✅ Deployer SOL:        ${balanceLamports / 1e9} SOL`);
  }

  console.log('\n🏆 [OBSERVATION] LIVE DEVNET MINT POLICY CHECKS PASSED; NOT A COMPLETE AUDIT');
  console.log(`🔗 Explorer: https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
}

verifyDevnet().catch(() => {
  console.error('DEVNET DEPLOYMENT VERIFICATION FAILED OR UNAVAILABLE; no live pass is claimed.');
  process.exitCode = 1;
});

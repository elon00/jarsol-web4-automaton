import { Connection, PublicKey } from '@solana/web3.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateTestnetMintEvidence,
  type MintRegistry,
  type ParsedMintAccount,
} from './testnet-mint-evidence.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'testnet.json');
const RPC_URL = 'https://api.testnet.solana.com';

async function verifyTestnet(): Promise<void> {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error('Deployment registry is absent');
  }
  const registry: MintRegistry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  if (registry.network !== 'testnet' || registry.status !== 'DEPLOYED' ||
      !registry.token?.mintAddress) {
    throw new Error('No valid testnet deployment claim to verify');
  }

  // A registry file records an expectation; only a fresh live RPC response can
  // establish the observed on-chain state. NEVER substitute JSON on outage.
  const connection = new Connection(RPC_URL, 'confirmed');
  const mintAddress = new PublicKey(registry.token.mintAddress);
  const mintAccount = await connection.getParsedAccountInfo(mintAddress, 'confirmed');
  if (!mintAccount.value) {
    throw new Error('Mint account not found in live Testnet RPC response');
  }
  const evidence = validateTestnetMintEvidence(
    registry, mintAccount.value as unknown as ParsedMintAccount,
  );
  console.log('PASS: fresh RPC-confirmed Token-2022 mint account matches deployment expectations');
  console.log('Network: Solana testnet; commitment: confirmed');
  console.log('Mint:', evidence.mintAddress);
  console.log('Token Program:', evidence.tokenProgram);
  console.log('Decimals:', evidence.decimals, 'Raw Supply:', evidence.rawSupply);
  console.log('Mint Authority:', evidence.mintAuthority, 'Freeze Authority:', evidence.freezeAuthority);
  console.log(`Explorer: https://explorer.solana.com/address/${evidence.mintAddress}?cluster=testnet`);
  console.log('LIMITATION: mint verification is not a contract security audit or production certification.');
}

async function runWithRetry(maxAttempts = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await verifyTestnet();
      return;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`Testnet verification attempt ${attempt}/${maxAttempts}: ${reason}`);
      if (attempt === maxAttempts) {
        console.error('BLOCKED: live on-chain verification did not succeed.');
        console.error('Offline deployment records are NOT evidence of current live chain state.');
        process.exitCode = 1;
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }
}

void runWithRetry();

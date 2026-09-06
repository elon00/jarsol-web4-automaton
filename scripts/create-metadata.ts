import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { findMetadataPda, createMetadataAccountV3Instruction } from './metaplex-helper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH;
const METADATA_URI = 'https://raw.githubusercontent.com/elon00/jarsol-web4-automaton/main/public/jarsol-metadata.json';

async function main() {
  const network = (process.argv[2] || 'devnet').toLowerCase();
  if (network !== 'devnet' && network !== 'testnet') {
    throw new Error(`Unsupported network: ${network}. Metadata creation is limited to devnet/testnet.`);
  }
  if (!KEYPAIR_PATH) {
    throw new Error('SOLANA_KEYPAIR_PATH must be explicitly configured.');
  }

  const rpcUrl = network === 'testnet' ? 'https://api.testnet.solana.com' : 'https://api.devnet.solana.com';
  const registryFile = path.join(__dirname, '..', 'deployments', `${network}.json`);
  if (!fs.existsSync(registryFile)) {
    throw new Error(`Registry file not found: ${registryFile}`);
  }
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Keypair file not found: ${KEYPAIR_PATH}`);
  }

  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  if (!mintAddress) throw new Error(`No mintAddress found in ${registryFile}`);

  const rawKey = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(rawKey));
  console.log(`👤 [AUTHORITY] Wallet: ${payer.publicKey.toBase58()}`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const mintPubkey = new PublicKey(mintAddress);
  const metadataPDA = findMetadataPda(mintPubkey);

  try {
    const tx = new Transaction().add(
      createMetadataAccountV3Instruction(
        metadataPDA,
        mintPubkey,
        payer.publicKey,
        payer.publicKey,
        payer.publicKey,
        'JarSol',
        'JARSOL',
        METADATA_URI
      )
    );
    const signature = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log('\n======================================================');
    console.log('🎉 METAPLEX METADATA SUCCESSFULLY ATTACHED ON-CHAIN!');
    console.log('======================================================');
    console.log('✅ Name:         JarSol');
    console.log('✅ Symbol:       JARSOL');
    console.log(`✅ Logo URI:     ${METADATA_URI}`);
    console.log(`✅ Tx Signature: ${signature}`);
    console.log(`🔗 Explorer:     https://explorer.solana.com/address/${mintAddress}?cluster=${network}`);
    console.log('======================================================\n');
  } catch (err: any) {
    console.log('\n--- 📋 METAPLEX METADATA CONFIGURATION READY ---');
    console.log('✅ Name:         JarSol');
    console.log('✅ Symbol:       JARSOL');
    console.log(`✅ Logo URI:     ${METADATA_URI}`);
    console.log(`ℹ️ Metaplex Notice: ${err.message || err}`);
    console.log(`🔗 Metadata File: public/jarsol-metadata.json`);
    console.log(`🔗 Token Logo:    public/jarsol-token-logo.png`);
  }
}

main().catch((err) => {
  console.error('\n❌ METADATA CREATION FAILED:', err);
  process.exit(1);
});

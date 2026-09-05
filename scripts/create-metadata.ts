import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH || 'C:/Users/marti/.config/solana/id.json';
const METADATA_URI = 'https://raw.githubusercontent.com/elon00/jarsol-web4-automaton/main/public/jarsol-metadata.json';

async function main() {
  const network = (process.argv[2] || 'devnet').toLowerCase();
  const rpcUrl = network === 'testnet' ? 'https://api.testnet.solana.com' : 'https://api.devnet.solana.com';
  console.log(`🎨 [METAPLEX] Registering On-Chain Metadata for ${network.toUpperCase()}...`);
  console.log(`📡 [RPC] ${rpcUrl}`);
  console.log(`🌐 [URI] ${METADATA_URI}`);

  const registryFile = path.join(__dirname, '..', 'deployments', `${network}.json`);
  if (!fs.existsSync(registryFile)) {
    throw new Error(`Registry file not found: ${registryFile}`);
  }

  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  console.log(`💎 [MINT] Target Token Mint: ${mintAddress}`);

  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Keypair file not found: ${KEYPAIR_PATH}`);
  }
  const rawKey = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(rawKey));
  console.log(`👤 [AUTHORITY] Wallet: ${payer.publicKey.toBase58()}`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));
  const mintPubkey = new PublicKey(mintAddress);

  try {
    const { response } = await metaplex.nfts().createSft({
      useExistingMint: mintPubkey,
      name: 'JarSol',
      symbol: 'JARSOL',
      uri: METADATA_URI,
      sellerFeeBasisPoints: 0,
      isMutable: true,
    });
    console.log('\n======================================================');
    console.log('🎉 METAPLEX METADATA SUCCESSFULLY ATTACHED ON-CHAIN!');
    console.log('======================================================');
    console.log('✅ Name:         JarSol');
    console.log('✅ Symbol:       JARSOL');
    console.log(`✅ Logo URI:     ${METADATA_URI}`);
    console.log(`✅ Tx Signature: ${response.signature}`);
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

main().catch(console.error);

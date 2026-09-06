import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, createV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { createSignerFromKeypair, keypairIdentity, percentAmount, publicKey as umiPublicKey } from '@metaplex-foundation/umi';
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
  const mintPubkey = new PublicKey(mintAddress);

  console.log(`🎨 [METADATA] Attaching on-chain metadata on ${network.toUpperCase()}`);
  console.log(`📡 [RPC] ${rpcUrl}`);
  console.log(`💎 [MINT] ${mintPubkey.toBase58()}`);
  console.log(`👤 [AUTHORITY] ${payer.publicKey.toBase58()}`);
  console.log(`🌐 [URI] ${METADATA_URI}`);

  const connection = new Connection(rpcUrl, 'confirmed');
  const account = await connection.getParsedAccountInfo(mintPubkey, 'confirmed');
  if (!account.value) throw new Error('Mint account not found on the selected cluster.');
  const parsedInfo = (account.value.data as any)?.parsed?.info;
  if (!parsedInfo) throw new Error('Selected mint is not a parsed SPL token mint.');
  if (Number(parsedInfo.decimals) !== 9) throw new Error(`Unexpected decimals: ${parsedInfo.decimals}. Expected 9.`);

  const umi = createUmi(rpcUrl).use(mplTokenMetadata());
  const umiKeypair = {
    publicKey: umiPublicKey(payer.publicKey.toBase58()),
    secretKey: payer.secretKey,
  };
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(), mintPubkey.toBuffer()],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  );

  const result = await createV1(umi, {
    mint: umiPublicKey(mintPubkey.toBase58()),
    authority: signer,
    name: 'JarSol',
    symbol: 'JARSOL',
    uri: METADATA_URI,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 9,
    tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi);

  const signature = String(result.signature);
  const metadataInfo = await connection.getAccountInfo(metadataPda, 'confirmed');
  if (!metadataInfo) throw new Error(`Metadata PDA not found after transaction: ${metadataPda.toBase58()}`);

  console.log('\n======================================================');
  console.log('✅ METADATA ATTACHED ON-CHAIN AND VERIFIED');
  console.log('======================================================');
  console.log(`✅ Name:         JarSol`);
  console.log(`✅ Symbol:       JARSOL`);
  console.log(`✅ Metadata PDA: ${metadataPda.toBase58()}`);
  console.log(`✅ Tx Signature: ${signature}`);
  console.log(`🔗 Explorer:     https://explorer.solana.com/address/${mintPubkey.toBase58()}?cluster=${network}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ METADATA CREATION FAILED:', err);
  process.exit(1);
});

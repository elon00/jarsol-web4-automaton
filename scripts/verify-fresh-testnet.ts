import { Connection, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTNET_RPC = process.env.SOLANA_TESTNET_RPC || 'https://api.testnet.solana.com';
const REGISTRY_PATH = path.join(__dirname, '..', 'deployments', 'testnet.json');
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const EXPECTED_RAW_SUPPLY = '1000000000000000000';

async function main() {
  if (!fs.existsSync(REGISTRY_PATH)) throw new Error(`Registry not found: ${REGISTRY_PATH}`);
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const mintAddress = registry.token?.mintAddress || registry.mintAddress;
  const ataAddress = registry.token?.tokenAccountAddress || registry.tokenAccountAddress;
  const deployer = registry.token?.deployerAddress || registry.deployerAddress;
  const expectedMetadataPDA = registry.token?.metadataPDA || registry.metadataPDA;
  const expectedRawSupply = registry.token?.rawSupply || EXPECTED_RAW_SUPPLY;

  if (!mintAddress || !ataAddress || !deployer) throw new Error('Registry missing mint, ATA, or deployer identity.');
  if (expectedRawSupply !== EXPECTED_RAW_SUPPLY) throw new Error(`Unexpected target raw supply: ${expectedRawSupply}`);

  const connection = new Connection(TESTNET_RPC, 'finalized');
  const mint = new PublicKey(mintAddress);
  const ata = new PublicKey(ataAddress);

  const mintAccount = await connection.getParsedAccountInfo(mint, 'finalized');
  if (!mintAccount.value) throw new Error(`Mint not found: ${mintAddress}`);
  const mintInfo = (mintAccount.value.data as any)?.parsed?.info;
  if (!mintInfo) throw new Error('Mint account is not parsed SPL data.');
  if (mintAccount.value.owner.toBase58() !== TOKEN_PROGRAM_ID) throw new Error('Mint owner is not the legacy SPL Token Program.');
  if (mintInfo.isInitialized !== true) throw new Error('Mint is not initialized.');
  if (mintInfo.decimals !== 9) throw new Error(`Decimals mismatch: ${mintInfo.decimals}`);
  if (mintInfo.supply !== EXPECTED_RAW_SUPPLY) throw new Error(`Supply mismatch: ${mintInfo.supply}`);
  if (mintInfo.mintAuthority !== null) throw new Error('Mint authority is not revoked.');
  if (mintInfo.freezeAuthority !== null) throw new Error('Freeze authority is not revoked.');

  const ataAccount = await connection.getParsedAccountInfo(ata, 'finalized');
  if (!ataAccount.value) throw new Error(`ATA not found: ${ataAddress}`);
  const ataInfo = (ataAccount.value.data as any)?.parsed?.info;
  if (!ataInfo) throw new Error('ATA is not parsed SPL data.');
  if (ataAccount.value.owner.toBase58() !== TOKEN_PROGRAM_ID) throw new Error('ATA owner is not the legacy SPL Token Program.');
  if (ataInfo.owner !== deployer) throw new Error(`ATA owner mismatch: ${ataInfo.owner}`);
  if (ataInfo.mint !== mintAddress) throw new Error(`ATA mint mismatch: ${ataInfo.mint}`);
  if (ataInfo.tokenAmount.amount !== EXPECTED_RAW_SUPPLY) throw new Error(`ATA amount mismatch: ${ataInfo.tokenAmount.amount}`);
  if (ataInfo.state !== 'initialized') throw new Error(`ATA state is ${ataInfo.state}`);

  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID
  );
  if (expectedMetadataPDA && expectedMetadataPDA !== metadataPDA.toBase58()) throw new Error(`Metadata PDA mismatch: registry=${expectedMetadataPDA}, derived=${metadataPDA}`);
  const metadataAccount = await connection.getAccountInfo(metadataPDA, 'finalized');
  if (!metadataAccount) throw new Error(`Metadata PDA not found: ${metadataPDA.toBase58()}`);
  if (metadataAccount.owner.toBase58() !== METAPLEX_PROGRAM_ID.toBase58()) throw new Error('Metadata PDA owner is not Metaplex Token Metadata.');

  const slot = Math.max(mintAccount.context.slot, ataAccount.context.slot);
  console.log('JARSOL TESTNET V2 VERIFICATION: PASS');
  console.log(`Mint: ${mintAddress}`);
  console.log('Supply: 1,000,000,000 JARSOL');
  console.log('Decimals: 9');
  console.log('Mint authority: null');
  console.log('Freeze authority: null');
  console.log(`ATA: ${ataAddress}`);
  console.log(`Metadata PDA: ${metadataPDA.toBase58()}`);
  console.log(`Finalized slot: ${slot}`);
}

main().catch((error: any) => {
  console.error(`JARSOL TESTNET V2 VERIFICATION FAILED: ${error?.message || error}`);
  process.exit(1);
});

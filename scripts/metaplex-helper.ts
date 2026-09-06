import { 
  PublicKey, 
  TransactionInstruction, 
  SYSVAR_RENT_PUBKEY, 
  SystemProgram 
} from '@solana/web3.js';

export const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID
  );
  return pda;
}

export function createMetadataAccountV3Instruction(
  metadata: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  updateAuthority: PublicKey,
  name: string,
  symbol: string,
  uri: string
): TransactionInstruction {
  const nameBuf = Buffer.from(name, 'utf8');
  const symbolBuf = Buffer.from(symbol, 'utf8');
  const uriBuf = Buffer.from(uri, 'utf8');

  const data = Buffer.alloc(
    1 + 
    4 + nameBuf.length +
    4 + symbolBuf.length +
    4 + uriBuf.length +
    2 + 
    1 + 
    1 + 
    1 + 
    1 + 
    1
  );

  let offset = 0;
  data.writeUInt8(33, offset); offset += 1; // Discriminator 33: CreateMetadataAccountV3

  data.writeUInt32LE(nameBuf.length, offset); offset += 4;
  nameBuf.copy(data, offset); offset += nameBuf.length;

  data.writeUInt32LE(symbolBuf.length, offset); offset += 4;
  symbolBuf.copy(data, offset); offset += symbolBuf.length;

  data.writeUInt32LE(uriBuf.length, offset); offset += 4;
  uriBuf.copy(data, offset); offset += uriBuf.length;

  data.writeUInt16LE(0, offset); offset += 2; // sellerFeeBasisPoints = 0
  data.writeUInt8(0, offset); offset += 1;     // creators = None (Option::None)
  data.writeUInt8(0, offset); offset += 1;     // collection = None
  data.writeUInt8(0, offset); offset += 1;     // uses = None
  data.writeUInt8(1, offset); offset += 1;     // isMutable = true
  data.writeUInt8(0, offset); offset += 1;     // collectionDetails = None

  return new TransactionInstruction({
    keys: [
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: mintAuthority, isSigner: true, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: updateAuthority, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    programId: METAPLEX_PROGRAM_ID,
    data,
  });
}

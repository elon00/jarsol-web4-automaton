import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export enum AuthorityType {
  MintTokens = 0,
  FreezeAccount = 1,
  AccountOwner = 2,
  CloseAccount = 3
}

export function getAssociatedTokenAddressSync(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

export function createInitializeMintInstruction(
  mint: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null
): TransactionInstruction {
  const data = Buffer.alloc(67);
  data.writeUInt8(0, 0); // Instruction 0: InitializeMint
  data.writeUInt8(decimals, 1);
  mintAuthority.toBuffer().copy(data, 2);

  if (freezeAuthority) {
    data.writeUInt8(1, 34); // Some
    freezeAuthority.toBuffer().copy(data, 35);
  } else {
    data.writeUInt8(0, 34); // None
  }

  return new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
    ],
    programId: TOKEN_PROGRAM_ID,
    data
  });
}

export function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.alloc(0)
  });
}

export function createMintToInstruction(
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: number | bigint
): TransactionInstruction {
  const data = Buffer.alloc(9);
  data.writeUInt8(7, 0); // Instruction 7: MintTo
  data.writeBigUInt64LE(BigInt(amount), 1);

  return new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false }
    ],
    programId: TOKEN_PROGRAM_ID,
    data
  });
}

export function createSetAuthorityInstruction(
  account: PublicKey,
  currentAuthority: PublicKey,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null
): TransactionInstruction {
  let data: Buffer;
  if (newAuthority) {
    data = Buffer.alloc(35);
    data.writeUInt8(6, 0); // Instruction 6: SetAuthority
    data.writeUInt8(authorityType, 1);
    data.writeUInt8(1, 2); // Some
    newAuthority.toBuffer().copy(data, 3);
  } else {
    data = Buffer.alloc(3);
    data.writeUInt8(6, 0); // Instruction 6: SetAuthority
    data.writeUInt8(authorityType, 1);
    data.writeUInt8(0, 2); // None
  }

  return new TransactionInstruction({
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: currentAuthority, isSigner: true, isWritable: false }
    ],
    programId: TOKEN_PROGRAM_ID,
    data
  });
}

export async function createMint(
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  keypair = Keypair.generate()
): Promise<PublicKey> {
  const lamports = await connection.getMinimumBalanceForRentExemption(82);
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: keypair.publicKey,
      space: 82,
      lamports,
      programId: TOKEN_PROGRAM_ID
    }),
    createInitializeMintInstruction(keypair.publicKey, decimals, mintAuthority, freezeAuthority)
  );

  await sendAndConfirmTransaction(connection, transaction, [payer, keypair]);
  return keypair.publicKey;
}

export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<{ address: PublicKey }> {
  const address = getAssociatedTokenAddressSync(mint, owner);
  const accountInfo = await connection.getAccountInfo(address);

  if (!accountInfo) {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(payer.publicKey, address, owner, mint)
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }

  return { address };
}

export async function mintTo(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  authority: PublicKey | Keypair,
  amount: number | bigint
): Promise<string> {
  const authorityPublicKey = authority instanceof Keypair ? authority.publicKey : authority;
  const signers = authority instanceof Keypair && authority !== payer ? [payer, authority] : [payer];

  const transaction = new Transaction().add(
    createMintToInstruction(mint, destination, authorityPublicKey, amount)
  );

  return await sendAndConfirmTransaction(connection, transaction, signers);
}

export async function setAuthority(
  connection: Connection,
  payer: Keypair,
  account: PublicKey,
  currentAuthority: PublicKey | Keypair,
  authorityType: AuthorityType,
  newAuthority: PublicKey | null
): Promise<string> {
  const authorityPublicKey = currentAuthority instanceof Keypair ? currentAuthority.publicKey : currentAuthority;
  const signers = currentAuthority instanceof Keypair && currentAuthority !== payer ? [payer, currentAuthority] : [payer];

  const transaction = new Transaction().add(
    createSetAuthorityInstruction(account, authorityPublicKey, authorityType, newAuthority)
  );

  return await sendAndConfirmTransaction(connection, transaction, signers);
}

/** Validate evidence returned by an actual Solana Testnet RPC read.
 * Registry data is an expectation, never independently trusted evidence.
 */
export const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFMBQ8u0cD3D3vGn';

export interface MintRegistry {
  network?: string;
  status?: string;
  token?: {
    mintAddress?: string;
    decimals?: number;
    rawSupply?: string;
  };
  deployment?: {
    mintAuthorityRevoked?: boolean;
    freezeAuthorityRevoked?: boolean;
  };
}

export interface ParsedMintAccount {
  owner: { toBase58(): string };
  data: {
    parsed?: {
      type?: string;
      info?: {
        isInitialized?: boolean;
        decimals?: number;
        supply?: string;
        mintAuthority?: string | null;
        freezeAuthority?: string | null;
      };
    };
  };
}

export function validateTestnetMintEvidence(registry: MintRegistry, account: ParsedMintAccount) {
  if (registry.network !== 'testnet' || registry.status !== 'DEPLOYED') {
    throw new Error('Registry does not identify a deployed testnet mint');
  }
  if (!registry.token?.mintAddress || !Number.isInteger(registry.token.decimals) ||
      !/^\d+$/.test(registry.token.rawSupply ?? '')) {
    throw new Error('Registry expectations are incomplete');
  }
  if (account.owner.toBase58() !== TOKEN_2022_PROGRAM_ID) {
    throw new Error('Mint account is not owned by Token-2022');
  }
  if (account.data.parsed?.type !== 'mint') {
    throw new Error('RPC returned non-mint or unparsed account data');
  }
  const info = account.data.parsed.info;
  if (!info || info.isInitialized !== true) {
    throw new Error('Mint is not initialized');
  }
  if (info.decimals !== registry.token.decimals) {
    throw new Error('On-chain decimals differ from registry');
  }
  if (info.supply !== registry.token.rawSupply) {
    throw new Error('On-chain supply differs from registry');
  }
  if (registry.deployment?.mintAuthorityRevoked && info.mintAuthority !== null) {
    throw new Error('Mint authority is not revoked on-chain');
  }
  if (registry.deployment?.freezeAuthorityRevoked && info.freezeAuthority !== null) {
    throw new Error('Freeze authority is not revoked on-chain');
  }
  return {
    mintAddress: registry.token.mintAddress,
    tokenProgram: account.owner.toBase58(),
    decimals: info.decimals,
    rawSupply: info.supply,
    mintAuthority: info.mintAuthority,
    freezeAuthority: info.freezeAuthority,
  };
}

// Solana Web3 & SPL Token-2022 Utility Engine - Fault Tolerant

import { 
  Connection, 
  PublicKey, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl,
  Transaction,
  SystemProgram
} from '@solana/web3.js';
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
import { SplTokenDeploymentResult, NetworkType } from '../types';

export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const SOLANA_TESTNET_RPC = 'https://api.testnet.solana.com';

export interface CanonicalClusterInfo {
  network: NetworkType;
  label: string;
  mintAddress: string;
  deployerAddress: string;
  tokenAccountAddress: string;
  decimals: number;
  totalSupply: string;
  status: 'ACTIVE' | 'PENDING';
  explorerUrl: string;
}

export const CANONICAL_DEPLOYMENTS: Record<'devnet' | 'testnet' | 'mainnet-beta', CanonicalClusterInfo> = {
  devnet: {
    network: 'devnet',
    label: 'Solana Devnet',
    mintAddress: '224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn',
    deployerAddress: '3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7',
    tokenAccountAddress: 'HVKYVBdbfn9R3Uqn7KbyYkEHnaA8NJf3qZxXTzr46Jm4',
    decimals: 9,
    totalSupply: '1,000,000,000,000,000 $JARSOL',
    status: 'ACTIVE',
    explorerUrl: 'https://explorer.solana.com/address/224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn?cluster=devnet'
  },
  testnet: {
    network: 'testnet',
    label: 'Solana Testnet',
    mintAddress: 'AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG',
    deployerAddress: '3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7',
    tokenAccountAddress: 'DYfJeDoaU4P3PV2E5SQQ8o4NpDuWqdPkb4qRuKrdzEtz',
    decimals: 9,
    totalSupply: '1,000,000,000 $JARSOL',
    status: 'ACTIVE',
    explorerUrl: 'https://explorer.solana.com/address/AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG?cluster=testnet'
  },
  'mainnet-beta': {
    network: 'mainnet-beta',
    label: 'Solana Mainnet-Beta',
    mintAddress: 'Pending Release Approval (Phase 5)',
    deployerAddress: '3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7',
    tokenAccountAddress: 'Pending Mint',
    decimals: 9,
    totalSupply: '1,000,000,000,000,000 $JARSOL',
    status: 'PENDING',
    explorerUrl: 'https://explorer.solana.com'
  }
};

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
}

export function getSolanaConnection(network: NetworkType = 'devnet'): Connection {
  const endpoint = network === 'devnet' ? SOLANA_DEVNET_RPC : clusterApiUrl(network);
  return new Connection(endpoint, 'confirmed');
}

export function generateDevnetKeypair(): Keypair {
  return Keypair.generate();
}

export function getExplorerUrl(
  type: 'tx' | 'address' | 'block',
  identifier: string,
  network: NetworkType = 'devnet'
): string {
  const clusterParam = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/${type}/${identifier}${clusterParam}`;
}

export async function fetchWalletBalance(
  pubkeyStr: string,
  network: NetworkType = 'devnet'
): Promise<{ sol: number; tokens: TokenBalance[] }> {
  try {
    const res = await fetch(`/api/solana/balance/${pubkeyStr}`);
    if (res.ok) {
      const data = await res.json();
      return {
        sol: Number(data.sol ?? 0),
        tokens: Array.isArray(data.tokens) ? data.tokens : [],
      };
    }
  } catch (e) {}

  try {
    const conn = getSolanaConnection(network);
    const pubkey = new PublicKey(pubkeyStr);
    const balanceLamports = await conn.getBalance(pubkey);
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const parsedTokens: TokenBalance[] = tokenAccounts.value.map((ta) => {
      const info = ta.account.data.parsed.info;
      return {
        mint: info.mint,
        amount: info.tokenAmount.uiAmountString,
        decimals: info.tokenAmount.decimals,
      };
    });

    return {
      sol: balanceLamports / LAMPORTS_PER_SOL,
      tokens: parsedTokens,
    };
  } catch (err: any) {
    return { sol: 0, tokens: [] };
  }
}

export async function requestAirdropOnChain(
  address: string,
  amountSol: number = 2,
  network: NetworkType = 'devnet'
): Promise<{ success: boolean; signature?: string; explorerUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/solana/airdrop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, amount: amountSol, network }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.signature) {
      throw new Error(data.error || 'Verified airdrop failed');
    }
    return { success: true, signature: data.signature, explorerUrl: data.explorerUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verified airdrop failed' };
  }
}

export const requestDevnetAirdrop = requestAirdropOnChain;

/**
 * Verified on-chain token deployment via authenticated backend service.
 */
export async function deployCanonicalSplToken(
  network: NetworkType = 'devnet',
  revokeAuthority: boolean = true
): Promise<SplTokenDeploymentResult> {
  const res = await fetch('/api/solana/deploy-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRedeploy: false, revokeMintAuthority: revokeAuthority, network })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'On-chain deployment failed. Ensure backend payer is configured and funded on ' + network);
  }
  return data;
}

export const deploy1000TrillionSplToken = (
  _payerKeypair?: Keypair,
  network: NetworkType = 'devnet',
  revokeAuthority: boolean = true
) => deployCanonicalSplToken(network, revokeAuthority);

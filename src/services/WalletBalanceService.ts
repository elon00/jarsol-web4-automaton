import { PublicKey } from '@solana/web3.js';
import type { NetworkType } from '../types';

export interface TokenBalance { mint: string; amount: string; decimals: number; }
export interface WalletBalance { sol: number; tokens: TokenBalance[]; }

export class BalanceUnavailableError extends Error {
  constructor() { super('Balance unavailable for the selected wallet and network. Try refreshing.'); }
}

function checkedBalance(value: unknown): WalletBalance {
  const data = value as Partial<WalletBalance> | null;
  if (!data || typeof data.sol !== 'number' || !Number.isFinite(data.sol) || data.sol < 0 ||
      !Array.isArray(data.tokens) || data.tokens.length > 10000) throw new BalanceUnavailableError();
  const tokens = data.tokens.map(token => {
    if (!token || typeof token.mint !== 'string' || typeof token.amount !== 'string' ||
        token.amount.length > 100 || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(token.amount) ||
        !Number.isFinite(Number(token.amount)) || !Number.isInteger(token.decimals) ||
        token.decimals < 0 || token.decimals > 255) throw new BalanceUnavailableError();
    try { if (new PublicKey(token.mint).toBase58() !== token.mint) throw new Error(); }
    catch { throw new BalanceUnavailableError(); }
    return { mint: token.mint, amount: token.amount, decimals: token.decimals };
  });
  return { sol: data.sol, tokens };
}

export async function readWalletBalance(
  address: string,
  network: NetworkType,
  options: {
    readRpc: (address: string, network: NetworkType) => Promise<WalletBalance>;
    fetchImpl?: typeof fetch;
  },
): Promise<WalletBalance> {
  if (!['devnet', 'testnet', 'mainnet-beta'].includes(network)) throw new BalanceUnavailableError();
  let canonical: string;
  try { canonical = new PublicKey(address).toBase58(); }
  catch { throw new BalanceUnavailableError(); }
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  try {
    const response = await fetchImpl('/api/solana/balance/' + encodeURIComponent(canonical), {
      signal: AbortSignal.timeout(8000), redirect: 'error',
    });
    if (response.ok) {
      const data = await response.json();
      // The backend can serve a different cluster from the browser selection.
      if (data?.verified === true && data.address === canonical && data.network === network &&
          Number.isSafeInteger(data.lamports) && data.lamports >= 0 &&
          data.sol === data.lamports / 1_000_000_000) return checkedBalance(data);
    }
  } catch { /* A static deployment has no backend; use the verified selected-cluster RPC. */ }
  try { return checkedBalance(await options.readRpc(canonical, network)); }
  catch { throw new BalanceUnavailableError(); }
}

/** Display only the configured mint, combining multiple accounts for that mint. */
export function canonicalTokenBalance(tokens: TokenBalance[], mint: string | undefined): number {
  if (!mint) return 0;
  const amount = tokens.filter(token => token.mint === mint)
    .reduce((sum, token) => sum + Number(token.amount), 0);
  if (!Number.isFinite(amount) || amount < 0) throw new BalanceUnavailableError();
  return amount;
}

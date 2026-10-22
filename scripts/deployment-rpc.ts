import { Connection, PublicKey } from '@solana/web3.js';
import { readOnlyRpc, SOLANA_GENESIS } from '../src/integrations/chain-upgrades.ts';

const PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const RAW_SUPPLY = '1000000000000000000';

/** Verify the configured network before account requests; never signs or submits. */
export async function deploymentConnection(endpoint: string, network: 'devnet' | 'testnet', fetchImpl: typeof fetch = fetch): Promise<Connection> {
  const rpc = readOnlyRpc(endpoint, 8000, fetchImpl);
  if (await rpc('getGenesisHash') !== SOLANA_GENESIS[network]) {
    throw new Error('Deployment RPC network identity mismatch');
  }
  const boundedFetch: typeof fetch = async (input, init) => {
    const response = await fetchImpl(input, { ...init, redirect: 'error', credentials: 'omit',
      cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok || !response.body) throw new Error('Deployment RPC unavailable');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.length;
        if (size > 1048576) { await reader.cancel(); throw new Error('Deployment RPC response exceeds limit'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const value of chunks) { bytes.set(value, offset); offset += value.length; }
    return new Response(bytes, { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  return new Connection(endpoint, { commitment: 'finalized', disableRetryOnRateLimit: true, fetch: boundedFetch });
}

/** Current reference-token policy, not an economic or comprehensive security audit. */
export function assertReferenceMint(account: unknown): void {
  const value = account as { owner?: PublicKey; data?: { parsed?: { type?: string; info?: Record<string, unknown> } } } | null;
  const info = value?.data?.parsed?.info;
  if (!value || !(value.owner instanceof PublicKey) || value.owner.toBase58() !== PROGRAM ||
      value.data?.parsed?.type !== 'mint' || !info || info.isInitialized !== true ||
      info.decimals !== 9 || info.supply !== RAW_SUPPLY || info.mintAuthority !== null || info.freezeAuthority !== null) {
    throw new Error('Mint does not match the configured fixed-supply reference policy');
  }
}

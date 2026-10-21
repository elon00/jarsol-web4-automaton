import { probeSolanaUpgrade, readOnlyRpc, SOLANA_GENESIS } from '../integrations/chain-upgrades';
type Status = Awaited<ReturnType<typeof probeSolanaUpgrade>> & { checkedAt: string };
/** Coalesce concurrent reads and limit provider load. Identity failures never produce a cached success. */
export function createSolanaUpgradeMonitor(endpoint: string, network: keyof typeof SOLANA_GENESIS) {
  const rpc = readOnlyRpc(endpoint, 8000);
  let cached: Status | undefined;
  let expires = 0;
  let pending: Promise<Status> | undefined;
  return async (): Promise<Status> => {
    if (cached && Date.now() < expires) return cached;
    if (!pending) {
      pending = probeSolanaUpgrade(rpc, SOLANA_GENESIS[network]).then(report => {
        cached = { ...report, checkedAt: new Date().toISOString() };
        expires = Date.now() + 15000;
        return cached;
      }).finally(() => { pending = undefined; });
    }
    return pending;
  };
}

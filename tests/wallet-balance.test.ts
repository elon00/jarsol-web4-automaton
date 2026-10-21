import test from 'node:test';
import assert from 'node:assert/strict';
import { BalanceUnavailableError, readWalletBalance, canonicalTokenBalance } from '../src/services/WalletBalanceService.ts';
import { connectInstantDevnetKeypair } from '../src/utils/wallet.ts';

const address = 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV';
const mint = '224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn';
const otherMint = 'AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG';
const body = { verified: true, address, network: 'devnet', lamports: 2000000000, sol: 2, tokens: [] };
const response = (data: unknown) => (async () => Response.json(data)) as typeof fetch;

test('a verified backend response must match the selected address, cluster and lamports', async () => {
  const balance = await readWalletBalance(address, 'devnet', {
    fetchImpl: response(body), readRpc: async () => { throw new Error('unexpected fallback'); },
  });
  assert.deepEqual(balance, { sol: 2, tokens: [] });
});
test('a backend on another cluster falls back to the requested cluster', async () => {
  let requested: unknown;
  const balance = await readWalletBalance(address, 'testnet', {
    fetchImpl: response(body),
    readRpc: async (key, network) => { requested = [key, network]; return { sol: 0.5, tokens: [] }; },
  });
  assert.deepEqual(requested, [address, 'testnet']);
  assert.equal(balance.sol, 0.5);
});
test('wrong address, missing verification and malformed values never become a trusted balance', async () => {
  for (const data of [
    { ...body, address: mint }, { ...body, verified: false }, { ...body, sol: 200 },
    { ...body, lamports: Number.MAX_SAFE_INTEGER + 1 }, { ...body, tokens: [{ mint, amount: '-1', decimals: 9 }] },
    { ...body, tokens: [{ mint: 'invalid', amount: '1', decimals: 9 }] },
    { ...body, tokens: [{ mint, amount: 'Infinity', decimals: 9 }] },
  ]) {
    const balance = await readWalletBalance(address, 'devnet', {
      fetchImpl: response(data), readRpc: async () => ({ sol: 0.75, tokens: [] }),
    });
    assert.equal(balance.sol, 0.75);
  }
});
test('a failed RPC read is unavailable rather than a fabricated zero balance', async () => {
  await assert.rejects(readWalletBalance(address, 'devnet', {
    fetchImpl: async () => { throw new Error('backend offline'); },
    readRpc: async () => { throw new Error('provider URL with credentials must not escape'); },
  }), error => error instanceof BalanceUnavailableError && !error.message.includes('credentials'));
});
test('a genuine zero is returned only after a successful read', async () => {
  assert.deepEqual(await readWalletBalance(address, 'devnet', {
    fetchImpl: async () => new Response(null, { status: 404 }),
    readRpc: async () => ({ sol: 0, tokens: [] }),
  }), { sol: 0, tokens: [] });
});
test('invalid identities are rejected before any network request', async () => {
  let calls = 0;
  const options = {
    fetchImpl: (async () => { calls++; return Response.json(body); }) as typeof fetch,
    readRpc: async () => { calls++; return { sol: 0, tokens: [] }; },
  };
  await assert.rejects(readWalletBalance('invalid/address', 'devnet', options), BalanceUnavailableError);
  await assert.rejects(readWalletBalance(address, '__proto__' as never, options), BalanceUnavailableError);
  assert.equal(calls, 0);
});
test('malformed RPC balances are rejected as unavailable', async () => {
  for (const balance of [{ sol: NaN, tokens: [] }, { sol: -1, tokens: [] },
    { sol: 1, tokens: [{ mint, amount: '1', decimals: 256 }] }]) {
    await assert.rejects(readWalletBalance(address, 'devnet', {
      fetchImpl: async () => new Response(null, { status: 404 }), readRpc: async () => balance,
    }), BalanceUnavailableError);
  }
});
test('JARSOL balances use the selected canonical mint, summing accounts instead of the first token', () => {
  const tokens = [{ mint: otherMint, amount: '900000', decimals: 9 },
    { mint, amount: '1.5', decimals: 9 }, { mint, amount: '2', decimals: 9 }];
  assert.equal(canonicalTokenBalance(tokens, mint), 3.5);
  assert.equal(canonicalTokenBalance(tokens, undefined), 0);
});
test('the disposable browser keypair cannot be opened on a testnet or mainnet cluster', async () => {
  // No browser storage exists in this test: the network guard must run first.
  await assert.rejects(connectInstantDevnetKeypair('testnet'), /Devnet only/);
  await assert.rejects(connectInstantDevnetKeypair('mainnet-beta'), /Devnet only/);
});

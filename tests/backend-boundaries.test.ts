import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import express from 'express';
import {
  createOperationBoundary, canonicalNetwork, verifyTestnetOperation, OperationBoundaryError, checkedSolanaRpcUrl,
} from '../src/server/operation-boundaries.ts';

async function serve(token: string, callback: (url: string, calls: () => number) => Promise<void>) {
  const app = express(); let calls = 0;
  app.use('/api', createOperationBoundary(() => token));
  app.all('/api/*', (_req, res) => { calls++; res.status(204).end(); });
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address === 'object');
  try { await callback('http://127.0.0.1:' + address.port, () => calls); }
  finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}
test('privileged and newly added POST routes are disabled until an operator credential is configured', async () => {
  for (const token of ['', 'invalid-config']) await serve(token, async (url, calls) => {
    for (const path of ['/solana/deploy-token', '/solana/airdrop', '/gemini/chat', '/future-operation']) {
      assert.equal((await fetch(url + '/api' + path, { method: 'POST' })).status, 503);
    }
    assert.equal(calls(), 0);
  });
});
test('missing, wrong and query-string credentials cannot invoke an operator handler', async () => {
  const token = randomBytes(32).toString('hex');
  await serve(token, async (url, calls) => {
    const endpoint = url + '/api/solana/deploy-token';
    assert.equal((await fetch(endpoint, { method: 'POST' })).status, 401);
    assert.equal((await fetch(endpoint, { method: 'POST', headers: { authorization: 'Bearer ' + randomBytes(32).toString('hex') } })).status, 401);
    assert.equal((await fetch(endpoint + '?token=' + token, { method: 'POST' })).status, 401);
    assert.equal(calls(), 0);
  });
});
test('a trusted CLI credential authorizes a handler, while browser use is rejected', async () => {
  const token = randomBytes(32).toString('hex');
  await serve(token, async (url, calls) => {
    const headers = { authorization: 'Bearer ' + token };
    assert.equal((await fetch(url + '/api/solana/deploy-token', { method: 'POST', headers })).status, 204);
    assert.equal((await fetch(url + '/api/solana/deploy-token', { method: 'POST',
      headers: { ...headers, origin: 'https://example.invalid' } })).status, 403);
    assert.equal(calls(), 1);
  });
});
test('read-only MCP and unsigned testnet Action requests remain public', async () => {
  await serve('', async (url, calls) => {
    for (const path of ['/mcp', '/actions/tip']) assert.equal((await fetch(url + '/api' + path, { method: 'POST' })).status, 204);
    assert.equal((await fetch(url + '/api/solana/balance/address')).status, 204);
    assert.equal(calls(), 3);
  });
});
test('simulated payment, swap and server key export services cannot execute, even with an operator credential', async () => {
  const token = randomBytes(32).toString('hex');
  await serve(token, async (url, calls) => {
    for (const path of ['/v1/x402/pqc/keygen', '/v1/x402/agent/audit', '/pqc/generate-keys', '/pqc/encapsulate', '/dex/swap', '/agents/task']) {
      const response = await fetch(url + '/api' + path, { method: 'POST', headers: { authorization: 'Bearer ' + token } });
      assert.equal(response.status, 501);
      const body = await response.json(); assert.equal(body.verified, false);
    }
    assert.equal(calls(), 0);
  });
});
test('a missing, invalid, mismatched or mainnet selection stops before RPC or payer access', async () => {
  let probes = 0;
  for (const [requested, configured, status] of [
    [undefined, 'devnet', 400], ['../../private', 'devnet', 400], ['testnet', 'devnet', 409],
    ['mainnet-beta', 'mainnet-beta', 403],
  ] as const) {
    await assert.rejects(verifyTestnetOperation(requested, configured, async () => { probes++; }),
      error => error instanceof OperationBoundaryError && error.status === status);
  }
  assert.equal(probes, 0);
});
test('RPC identity failure is redacted and stops the operation before signing', async () => {
  let writes = 0;
  await assert.rejects(async () => {
    await verifyTestnetOperation('devnet', 'devnet', async () => { throw new Error('synthetic provider credential canary'); });
    writes++;
  }, error => error instanceof OperationBoundaryError && error.status === 503 && !error.message.includes('canary'));
  assert.equal(writes, 0);
});
test('the verified cluster result is passed through only after identity succeeds', async () => {
  const report = { commitment: 'finalized' };
  assert.equal(await verifyTestnetOperation('testnet', 'testnet', async () => report), report);
});
test('canonical registry selection rejects traversal, arrays and unknown cluster names', () => {
  assert.equal(canonicalNetwork(undefined), undefined);
  assert.equal(canonicalNetwork('devnet'), 'devnet');
  for (const value of ['../../package', '..%2fprivate', ['devnet'], {}, '__proto__']) {
    assert.throws(() => canonicalNetwork(value), OperationBoundaryError);
  }
});


test('the commerce page offers no payment recipient or fabricated settlement action', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { X402BazaarCommerce } = await import('../src/components/X402BazaarCommerce.tsx');
  const html = renderToStaticMarkup(React.createElement(X402BazaarCommerce, {
    wallet: { connected: false, address: null, publicKey: null, solBalance: 0, jarsolBalance: 0, walletType: null, network: 'devnet' },
    onRefreshBalance: () => {}, onToast: () => {},
  }));
  assert.match(html, /Unavailable/);
  assert.match(html, /does not request or accept SOL/);
  assert.doesNotMatch(html, /payTo|Settlement Confirmed|Claim Service/);
});

test('static commerce discovery files advertise no paid services or recipients', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const name of ['x402-bazaar.json', 'x402.json']) {
    const data = JSON.parse(await readFile(new URL('../public/.well-known/' + name, import.meta.url), 'utf8'));
    assert.equal(data.status, 'UNAVAILABLE');
    assert.equal(data.verified, false);
    assert.deepEqual(data.endpoints, []);
    assert.deepEqual(data.services, []);
    assert.equal(data.provider, undefined);
  }
});

test('invalid RPC configuration is rejected without disclosing provider credentials', () => {
  assert.equal(checkedSolanaRpcUrl('http://127.0.0.1:1234'), 'http://127.0.0.1:1234/');
  for (const value of ['not-a-url-canary', 'https://user:credential-canary@example.invalid',
    'http://example.invalid/credential-canary', 'https://example.invalid/#credential-canary']) {
    assert.throws(() => checkedSolanaRpcUrl(value), error => error instanceof Error && !error.message.includes('canary'));
  }
});

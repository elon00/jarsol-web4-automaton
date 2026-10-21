import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createSolanaUpgradeMonitor } from '../src/services/SolanaUpgradeService.ts';
import { SOLANA_GENESIS } from '../src/integrations/chain-upgrades.ts';

async function serve(identity: string, callback: (url: string, calls: string[]) => Promise<void>) {
  const calls: string[] = [];
  const server = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    const request = JSON.parse(body); calls.push(request.method);
    const result = request.method === 'getGenesisHash' ? identity : {
      block: { slot: 504148999, blockId: Array(32).fill(1) },
      signature: { signature: Array(192).fill(2), bitmap: [1] },
    };
    res.end(JSON.stringify({ jsonrpc: '2.0', id: request.id, result }));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    await callback('http://127.0.0.1:' + address.port, calls);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}
test('concurrent app reads share one probe and get a dated cached consensus result', async () => {
  await serve(SOLANA_GENESIS.devnet, async (url, calls) => {
    const monitor = createSolanaUpgradeMonitor(url, 'devnet');
    const reports = await Promise.all(Array.from({ length: 12 }, () => monitor()));
    assert.equal(reports[0].upgrade.commitment, 'finalized');
    assert.ok(Number.isFinite(Date.parse(reports[0].checkedAt)));
    assert.equal(await monitor(), reports[0]);
    assert.deepEqual(calls, ['getGenesisHash', 'getAgGenesisCert']);
  });
});
test('identity errors are never cached as a successful network result', async () => {
  await serve(SOLANA_GENESIS['mainnet-beta'], async (url, calls) => {
    const monitor = createSolanaUpgradeMonitor(url, 'devnet');
    await assert.rejects(monitor(), /genesis hash/);
    await assert.rejects(monitor(), /genesis hash/);
    assert.deepEqual(calls, ['getGenesisHash', 'getGenesisHash']);
  });
});

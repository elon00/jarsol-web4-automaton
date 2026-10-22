import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PublicKey } from '@solana/web3.js';
import { deploymentConnection, assertReferenceMint } from '../scripts/deployment-rpc.ts';
import { SOLANA_GENESIS } from '../src/integrations/chain-upgrades.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
for (const name of ['verify-devnet.ts', 'verify-testnet.ts', 'verify-fresh-testnet.ts']) {
  test(name + ' cannot turn an RPC outage into a passing deployment verification', { timeout: 30000 }, async () => {
    const inherited = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'COMSPEC', 'PATHEXT']
      .filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]!]));
    const child = spawn(process.execPath, ['--import', new URL('./fixtures/rpc-unavailable.mjs', import.meta.url).href,
      '--import', 'tsx', 'scripts/' + name], { cwd: root, env: { ...inherited,
        SOLANA_RPC_URL: 'https://example.invalid/provider-path-canary',
        SOLANA_TESTNET_RPC: 'https://example.invalid/provider-path-canary' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', value => { output = (output + value).slice(-16000); });
    child.stderr.on('data', value => { output = (output + value).slice(-16000); });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const code = await new Promise<number | null>((resolve, reject) => {
        timer = setTimeout(() => { child.kill(); reject(new Error('Verification CLI timed out')); }, 25000);
        child.once('error', () => reject(new Error('Verification CLI did not start')));
        child.once('exit', resolve);
      });
      assert.equal(code, 1);
      assert.doesNotMatch(output, /AUTO-HEAL VERDICT|VERIFICATION: PASS|provider-detail-canary|provider-path-canary/);
      assert.match(output, /FAILED OR UNAVAILABLE/);
    } finally { if (timer) clearTimeout(timer); if (child.exitCode === null && child.signalCode === null) child.kill(); }
  });
}

test('wrong genesis fails before any account read', async () => {
  const methods: string[] = [];
  const rpc: typeof fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)); methods.push(request.method);
    return Response.json({ jsonrpc: '2.0', id: request.id, result: SOLANA_GENESIS['mainnet-beta'] });
  };
  await assert.rejects(deploymentConnection('https://example.invalid', 'testnet', rpc), /network identity/);
  assert.deepEqual(methods, ['getGenesisHash']);
});

test('matched genesis permits bounded finalized account reads and rejects oversized/provider failures', async () => {
  const methods: string[] = [];
  let oversized = false;
  const rpc: typeof fetch = async (_url, init) => {
    assert.equal(init?.redirect, 'error');
    const request = JSON.parse(String(init?.body)); methods.push(request.method);
    if (request.method === 'getGenesisHash') return Response.json({ jsonrpc: '2.0', id: request.id, result: SOLANA_GENESIS.testnet });
    assert.equal(request.params[1].commitment, 'finalized');
    if (oversized) return new Response('x'.repeat(1048577));
    return Response.json({ jsonrpc: '2.0', id: request.id, result: { context: { slot: 42 }, value: null } });
  };
  const connection = await deploymentConnection('https://example.invalid', 'testnet', rpc);
  const key = new PublicKey('11111111111111111111111111111111');
  assert.equal((await connection.getParsedAccountInfo(key)).value, null);
  oversized = true;
  await assert.rejects(connection.getParsedAccountInfo(key), /exceeds limit/);
  assert.deepEqual(methods, ['getGenesisHash', 'getAccountInfo', 'getAccountInfo']);
});

test('reference mint policy rejects wrong owner, supply, type and retained authorities', () => {
  const account = { owner: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    data: { parsed: { type: 'mint', info: { isInitialized: true, decimals: 9, supply: '1000000000000000000', mintAuthority: null, freezeAuthority: null } } } };
  assert.doesNotThrow(() => assertReferenceMint(account));
  assert.throws(() => assertReferenceMint(null));
  assert.throws(() => assertReferenceMint({ ...account, owner: new PublicKey('11111111111111111111111111111111') }));
  for (const [key, value] of [['supply', '1'], ['mintAuthority', 'retained'], ['freezeAuthority', 'retained'], ['decimals', 6], ['isInitialized', false]]) {
    const changed = structuredClone(account.data);
    (changed.parsed.info as Record<string, unknown>)[key as string] = value;
    assert.throws(() => assertReferenceMint({ ...account, data: changed }));
  }
  assert.throws(() => assertReferenceMint({ ...account, data: { parsed: { ...account.data.parsed, type: 'account' } } }));
});

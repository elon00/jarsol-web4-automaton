import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
async function withServer(operatorToken: string, rpcUrl: string, callback: (url: string, output: () => string) => Promise<void>) {
  const inherited = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'COMSPEC', 'PATHEXT']
    .filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]!]));
  const child: ChildProcess = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: root, env: { ...inherited, PORT: '0', JARSOL_HOST: '127.0.0.1',
      GEMINI_API_KEY: '', SOLANA_NETWORK: 'devnet', SOLANA_RPC_URL: rpcUrl,
      SOLANA_KEYPAIR_PATH: fileURLToPath(new URL('../missing-payer-canary.json', import.meta.url)),
      JARSOL_OPERATOR_TOKEN: operatorToken,
    }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const address = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Backend startup timed out')), 30000);
    child.once('error', () => { clearTimeout(timeout); reject(new Error('Backend did not start')); });
    child.once('exit', () => { clearTimeout(timeout); reject(new Error('Backend exited before readiness')); });
    child.stdout!.on('data', data => {
      output = (output + data.toString()).slice(-16000);
      const match = /listening on 127\.0\.0\.1:([0-9]+);/.exec(output);
      if (match) { clearTimeout(timeout); resolve('http://127.0.0.1:' + match[1]); }
    });
    // Deliberately do not print process output or environment on failure.
    child.stderr!.on('data', () => {});
  });
  try { await callback(await address, () => output); }
  finally {
    if (child.exitCode === null && child.signalCode === null) {
      const ended = new Promise<void>(resolve => child.once('exit', () => resolve()));
      child.kill(); await ended;
    }
  }
}
test('the actual server limits repeated unauthorized traffic without trusting forwarding headers', async () => {
  await withServer('', 'https://provider.invalid/rate-limit-canary', async url => {
    for (let index = 0; index < 120; index++) {
      const response = await fetch(url + '/api/solana/deploy-token', { method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.' + (index % 250 + 1) }, body: '{broken' });
      assert.equal(response.status, 503);
      await response.arrayBuffer();
    }
    const blocked = await fetch(url + '/api/solana/deploy-token', { method: 'POST' });
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers.get('retry-after'));
    assert.equal((await blocked.json()).verified, false);
  });
});

test('the actual default server closes privileged routes before parsing their bodies', async () => {
  await withServer('', 'https://provider.invalid/synthetic-rpc-path-canary', async (url, output) => {
    const response = await fetch(url + '/api/solana/deploy-token', { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: '{broken' });
    assert.equal(response.status, 503);
    const metadata = await fetch(url + '/api/mcp', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'health' } }) });
    assert.equal(metadata.status, 200);
    assert.doesNotMatch(await metadata.text(), /synthetic-rpc-path-canary|provider\.invalid/);
    assert.doesNotMatch(output(), /synthetic-rpc-path-canary|provider\.invalid/);
  });
});
test('actual backend routes enforce identity, registry path and unavailable-service boundaries', async () => {
  const methods: string[] = [];
  const rpc = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    const request = JSON.parse(body); methods.push(request.method);
    // Deliberately return mainnet identity to a server configured for Devnet.
    res.end(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' }));
  });
  await new Promise<void>(resolve => rpc.listen(0, '127.0.0.1', resolve));
  const address = rpc.address(); assert.ok(address && typeof address === 'object');
  const token = randomBytes(32).toString('hex');
  try {
    await withServer(token, 'http://127.0.0.1:' + address.port + '/synthetic-rpc-path-canary', async url => {
      const headers = { authorization: 'Bearer ' + token, 'content-type': 'application/json' };
      const unauth = await fetch(url + '/api/solana/deploy-token', { method: 'POST',
        headers: { 'content-type': 'application/json' }, body: '{broken' });
      assert.equal(unauth.status, 401);
      const mismatch = await fetch(url + '/api/solana/deploy-token', { method: 'POST', headers,
        body: JSON.stringify({ network: 'testnet' }) });
      assert.equal(mismatch.status, 409); assert.equal(methods.length, 0);
      const wrongRpc = await fetch(url + '/api/solana/deploy-token', { method: 'POST', headers,
        body: JSON.stringify({ network: 'devnet' }) });
      assert.equal(wrongRpc.status, 503);
      const failure = await wrongRpc.text();
      assert.match(failure, /identity or connectivity/);
      assert.doesNotMatch(failure, /synthetic-rpc-path-canary|keypair|payer/);
      assert.deepEqual(methods, ['getGenesisHash']);
      assert.equal((await fetch(url + '/api/solana/canonical-mint?network=../../private')).status, 400);
      const registry = await fetch(url + '/api/solana/canonical-mint');
      if (registry.ok) assert.equal((await registry.json()).verified, false);
      for (const path of ['/api/v1/x402/pqc/keygen', '/api/dex/swap', '/api/pqc/generate-keys']) {
        const unavailable = await fetch(url + path, { method: 'POST', headers, body: '{}' });
        assert.equal(unavailable.status, 501);
        const body = await unavailable.json(); assert.equal(body.verified, false);
        assert.doesNotMatch(JSON.stringify(body), /secretKeyHex|sharedSecretHex|txSignature/);
      }
      const discovery = await fetch(url + '/.well-known/x402-bazaar.json');
      assert.equal(discovery.status, 503);
      assert.deepEqual((await discovery.json()).services, []);
      const malformed = await fetch(url + '/api/gemini/chat', { method: 'POST', headers, body: '{broken' });
      assert.equal(malformed.status, 400);
      const vision = await fetch(url + '/api/gemini/multimodal', { method: 'POST', headers,
        body: JSON.stringify({ imageBase64: 'synthetic-image-canary' }) });
      assert.equal(vision.status, 503);
      const visionBody = await vision.json();
      assert.equal(visionBody.verified, false);
      assert.equal(visionBody.analysis, undefined);
      const oversized = await fetch(url + '/api/gemini/chat', { method: 'POST', headers,
        body: JSON.stringify({ message: 'x'.repeat(1024 * 1024) }) });
      assert.equal(oversized.status, 413);
      assert.doesNotMatch(await oversized.text(), /synthetic-rpc-path-canary|SyntaxError|stack/);
      assert.deepEqual(methods, ['getGenesisHash']);
    });
  } finally {
    rpc.closeAllConnections();
    await new Promise<void>(resolve => rpc.close(() => resolve()));
  }
});

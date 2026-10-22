import test from 'node:test';
import assert from 'node:assert/strict';
import { askGeminiAgent, runGeminiRegulatoryAudit } from '../src/utils/gemini.ts';
import { publicHttpFailure } from '../src/server/operation-boundaries.ts';

test('provider or authorization failure never becomes a fabricated model reply or direct API fallback', async () => {
  const original = globalThis.fetch;
  try {
    for (const status of [401, 403, 429, 503]) {
      const urls: string[] = [];
      globalThis.fetch = (async (url: string | URL | Request) => {
        urls.push(String(url));
        return new Response('provider-error-canary', { status });
      }) as typeof fetch;
      const result = await askGeminiAgent('Describe current network state');
      assert.equal(result.success, false); assert.equal(result.model, 'unavailable');
      assert.match(result.reply, /No model response was received/);
      assert.doesNotMatch(JSON.stringify(result), /provider-error-canary|100%|neural-core/);
      assert.deepEqual(urls, ['/api/gemini/chat']);
    }
  } finally { globalThis.fetch = original; }
});

test('malformed successful replies remain unavailable and only actual structured replies are accepted', async () => {
  const original = globalThis.fetch;
  try {
    const timestamp = new Date().toISOString();
    for (const reply of [{ reply: 'synthetic', model: 'model', timestamp },
      { success: true, reply: ' ', model: 'model', timestamp },
      { success: true, reply: 'Answer', model: 'model', timestamp: 'invalid' }]) {
      globalThis.fetch = (async () => Response.json(reply)) as typeof fetch;
      assert.equal((await askGeminiAgent('Question')).success, false);
    }
    globalThis.fetch = (async () => Response.json({ success: true, reply: 'Actual response',
      model: 'configured-model', timestamp })) as typeof fetch;
    assert.deepEqual(await askGeminiAgent('Question'), {
      success: true, reply: 'Actual response', model: 'configured-model', timestamp,
    });
    globalThis.fetch = (async () => { throw new Error('private-provider-canary'); }) as typeof fetch;
    assert.equal((await askGeminiAgent('Question')).success, false);
  } finally { globalThis.fetch = original; }
});

test('invalid and oversized requests stop before any provider request', async () => {
  const original = globalThis.fetch; let calls = 0;
  try {
    globalThis.fetch = (async () => { calls++; throw new Error(); }) as typeof fetch;
    assert.equal((await askGeminiAgent('')).error, 'INVALID_AI_REQUEST');
    assert.equal((await askGeminiAgent('x'.repeat(1024 * 1024))).error, 'AI_REQUEST_TOO_LARGE');
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});

test('legal review is unavailable rather than an invented audit or risk rating', async () => {
  const result = await runGeminiRegulatoryAudit();
  assert.equal(result.success, false); assert.equal(result.isLegalCertification, false);
  assert.equal(result.auditTimestamp, null); assert.deepEqual(result.howeyAnalysis, {});
});

test('public HTTP errors retain valid status and redact internal details', () => {
  for (const status of [400, 404, 413, 429, 500, 502]) {
    const result = publicHttpFailure({ status, message: 'private-error-canary' });
    assert.equal(result.status, status);
    assert.doesNotMatch(result.message, /private-error-canary/);
  }
  for (const error of [undefined, new Error('private-error-canary'), { status: 200 }, { status: '404' }]) {
    assert.equal(publicHttpFailure(error).status, 500);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { updateRegistry } from '../scripts/registry-store.ts';

test('registry updates preserve other clusters and cannot bypass an existing writer lock', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'jarsol-registry-'));
  const file = path.join(folder, 'registry.json');
  try {
    updateRegistry(file, value => { value.clusters = { devnet: { mint: 'existing' } }; });
    updateRegistry(file, value => { value.clusters.testnet = { mint: 'new' }; });
    const expected = fs.readFileSync(file, 'utf8');
    assert.equal(JSON.parse(expected).clusters.devnet.mint, 'existing');
    fs.writeFileSync(file + '.lock', 'other writer', { flag: 'wx' });
    assert.throws(() => updateRegistry(file, value => { value.clusters = {}; }), { code: 'EEXIST' });
    assert.equal(fs.readFileSync(file, 'utf8'), expected);
    fs.unlinkSync(file + '.lock');
    assert.throws(() => updateRegistry(file, () => { throw new Error('mutation failed'); }));
    assert.equal(fs.readFileSync(file, 'utf8'), expected);
    assert.deepEqual(fs.readdirSync(folder), ['registry.json']);
    fs.writeFileSync(file, '{invalid');
    assert.throws(() => updateRegistry(file, () => {}));
    assert.equal(fs.readFileSync(file, 'utf8'), '{invalid');
  } finally { fs.rmSync(folder, { recursive: true }); }
});

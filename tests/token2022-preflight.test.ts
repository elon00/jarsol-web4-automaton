import test from 'node:test';
import assert from 'node:assert/strict';
import { rawSupply } from '../scripts/token2022-preflight.ts';

test('Token-2022 amounts preserve precision and the unsigned 64-bit bound', () => {
  assert.equal(rawSupply('9', '1000000'), 1000000000000000n);
  assert.equal(rawSupply('2', '1.01'), 101n);
  assert.equal(rawSupply('0', '18446744073709551615'), 18446744073709551615n);
  for (const [decimals, amount] of [['0', '18446744073709551616'], ['9', '0'], ['2', '1.001'],
    ['19', '1'], ['-1', '1'], ['09', '1'], ['9', '1e9'], ['9', '-1'], ['9', 'Infinity']]) {
    assert.throws(() => rawSupply(decimals, amount));
  }
});

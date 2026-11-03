import test from 'node:test';
import assert from 'node:assert/strict';
import { TOKEN_2022_PROGRAM_ID, validateTestnetMintEvidence } from '../scripts/testnet-mint-evidence.ts';

const registry = {
  network: 'testnet', status: 'DEPLOYED',
  token: { mintAddress: 'ExampleTokenAddress', decimals: 9, rawSupply: '1000000000000000000' },
  deployment: { mintAuthorityRevoked: true, freezeAuthorityRevoked: true }
};
const account = () => ({
  owner: { toBase58: () => TOKEN_2022_PROGRAM_ID },
  data: { parsed: { type: 'mint', info: {
    isInitialized: true, decimals: 9, supply: '1000000000000000000',
    mintAuthority: null, freezeAuthority: null
  } } }
});

test('fresh parsed RPC mint evidence passes only when all invariants match', () => {
  assert.equal(validateTestnetMintEvidence(registry, account()).rawSupply, registry.token.rawSupply);
});
test('a registry-only claim or a missing live account must fail', () => {
  assert.throws(() => validateTestnetMintEvidence(registry, {} as never));
});
test('non-Token-2022 program is rejected', () => {
  const x = account(); x.owner.toBase58 = () => 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  assert.throws(() => validateTestnetMintEvidence(registry, x), /Token-2022/);
});
test('wrong token supply is rejected', () => {
  const x = account(); x.data.parsed.info.supply = '0';
  assert.throws(() => validateTestnetMintEvidence(registry, x), /supply/);
});
test('wrong decimals are rejected', () => {
  const x = account(); x.data.parsed.info.decimals = 6;
  assert.throws(() => validateTestnetMintEvidence(registry, x), /decimals/);
});
test('unrevoked mint authority is rejected', () => {
  const x = account(); x.data.parsed.info.mintAuthority = 'someone';
  assert.throws(() => validateTestnetMintEvidence(registry, x), /Mint authority/);
});
test('unrevoked freeze authority is rejected', () => {
  const x = account(); x.data.parsed.info.freezeAuthority = 'someone';
  assert.throws(() => validateTestnetMintEvidence(registry, x), /Freeze authority/);
});
test('non-mint parsed data is rejected', () => {
  const x = account(); x.data.parsed.type = 'account';
  assert.throws(() => validateTestnetMintEvidence(registry, x), /non-mint/);
});
test('missing deployment state cannot pass', () => {
  assert.throws(() => validateTestnetMintEvidence({...registry, status:'DRAFT'},account()));
});

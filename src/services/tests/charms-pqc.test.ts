/**
 * Test Suite: Charms Protocol Post-Quantum Integration
 * Verifies NIST FIPS 204 (ML-DSA-65), NIST FIPS 203 (ML-KEM-768),
 * v15 Spell construction, Taproot synthesis, and cross-chain beaming.
 */

import { pqcMlDsa65 } from '../../crypto/pqc/ml-dsa';
import { pqcMlKem768 } from '../../crypto/pqc/ml-kem';
import { CharmsPqcClient } from '../charms/charms-pqc-client';
import { CharmsBeamingBridge } from '../charms/charms-beaming-bridge';

async function runTests() {
  console.log('🧪 Starting Charms Protocol Post-Quantum Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // --- Test 1: Spell Construction & Deterministic Hashing ---
  console.log('--- Test 1: Spell Construction & ML-DSA-65 Binding ---');
  const client = new CharmsPqcClient();
  const dsaKeyPair = pqcMlDsa65.keygen();

  const { spell, spellHash, spellHashHex } = client.createPqcSpell({
    appId: 'test-charms-pqc-app',
    ins: [
      {
        txid: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        vout: 0,
      },
    ],
    outs: [
      {
        address: 'tb1p7962vd823uqz3uuxq2e0l56k2u089w4a2c0g7t6x92d192h32u8qsk3w0y',
        value: 25000,
      },
    ],
    coins: {
      '0': {
        token_id: '0000000000000000000000000000000000000000000000000000000000000042',
        amount: 500,
      },
    },
    action: 'TRANSFER_PQC_TOKEN',
    pqcPublicKey: dsaKeyPair.publicKey,
  });

  assert(spell.version === 15, 'Spell has version 15');
  assert(spellHash.length === 32, 'Spell hash is 32 bytes (SHA-256)');
  assert(spellHashHex.length === 64, 'Spell hash hex is 64 characters');

  // --- Test 2: Signing & Verification ---
  console.log('\n--- Test 2: NIST FIPS 204 ML-DSA-65 Signing ---');
  const witness = client.signSpell(spell, dsaKeyPair.secretKey, dsaKeyPair.publicKey);
  assert(witness.algorithm === 'ML-DSA-65', 'Witness uses ML-DSA-65');
  assert(witness.publicKeyHex.length === 1952 * 2, 'Public key length is exactly 1952 bytes');
  assert(witness.signatureHex.length === 3309 * 2, 'Signature length is exactly 3309 bytes');

  // Negative test: Tampered hash
  const tamperedHash = new Uint8Array(spellHash);
  tamperedHash[0] ^= 0xff;
  const isTamperedValid = pqcMlDsa65.verify(
    Buffer.from(witness.signatureHex, 'hex'),
    tamperedHash,
    dsaKeyPair.publicKey
  );
  assert(!isTamperedValid, 'Signature fails on tampered spell hash (Fail-closed)');

  // --- Test 3: Prover API & Taproot Transaction Synthesis ---
  console.log('\n--- Test 3: Prover API & Bitcoin Taproot Transaction Envelope ---');
  const proverResp = await client.callProverApi({
    spell,
    prev_txs: ['020000000001017b0a8839d892d7705353eeae69ad3123b37a1f5999a0937a895b6a71391cb4570000000000ffffffff0100e1f50500000000225120...'],
    change_address: 'tb1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9y8q5y',
    fee_rate: 15,
    chain: 'bitcoin-testnet4',
  });

  assert(proverResp.status === 'proven', 'Prover status is proven');
  assert(Boolean(proverResp.raw_tx && proverResp.raw_tx.startsWith('02000000')), 'Produces valid Bitcoin v2 Taproot transaction');

  // --- Test 4: Cross-Chain Beaming (Bitcoin -> Solana) ---
  console.log('\n--- Test 4: Cross-Chain Beaming to Solana (ML-KEM-768 + ML-DSA-65) ---');
  const bridge = new CharmsBeamingBridge(client);
  const solanaRecipientKem = pqcMlKem768.keygen();

  const { receipt, rawBitcoinTxHex } = await bridge.initiateBitcoinToChainBeam({
    originUtxo: {
      txid: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
      vout: 1,
    },
    tokenId: '0000000000000000000000000000000000000000000000000000000000000099',
    amount: 1000,
    destinationChain: 'solana',
    recipientAddress: 'SoL11111111111111111111111111111111111111112',
    recipientKemPublicKey: solanaRecipientKem.publicKey,
    senderDsaKeyPair: dsaKeyPair,
  });

  assert(receipt.originChain === 'bitcoin', 'Origin chain is bitcoin');
  assert(receipt.destinationChain === 'solana', 'Destination chain is solana');
  assert(receipt.amount === 1000, 'Beamed amount matches');
  assert(Boolean(receipt.kemCiphertextHex), 'Receipt contains KEM ciphertext');
  assert(rawBitcoinTxHex.length > 0, 'Raw Bitcoin transaction generated for anchoring');

  // Redeem / Claim on Solana
  const redeemResult = bridge.verifyAndRedeemReceipt(receipt, solanaRecipientKem.secretKey);
  assert(redeemResult.valid === true, 'Receipt redeemed successfully on Solana');
  assert(redeemResult.sharedSecretHex.length === 64, 'Shared secret decapsulated (32 bytes)');
  assert(redeemResult.status === 'STATE_TRANSITION_AUTHORIZED_FOR_SOLANA', 'State transition authorized');

  // Negative test: Incorrect KEM secret key
  const wrongKemKeyPair = pqcMlKem768.keygen();
  const wrongSharedSecret = pqcMlKem768.decapsulate(
    Buffer.from(receipt.kemCiphertextHex!, 'hex'),
    wrongKemKeyPair.secretKey
  );
  assert(
    Buffer.from(redeemResult.sharedSecretHex, 'hex').toString('hex') !==
      Buffer.from(wrongSharedSecret).toString('hex'),
    'Wrong secret key yields different shared secret (KEM security)'
  );

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});

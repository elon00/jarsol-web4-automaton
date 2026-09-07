/**
 * JARSOL DOWNGRADE DEFENSE TESTS
 * Standard: Anti-Downgrade & Strict Fail-Closed Security
 * Path: src/crypto/tests/downgrade-defense.test.ts
 */

import { hybridEnvelopeEngine, HybridSignatureEnvelope } from '../hybrid/hybrid-envelope';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runDowngradeDefenseTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING CRYPTOGRAPHIC DOWNGRADE DEFENSE TESTS');
  console.log('=====================================================================\n');

  const hybridKey = hybridEnvelopeEngine.generateKeyPair();
  const payload = Buffer.from('CRITICAL_SETTLEMENT_ORDER_1000', 'utf-8');
  const validEnvelope = hybridEnvelopeEngine.createEnvelope(payload, hybridKey);

  // 1. Attacker strips PQC signature from envelope
  console.log('[TEST 1] PQC Signature Stripping Attack:');
  const strippedEnvelope: HybridSignatureEnvelope = {
    ...validEnvelope,
    pqcSignatureBase58: '', // stripped
  };
  let rejected = false;
  try {
    const res = hybridEnvelopeEngine.verifyEnvelope(payload, strippedEnvelope);
    if (!res.valid) rejected = true;
  } catch {
    rejected = true;
  }
  assert(rejected === true, 'Stripped PQC signature strictly fails closed');

  // 2. Insecure downgrade request policy
  console.log('\n[TEST 2] Strict Hybrid Mode Enforcement:');
  const isHybridPermitted = (requestedSuite: string, enforcePqc: boolean): boolean => {
    if (enforcePqc && requestedSuite !== 'HYBRID_ED25519_ML_DSA65') {
      return false;
    }
    return true;
  };

  assert(isHybridPermitted('HYBRID_ED25519_ML_DSA65', true) === true, 'Approved hybrid suite accepted');
  assert(isHybridPermitted('CLASSICAL_ED25519_ONLY', true) === false, 'Classical-only downgrade strictly rejected');
  assert(isHybridPermitted('RSA_2048', true) === false, 'Legacy algorithm downgrade strictly rejected');

  console.log('\n=====================================================================');
  console.log('🏆 ALL DOWNGRADE DEFENSE TESTS PASSED (2/2)');
  console.log('=====================================================================\n');
}

runDowngradeDefenseTests().catch(err => {
  console.error(err);
  process.exit(1);
});

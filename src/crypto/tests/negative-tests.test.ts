/**
 * JARSOL ADVERSARIAL & NEGATIVE CRYPTO TESTS
 * Standard: Reality-First Security & Malformed Input Defense
 * Path: src/crypto/tests/negative-tests.test.ts
 */

import { pqcMlKem768 } from '../pqc/ml-kem';
import { pqcMlDsa65 } from '../pqc/ml-dsa';
import { hybridEnvelopeEngine } from '../hybrid/hybrid-envelope';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runNegativeTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING ADVERSARIAL & NEGATIVE CRYPTOGRAPHY TESTS');
  console.log('=====================================================================\n');

  const dsaKey = pqcMlDsa65.keygen();
  const validMsg = Buffer.from('VALID_INTENT_DATA_PAYLOAD', 'utf-8');
  const validSig = pqcMlDsa65.sign(validMsg, dsaKey.secretKey);

  // 1. Bit-flip tampering on signature
  console.log('[TEST 1] Single Bit-Flip Tampering on ML-DSA-65 Signature:');
  const tamperedSig = new Uint8Array(validSig);
  tamperedSig[42] ^= 0x01; // flip 1 bit
  const verifyTamperedSig = pqcMlDsa65.verify(tamperedSig, validMsg, dsaKey.publicKey);
  assert(verifyTamperedSig === false, 'Single bit-flip in signature mathematically rejected by lattice verifier');

  // 2. Tampered message payload
  console.log('\n[TEST 2] Message Modification Attack:');
  const tamperedMsg = Buffer.from('TAMPERED_MALICIOUS_INTENT_PAYLOAD', 'utf-8');
  const verifyTamperedMsg = pqcMlDsa65.verify(validSig, tamperedMsg, dsaKey.publicKey);
  assert(verifyTamperedMsg === false, 'Tampered payload rejected with existing signature');

  // 3. Wrong public key substitution attack
  console.log('\n[TEST 3] Public Key Substitution Attack:');
  const attackerKey = pqcMlDsa65.keygen();
  const verifyAttackerKey = pqcMlDsa65.verify(validSig, validMsg, attackerKey.publicKey);
  assert(verifyAttackerKey === false, 'Signature rejected when verified against unassociated public key');

  // 4. ML-KEM-768 Tampered Ciphertext Implicit Rejection
  console.log('\n[TEST 4] ML-KEM-768 Ciphertext Tampering (Fujisaki-Okamoto Transform):');
  const kemKey = pqcMlKem768.keygen();
  const { cipherText, sharedSecret: originalSecret } = pqcMlKem768.encapsulate(kemKey.publicKey);

  const tamperedCipherText = new Uint8Array(cipherText);
  tamperedCipherText[100] ^= 0xff; // corrupt ciphertext
  const decapsulatedTampered = pqcMlKem768.decapsulate(tamperedCipherText, kemKey.secretKey);

  assert(
    !Buffer.from(decapsulatedTampered).equals(Buffer.from(originalSecret)),
    'Corrupted ciphertext produces pseudorandom non-matching key (implicit rejection protection)'
  );

  // 5. Hybrid Envelope Partial Tampering Attack
  console.log('\n[TEST 5] Hybrid Envelope Partial Attack:');
  const hybridKey = hybridEnvelopeEngine.generateKeyPair();
  const envelope = hybridEnvelopeEngine.createEnvelope(validMsg, hybridKey);

  // Corrupt only the PQC signature in the envelope
  const corruptedEnvelope = {
    ...envelope,
    pqcSignatureBase58: envelope.pqcSignatureBase58.slice(0, -4) + 'AAAA',
  };
  const envResult = hybridEnvelopeEngine.verifyEnvelope(validMsg, corruptedEnvelope);
  assert(envResult.valid === false, 'Hybrid envelope rejected when PQC signature is corrupted');
  assert(envResult.failureReason === 'POST_QUANTUM_ML_DSA65_INVALID', 'Specific failure reason identified');

  console.log('\n=====================================================================');
  console.log('🏆 ALL ADVERSARIAL & NEGATIVE TESTS PASSED (5/5)');
  console.log('=====================================================================\n');
}

runNegativeTests().catch(err => {
  console.error(err);
  process.exit(1);
});

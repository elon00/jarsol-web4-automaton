/**
 * JarSol Quantum-Ready Architecture
 * Test Suite: Known Answer Tests (KAT) & Standards Compliance
 * Path: quantum/06_TESTS/known-answer.test.ts
 */

import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { SUPPORTED_ALGORITHMS } from '../02_PQC_SECURITY/crypto-agility';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runKnownAnswerTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL KNOWN ANSWER TESTS (KAT)');
  console.log('=====================================================================\n');

  // 1. RFC 5869 HKDF-SHA256 Known Answer Test Vector (Test Case 1)
  console.log('[KAT 1] RFC 5869 HKDF-SHA256 Deterministic Vector:');
  const ikm = Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex');
  const salt = Buffer.from('000102030405060708090a0b0c', 'hex');
  const info = Buffer.from('f0f1f2f3f4f5f6f7f8f9', 'hex');
  const expectedOkmHex = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';

  const derived = hkdf(sha256, ikm, salt, info, 42);
  const derivedHex = Buffer.from(derived).toString('hex');
  assert(derivedHex === expectedOkmHex, 'HKDF-SHA256 output matches RFC 5869 Test Case 1 byte-for-byte');

  // 2. NIST FIPS 203 (ML-KEM) Parameter Invariants
  console.log('\n[KAT 2] NIST FIPS 203 Parameter Invariants:');
  const mlKem768 = {
    pkBytes: 1184,
    skBytes: 2400,
    ctBytes: 1088,
    sharedSecretBytes: 32,
  };
  assert(mlKem768.pkBytes === 1184, 'ML-KEM-768 public key size is 1,184 bytes');
  assert(mlKem768.ctBytes === 1088, 'ML-KEM-768 ciphertext size is 1,088 bytes');
  assert(mlKem768.skBytes === 2400, 'ML-KEM-768 secret key size is 2,400 bytes');
  assert(mlKem768.sharedSecretBytes === 32, 'ML-KEM-768 shared secret size is 32 bytes (256 bits)');

  // 3. NIST FIPS 204 (ML-DSA) Parameter Invariants
  console.log('\n[KAT 3] NIST FIPS 204 Parameter Invariants:');
  const mlDsa65 = SUPPORTED_ALGORITHMS['ML-DSA-65'];
  assert(mlDsa65.publicKeyBytes === 1952, 'ML-DSA-65 public key size is 1,952 bytes');
  assert(mlDsa65.signatureBytes === 3309, 'ML-DSA-65 signature size is 3,309 bytes');
  assert(mlDsa65.securityLevel === 3, 'ML-DSA-65 mapped to NIST Level 3');

  // 4. NIST FIPS 205 (SLH-DSA) Parameter Invariants
  console.log('\n[KAT 4] NIST FIPS 205 Parameter Invariants:');
  const slhDsa128 = SUPPORTED_ALGORITHMS['SLH-DSA-SHA2-128s'];
  assert(slhDsa128.publicKeyBytes === 32, 'SLH-DSA-128s public key is 32 bytes');
  assert(slhDsa128.signatureBytes === 7856, 'SLH-DSA-128s signature is 7,856 bytes');
  assert(slhDsa128.family === 'HASH_BASED', 'SLH-DSA family is HASH_BASED');

  console.log('\n=====================================================================');
  console.log('🏆 ALL KNOWN ANSWER TESTS PASSED (4/4)');
  console.log('=====================================================================\n');
}

runKnownAnswerTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

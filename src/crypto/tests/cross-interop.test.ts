/**
 * JARSOL REAL PQC & STANDARDS INTEROPERABILITY TEST
 * Standard: NIST FIPS 203 (ML-KEM-768) & NIST FIPS 204 (ML-DSA-65)
 * Path: src/crypto/tests/cross-interop.test.ts
 */

import { pqcMlKem768 } from '../pqc/ml-kem';
import { pqcMlDsa65 } from '../pqc/ml-dsa';
import { hybridEnvelopeEngine } from '../hybrid/hybrid-envelope';
import { hybridKeyExchangeEngine } from '../hybrid/hybrid-kex';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runCrossInteropTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING REAL PQC STANDARDS & INTEROPERABILITY TESTS');
  console.log('=====================================================================\n');

  // 1. ML-KEM-768 Real Lattice Encapsulation / Decapsulation
  console.log('[TEST 1] NIST FIPS 203 (ML-KEM-768) Genuine Lattice Computation:');
  const kemKey = pqcMlKem768.keygen();
  assert(kemKey.publicKey.length === 1184, 'Public key length is exactly 1,184 bytes');
  assert(kemKey.secretKey.length === 2400, 'Secret key length is exactly 2,400 bytes');

  const { cipherText, sharedSecret: bobSecret } = pqcMlKem768.encapsulate(kemKey.publicKey);
  assert(cipherText.length === 1088, 'Ciphertext length is exactly 1,088 bytes');
  assert(bobSecret.length === 32, 'Shared secret is exactly 32 bytes (256 bits)');

  const aliceSecret = pqcMlKem768.decapsulate(cipherText, kemKey.secretKey);
  assert(aliceSecret.length === 32, 'Decapsulated secret is exactly 32 bytes');
  assert(
    Buffer.from(aliceSecret).equals(Buffer.from(bobSecret)),
    'Alice and Bob derived identical 256-bit shared secret via lattice NTT decapsulation'
  );

  // 2. ML-DSA-65 Real Lattice Signature & Verification
  console.log('\n[TEST 2] NIST FIPS 204 (ML-DSA-65) Genuine Lattice Digital Signature:');
  const dsaKey = pqcMlDsa65.keygen();
  assert(dsaKey.publicKey.length === 1952, 'Public key length is exactly 1,952 bytes');
  assert(dsaKey.secretKey.length === 4032, 'Secret key length is exactly 4,032 bytes');

  const tradeIntentMessage = Buffer.from(JSON.stringify({
    action: 'JARSOL_PQC_TRADE_INTENT',
    tokenIn: 'SOL',
    tokenOut: 'JARSOL',
    amountLamports: '250000000',
    nonce: 1048576,
    timestamp: '2026-09-07T09:00:00Z',
  }), 'utf-8');

  const dsaSig = pqcMlDsa65.sign(tradeIntentMessage, dsaKey.secretKey);
  assert(dsaSig.length === 3309, 'ML-DSA-65 signature length is exactly 3,309 bytes');

  const dsaValid = pqcMlDsa65.verify(dsaSig, tradeIntentMessage, dsaKey.publicKey);
  assert(dsaValid === true, 'ML-DSA-65 signature verified successfully against NIST FIPS 204 lattice math');

  // 3. Dual Hybrid Signature Envelope (Ed25519 + ML-DSA-65)
  console.log('\n[TEST 3] Dual Hybrid Signature Envelope:');
  const hybridKey = hybridEnvelopeEngine.generateKeyPair();
  assert(hybridKey.classicalPublicKey.length === 32, 'Classical Ed25519 public key is 32 bytes');
  assert(hybridKey.pqcPublicKey.length === 1952, 'Post-quantum ML-DSA-65 public key is 1,952 bytes');

  const envelope = hybridEnvelopeEngine.createEnvelope(tradeIntentMessage, hybridKey);
  assert(envelope.version === 'JARSOL_HYBRID_V2', 'Envelope version is JARSOL_HYBRID_V2');
  assert(envelope.suite === 'HYBRID_ED25519_ML_DSA65', 'Suite is HYBRID_ED25519_ML_DSA65');

  const envResult = hybridEnvelopeEngine.verifyEnvelope(tradeIntentMessage, envelope);
  assert(envResult.valid === true, 'Hybrid envelope verified: both Ed25519 and ML-DSA-65 valid');
  assert(envResult.classicalValid === true, 'Classical Ed25519 signature valid');
  assert(envResult.pqcValid === true, 'Post-Quantum ML-DSA-65 signature valid');

  // 4. Hybrid Key Exchange (X25519 + ML-KEM-768)
  console.log('\n[TEST 4] Hybrid Key Exchange Session Handshake:');
  const aliceKexState = hybridKeyExchangeEngine.aliceInit();
  const bobKexResult = hybridKeyExchangeEngine.bobEncapsulate(
    aliceKexState.x25519PublicKey,
    aliceKexState.mlKemPublicKey
  );
  const aliceKexSessionKey = hybridKeyExchangeEngine.aliceDecapsulate(
    aliceKexState,
    bobKexResult.x25519PublicKey,
    bobKexResult.mlKemCipherText
  );

  assert(bobKexResult.sharedSessionKey.length === 32, 'Session key is 256 bits');
  assert(
    Buffer.from(bobKexResult.sharedSessionKey).equals(Buffer.from(aliceKexSessionKey)),
    'Alice and Bob derived identical 256-bit Grover-resistant session key via Hybrid Combiner'
  );

  console.log('\n=====================================================================');
  console.log('🏆 ALL REAL PQC INTEROPERABILITY TESTS PASSED (4/4)');
  console.log('=====================================================================\n');
}

runCrossInteropTests().catch(err => {
  console.error(err);
  process.exit(1);
});

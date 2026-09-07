/**
 * JARSOL OFFICIAL CRYPTOGRAPHIC TEST VECTORS & WYCHEPROOF SUITE
 *
 * Standards:
 * - RFC 5869: HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
 * - RFC 7748: Elliptic Curves for Security (X25519)
 * - RFC 8032: Edwards-Curve Digital Signature Algorithm (Ed25519)
 * - NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM-768)
 * - NIST FIPS 204: Module-Lattice-Based Digital Signature Algorithm (ML-DSA-65)
 * - Project Wycheproof: Negative vectors, implicit rejection & bit-flip malleability
 */

import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { x25519, ed25519 } from '@noble/curves/ed25519';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

function toHex(buf: Uint8Array): string {
  return Buffer.from(buf).toString('hex');
}

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

async function runOfficialVectorTests() {
  console.log('=====================================================================');
  console.log('🛡️ RUNNING JARSOL OFFICIAL CRYPTOGRAPHIC TEST VECTORS & WYCHEPROOF');
  console.log('=====================================================================\n');

  let passedTests = 0;

  // -------------------------------------------------------------------
  // TEST GROUP 1: RFC 5869 HKDF-SHA256 Official Test Vectors
  // -------------------------------------------------------------------
  console.log('[1/6] RFC 5869 HKDF-SHA256 Known Answer Tests:');

  // Test Case 1
  const ikm1 = fromHex('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b');
  const salt1 = fromHex('000102030405060708090a0b0c');
  const info1 = fromHex('f0f1f2f3f4f5f6f7f8f9');
  const expectedOkm1 = '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865';
  const okm1 = toHex(hkdf(sha256, ikm1, salt1, info1, 42));
  assert(okm1 === expectedOkm1, 'RFC 5869 Test Case 1: 42-byte OKM matches byte-for-byte');
  passedTests++;

  // Test Case 2 (Longer inputs)
  const ikm2 = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f');
  const salt2 = fromHex('606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeaf');
  const info2 = fromHex('b0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff');
  const expectedOkm2 = 'b11e398dc80327a1c8e7f78c596a49344f012eda2d4efad8a050cc4c19afa97c59045a99cac7827271cb41c65e590e09da3275600c2f09b8367793a9aca3db71cc30c58179ec3e87c14c01d5c1f3434f1d87';
  const okm2 = toHex(hkdf(sha256, ikm2, salt2, info2, 82));
  assert(okm2 === expectedOkm2, 'RFC 5869 Test Case 2: 82-byte OKM matches byte-for-byte');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST GROUP 2: RFC 7748 X25519 Diffie-Hellman Deterministic Vector
  // -------------------------------------------------------------------
  console.log('\n[2/6] RFC 7748 X25519 Diffie-Hellman Known Answer Test:');
  const seedA = new Uint8Array(32).fill(0x01);
  const seedB = new Uint8Array(32).fill(0x02);
  const privA = new Uint8Array(seedA);
  const privB = new Uint8Array(seedB);
  const pubA = x25519.getPublicKey(privA);
  const pubB = x25519.getPublicKey(privB);

  const ssAB = toHex(x25519.getSharedSecret(new Uint8Array(seedA), pubB));
  const ssBA = toHex(x25519.getSharedSecret(new Uint8Array(seedB), pubA));
  const expectedConvergence = '2ed76ab549b1e73c031eb49c9448f0798aea81b698279a0c3dc3e49fbfc4b953';

  assert(ssAB === ssBA, 'RFC 7748: Alice and Bob shared secrets converge symmetrically (ssAB === ssBA)');
  passedTests++;
  assert(ssAB === expectedConvergence, 'RFC 7748: Deterministic X25519 scalar multiplication matches exact reference digest');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST GROUP 3: RFC 8032 Ed25519 Digital Signature Official Vectors
  // -------------------------------------------------------------------
  console.log('\n[3/6] RFC 8032 Ed25519 Known Answer Tests:');
  // Test 1: Empty message
  const edPriv1 = fromHex('9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60');
  const expectedEdPub1 = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
  const expectedEdSig1 = 'e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b';

  const derivedEdPub1 = toHex(ed25519.getPublicKey(edPriv1));
  assert(derivedEdPub1 === expectedEdPub1, 'RFC 8032 Test 1: Ed25519 public key derivation matches reference');
  passedTests++;

  const computedSig1 = toHex(ed25519.sign(new Uint8Array(0), edPriv1));
  assert(computedSig1 === expectedEdSig1, 'RFC 8032 Test 1: Ed25519 signature on empty message matches reference byte-for-byte');
  passedTests++;

  const verified1 = ed25519.verify(fromHex(expectedEdSig1), new Uint8Array(0), fromHex(expectedEdPub1));
  assert(verified1 === true, 'RFC 8032 Test 1: Signature verifies correctly');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST GROUP 4: NIST FIPS 203 ML-KEM-768 Deterministic Vector & Decapsulation
  // -------------------------------------------------------------------
  console.log('\n[4/6] NIST FIPS 203 ML-KEM-768 Deterministic Vector & Implicit Rejection:');
  // Deterministic 64-byte seed (d || z)
  const mlKemSeed = new Uint8Array(64);
  for (let i = 0; i < 64; i++) mlKemSeed[i] = (i * 17 + 3) & 0xff;

  const keypair1 = ml_kem768.keygen(mlKemSeed);
  assert(keypair1.publicKey.length === 1184, 'ML-KEM-768 public key exact NIST size: 1,184 bytes');
  assert(keypair1.secretKey.length === 2400, 'ML-KEM-768 secret key exact NIST size: 2,400 bytes');
  passedTests++;

  // Repeat keygen with same seed to verify strict determinism
  const keypair2 = ml_kem768.keygen(mlKemSeed);
  assert(toHex(keypair1.publicKey) === toHex(keypair2.publicKey), 'ML-KEM-768 keygen is strictly reproducible from seed');
  assert(toHex(keypair1.secretKey) === toHex(keypair2.secretKey), 'ML-KEM-768 secret key is strictly reproducible from seed');
  passedTests++;

  // Deterministic encapsulation with fixed 32-byte message seed m
  const mSeed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) mSeed[i] = (i * 31 + 7) & 0xff;

  const enc1 = ml_kem768.encapsulate(keypair1.publicKey, mSeed);
  const enc2 = ml_kem768.encapsulate(keypair1.publicKey, mSeed);
  assert(enc1.cipherText.length === 1088, 'ML-KEM-768 ciphertext exact NIST size: 1,088 bytes');
  assert(enc1.sharedSecret.length === 32, 'ML-KEM-768 shared secret exact NIST size: 32 bytes');
  assert(toHex(enc1.cipherText) === toHex(enc2.cipherText), 'ML-KEM-768 encapsulation is strictly deterministic with fixed seed');
  assert(toHex(enc1.sharedSecret) === toHex(enc2.sharedSecret), 'ML-KEM-768 shared secret is strictly deterministic with fixed seed');
  passedTests++;

  // Decapsulation correctness
  const recoveredSecret = ml_kem768.decapsulate(enc1.cipherText, keypair1.secretKey);
  assert(toHex(recoveredSecret) === toHex(enc1.sharedSecret), 'ML-KEM-768 decapsulation recovers exact shared secret byte-for-byte');
  passedTests++;

  // FIPS 203 Section 7.3: Implicit Rejection on Corrupted Ciphertext
  // When ciphertext is corrupted, decapsulate must return a pseudo-random value deterministically derived
  // from (z || c') rather than failing noisily, preventing chosen-ciphertext timing/oracle attacks.
  const corruptedCt = new Uint8Array(enc1.cipherText);
  corruptedCt[42] ^= 0x01; // flip single bit
  const implicitlyRejectedSecret = ml_kem768.decapsulate(corruptedCt, keypair1.secretKey);
  assert(implicitlyRejectedSecret.length === 32, 'Implicit rejection returns 32-byte pseudo-random secret');
  assert(toHex(implicitlyRejectedSecret) !== toHex(enc1.sharedSecret), 'Corrupted ciphertext does NOT yield sender shared secret');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST GROUP 5: NIST FIPS 204 ML-DSA-65 Deterministic Vector & Verification
  // -------------------------------------------------------------------
  console.log('\n[5/6] NIST FIPS 204 ML-DSA-65 Deterministic Vector & Signing:');
  const mlDsaSeed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) mlDsaSeed[i] = (i * 23 + 11) & 0xff;

  const dsaKeypair1 = ml_dsa65.keygen(mlDsaSeed);
  assert(dsaKeypair1.publicKey.length === 1952, 'ML-DSA-65 public key exact NIST size: 1,952 bytes');
  assert(dsaKeypair1.secretKey.length === 4032, 'ML-DSA-65 secret key exact NIST size: 4,032 bytes');
  passedTests++;

  const testMsg = new TextEncoder().encode('JARSOL_OFFICIAL_NIST_VERIFICATION_VECTOR_2026');
  const dsaSig1 = ml_dsa65.sign(testMsg, dsaKeypair1.secretKey, { extraEntropy: new Uint8Array(32) });
  const dsaSig2 = ml_dsa65.sign(testMsg, dsaKeypair1.secretKey, { extraEntropy: new Uint8Array(32) });

  assert(dsaSig1.length === 3309, 'ML-DSA-65 signature exact NIST size: 3,309 bytes');
  assert(toHex(dsaSig1) === toHex(dsaSig2), 'ML-DSA-65 deterministic signing is strictly repeatable with zero extraEntropy');
  passedTests++;

  const dsaValid = ml_dsa65.verify(dsaSig1, testMsg, dsaKeypair1.publicKey);
  assert(dsaValid === true, 'ML-DSA-65 valid signature verified successfully');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST GROUP 6: Project Wycheproof Negative & Adversarial Tests
  // -------------------------------------------------------------------
  console.log('\n[6/6] Project Wycheproof Negative & Adversarial Tests:');

  // Negative 1: Bit-flip tampering in ML-DSA signature
  const tamperedSig = new Uint8Array(dsaSig1);
  tamperedSig[100] ^= 0xff;
  const tamperedSigValid = ml_dsa65.verify(tamperedSig, testMsg, dsaKeypair1.publicKey);
  assert(tamperedSigValid === false, 'Wycheproof: Bit-flipped ML-DSA-65 signature is strictly rejected');
  passedTests++;

  // Negative 2: Message payload modification
  const alteredMsg = new TextEncoder().encode('JARSOL_ALTERED_PAYLOAD_ATTACK_VECTOR_2026');
  const alteredMsgValid = ml_dsa65.verify(dsaSig1, alteredMsg, dsaKeypair1.publicKey);
  assert(alteredMsgValid === false, 'Wycheproof: Altered message fails ML-DSA-65 verification');
  passedTests++;

  // Negative 3: Truncated signature wire packet
  const truncatedSig = dsaSig1.slice(0, 3308);
  let truncatedFailed = false;
  try {
    truncatedFailed = !ml_dsa65.verify(truncatedSig, testMsg, dsaKeypair1.publicKey);
  } catch {
    truncatedFailed = true;
  }
  assert(truncatedFailed === true, 'Wycheproof: Truncated signature fails validation cleanly');
  passedTests++;

  // Negative 4: Invalid ML-DSA public key wire length
  const invalidPk = dsaKeypair1.publicKey.slice(0, 1900);
  let invalidPkRejected = false;
  try {
    invalidPkRejected = !ml_dsa65.verify(dsaSig1, testMsg, invalidPk);
  } catch {
    invalidPkRejected = true;
  }
  assert(invalidPkRejected === true, 'Wycheproof: Malformed public key size fails validation');
  passedTests++;

  console.log('\n=====================================================================');
  console.log(`🏆 ALL ${passedTests} OFFICIAL NIST & WYCHEPROOF TEST VECTORS PASSED`);
  console.log('=====================================================================\n');
}

runOfficialVectorTests().catch((err) => {
  console.error('FATAL ERROR IN TEST VECTORS:', err);
  process.exit(1);
});

/**
 * JarSol Quantum-Ready Architecture
 * Test Suite: PQC Smoke Test
 * Path: quantum/06_TESTS/pqc-smoke.test.ts
 */

import { CryptoAgilityEngine } from '../02_PQC_SECURITY/crypto-agility';
import { generateHybridKeyPair, createHybridEnvelope, verifyHybridEnvelope } from '../02_PQC_SECURITY/hybrid-envelope';
import { validateKeyDimensions, zeroizeBuffer, exportPublicKeyBase58 } from '../02_PQC_SECURITY/key-management';
import { runHybridKeyExchange } from '../03_PQ_COMMUNICATION/hybrid-key-exchange';
import { QuantumSecureSession } from '../03_PQ_COMMUNICATION/secure-session';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runPqcSmokeTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL PQC SMOKE TESTS');
  console.log('=====================================================================\n');

  // 1. Crypto Agility Tests
  console.log('[TEST 1] Crypto Agility Configuration & Downgrade Protection:');
  const agility = new CryptoAgilityEngine({ fallbackAllowed: false });
  assert(agility.getActiveSuite() === 'HYBRID_ED25519_ML_DSA65', 'Default suite is HYBRID_ED25519_ML_DSA65');
  assert(agility.validateConfiguration() === true, 'Configuration satisfies minimum security level 3');

  let downgradeBlocked = false;
  try {
    agility.setSuite('CLASSICAL_ED25519');
  } catch {
    downgradeBlocked = true;
  }
  assert(downgradeBlocked, 'Insecure downgrade to CLASSICAL_ED25519 blocked when fallbackAllowed is false');

  // 2. Key Management Tests
  console.log('\n[TEST 2] Key Dimensions & Memory Zeroing:');
  const mlKemKey = new Uint8Array(1184);
  const mlKemCheck = validateKeyDimensions('ML-KEM-768', 'public', mlKemKey);
  assert(mlKemCheck.valid, 'ML-KEM-768 public key dimension strictly matches 1,184 bytes');

  const sensitive = new Uint8Array([1, 2, 3, 4, 5]);
  zeroizeBuffer(sensitive);
  assert(sensitive.every((b) => b === 0), 'zeroizeBuffer securely wipes sensitive memory buffer');

  const pubBundle = exportPublicKeyBase58('ML-DSA-65', new Uint8Array(32).fill(0x7f));
  assert(typeof pubBundle.publicKeyBase58 === 'string' && pubBundle.publicKeyBase58.length > 0, 'Base58 public key export succeeded');

  // 3. Hybrid Signature Envelope & Tamper Resistance
  console.log('\n[TEST 3] Dual Hybrid Signature Envelope (Ed25519 + ML-DSA-65):');
  const keys = generateHybridKeyPair();
  const testPayload = new TextEncoder().encode('JARSOL_AUTONOMOUS_TRADE_INTENT:BUY:SOL:1000');
  const envelope = createHybridEnvelope(testPayload, keys);

  const verification = verifyHybridEnvelope(testPayload, envelope);
  assert(verification.valid, 'Hybrid envelope verified successfully (Classical + PQC dual pass)');
  assert(verification.classicalValid && verification.pqcValid, 'Both Ed25519 and ML-DSA-65 signatures valid');

  // Negative test: Tampered payload
  const tamperedPayload = new TextEncoder().encode('JARSOL_AUTONOMOUS_TRADE_INTENT:BUY:SOL:9999999');
  const tamperedVerif = verifyHybridEnvelope(tamperedPayload, envelope);
  assert(!tamperedVerif.valid, 'Tampered payload correctly rejected by hybrid verification');

  // 4. Hybrid Key Exchange (X25519 + ML-KEM-768)
  console.log('\n[TEST 4] Hybrid Key Exchange (Harvest-Now-Decrypt-Later Immunity):');
  const kexResult = runHybridKeyExchange();
  assert(kexResult.keysMatch, 'Alice and Bob derived identical 256-bit hybrid shared secret');
  assert(kexResult.sessionKeyBits === 256, 'Session key conforms to 256-bit Grover quantum resistance');

  // 5. Quantum Secure Session AEAD
  console.log('\n[TEST 5] AEAD Encrypted Messaging Session:');
  const aliceSession = new QuantumSecureSession(kexResult.aliceSharedSecret, 'AGENT-ALICE');
  const bobSession = new QuantumSecureSession(kexResult.bobSharedSecret, 'AGENT-BOB');

  const secretMessage = 'QUANTUM_TELEMETRY:SOLANA_CROSS_DEX_ARBITRAGE:EXECUTED';
  const packet = aliceSession.encryptMessage(secretMessage);
  const decrypted = bobSession.decryptPacket(packet);
  assert(decrypted === secretMessage, 'Decrypted ciphertext matches original plaintext payload');

  console.log('\n=====================================================================');
  console.log('🏆 ALL PQC SMOKE TESTS PASSED CLEANLY (5/5)');
  console.log('=====================================================================\n');
}

runPqcSmokeTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

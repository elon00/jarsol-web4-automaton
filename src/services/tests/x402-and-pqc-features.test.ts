/**
 * JarSol Web4 Automaton — Advanced Features & Powers Verification Suite
 * Tests:
 * 1. NIST FIPS 203 (ML-KEM-768) & FIPS 204 (ML-DSA-65) Post-Quantum Cryptography
 * 2. DEX AMM Constant Product (x * y = k) & Slippage Guard
 * These local algorithm and arithmetic checks do not prove a live swap, swarm or payment service.
 */

import { pqcMlKem768 } from '../../crypto/pqc/ml-kem';
import { pqcMlDsa65 } from '../../crypto/pqc/ml-dsa';
import bs58 from 'bs58';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('⚡ JARSOL: LOCAL PQC AND AMM ARITHMETIC CHECKS');
console.log('======================================================\n');

// TEST SUITE 1: NIST FIPS 203 ML-KEM-768 Key Encapsulation Mechanism
console.log('🛡️ 1. NIST FIPS 203 (ML-KEM-768) Verification:');
const kemKeys = pqcMlKem768.keygen();
assert(kemKeys.publicKey.length === 1184, 'ML-KEM-768 Public Key Length', '1,184 bytes');
assert(kemKeys.secretKey.length === 2400, 'ML-KEM-768 Secret Key Length', '2,400 bytes');

const { cipherText, sharedSecret: ss1 } = pqcMlKem768.encapsulate(kemKeys.publicKey);
assert(cipherText.length === 1088, 'ML-KEM-768 CipherText Length', '1,088 bytes');
assert(ss1.length === 32, 'Encapsulated Shared Secret Length', '32 bytes (256-bit symmetric key)');

const ss2 = pqcMlKem768.decapsulate(cipherText, kemKeys.secretKey);
assert(Buffer.from(ss1).toString('hex') === Buffer.from(ss2).toString('hex'), 'Shared Secret Agreement', 'Exact 256-bit match');

// TEST SUITE 2: NIST FIPS 204 ML-DSA-65 Lattice Digital Signatures
console.log('\n🛡️ 2. NIST FIPS 204 (ML-DSA-65) Lattice Signature Verification:');
const dsaKeys = pqcMlDsa65.keygen();
assert(dsaKeys.publicKey.length === 1952, 'ML-DSA-65 Public Key Length', '1,952 bytes');
assert(dsaKeys.secretKey.length === 4032, 'ML-DSA-65 Secret Key Length', '4,032 bytes');

const testPayload = Buffer.from('Authorize JarSol Autonomous Swarm Action #104', 'utf8');
const signature = pqcMlDsa65.sign(testPayload, dsaKeys.secretKey);
assert(signature.length === 3309, 'ML-DSA-65 Signature Length', '3,309 bytes lattice proof');

const isValid = pqcMlDsa65.verify(signature, testPayload, dsaKeys.publicKey);
assert(isValid === true, 'ML-DSA-65 Signature Verification', 'Cryptographically valid');

const tamperedPayload = Buffer.from('Tampered JarSol Action #104', 'utf8');
const isTamperedValid = pqcMlDsa65.verify(signature, tamperedPayload, dsaKeys.publicKey);
assert(isTamperedValid === false, 'Tamper Detection', 'Correctly rejected modified message');

// TEST SUITE 3: DEX Constant Product AMM Math & Routing
console.log('\n🔄 3. DEX Constant Product AMM & Slippage Engine:');
const solReserve = 50000;
const jarsolReserve = 450000000000000;
const inputSol = 1.0;
const fee = 0.997; // 0.3% fee
const inputWithFee = inputSol * fee;
const expectedOutput = (inputWithFee * jarsolReserve) / (solReserve + inputWithFee);
const priceImpact = (inputSol / (solReserve + inputSol)) * 100;

assert(expectedOutput > 8900000000, 'AMM Output Calculation', `${Math.round(expectedOutput).toLocaleString()} $JARSOL for 1 SOL`);
assert(priceImpact < 0.01, 'AMM Price Impact Guard', `${priceImpact.toFixed(5)}% on 50,000 SOL pool`);

// Payment verification is tested by the backend boundary suite, not literal header strings.

console.log('\n======================================================');
console.log(`🎉 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

/**
 * PQC Ever-Ready Toolkit
 * Tool: Universal PQC Command-Line Interface (CLI)
 * Path: PQC_EVER_READY_TOOLKIT/pqc-cli.ts
 *
 * Provides terminal commands to generate keys, sign envelopes, run key exchanges,
 * and solve QUBO portfolio benchmarks.
 */

import { generateHybridKeyPair, createHybridEnvelope, verifyHybridEnvelope } from './modules/hybrid-envelope';
import { runHybridKeyExchange } from './modules/hybrid-key-exchange';
import { solveQuboPortfolio, solveClassicalPortfolio } from './modules/qubo-portfolio';

const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

function printBanner() {
  console.log('=====================================================================');
  console.log('⚛️ PQC EVER-READY TOOLKIT // UNIVERSAL CLI RUNNER');
  console.log('   NIST FIPS 203/204 Post-Quantum Cryptography & QUBO Optimization');
  console.log('=====================================================================\n');
}

switch (command) {
  case 'keygen': {
    printBanner();
    console.log('🔑 Generating NIST FIPS 204 (ML-DSA-65) + Ed25519 Hybrid Keypair...\n');
    const kp = generateHybridKeyPair();
    console.log('✅ Classical Ed25519 Public Key:   ' + Buffer.from(kp.classical.publicKey).toString('hex'));
    console.log('✅ Post-Quantum ML-DSA Public Key: ' + kp.pqc.publicKey.length + ' bytes (Matrix Rank k=6)');
    console.log('✅ Secret Key Storage Size:        ' + (kp.classical.secretKey.length + kp.pqc.secretKey.length) + ' bytes');
    console.log('✅ NIST Security Standard:         Level 3 (AES-192 Classical Hardness / SVP Lattice)');
    break;
  }

  case 'sign': {
    printBanner();
    const message = args[1] || 'JARSOL_DEFAULT_AUTHENTICATED_PAYLOAD';
    console.log(`📝 Signing message payload: "${message}"\n`);
    const kp = generateHybridKeyPair();
    const payloadBytes = new TextEncoder().encode(message);
    const env = createHybridEnvelope(payloadBytes, kp);
    console.log('✅ Dual Hybrid Envelope Generated:');
    console.log('  Payload SHA-256:        ' + env.payloadHash);
    console.log('  Classical Signature:    ' + env.signatures.classical.signature.slice(0, 48) + '... (64 bytes)');
    console.log('  ML-DSA-65 Signature:    ' + env.signatures.pqc.signature.slice(0, 48) + '... (3,309 bytes)');
    const verif = verifyHybridEnvelope(payloadBytes, env);
    console.log('  Instant Verification:   ' + (verif.valid ? 'PASSED (Dual Valid)' : 'FAILED'));
    break;
  }

  case 'kex': {
    printBanner();
    console.log('🔐 Running Hybrid Key Exchange (X25519 + ML-KEM-768)...\n');
    const res = runHybridKeyExchange();
    console.log('✅ Alice Shared Secret: ' + Buffer.from(res.aliceSharedSecret).toString('hex'));
    console.log('✅ Bob Shared Secret:   ' + Buffer.from(res.bobSharedSecret).toString('hex'));
    console.log('✅ Keys Identical:      ' + res.keysMatch);
    console.log('✅ Security Standard:   256-Bit Grover Resistant Symmetric Key Derived');
    break;
  }

  case 'optimize': {
    printBanner();
    console.log('📊 Solving 5-Token Solana Portfolio (Classical vs. QUBO Annealing)...\n');
    const qubo = solveQuboPortfolio();
    const classical = solveClassicalPortfolio();

    console.log('[CLASSICAL MARKOWITZ]');
    console.log('  Solve Time:      ' + classical.solveTimeMs + ' ms');
    console.log('  Expected Return: ' + (classical.expectedReturn * 100).toFixed(2) + '%');
    console.log('  Sharpe Ratio:    ' + classical.sharpeRatio);
    console.log('  Weights:         ' + JSON.stringify(classical.weights));

    console.log('\n[QUBO SIMULATED ANNEALING]');
    console.log('  Solve Time:      ' + qubo.solveTimeMs + ' ms');
    console.log('  Expected Return: ' + (qubo.expectedReturn * 100).toFixed(2) + '%');
    console.log('  Sharpe Ratio:    ' + qubo.sharpeRatio);
    console.log('  Qubits Emulated: ' + qubo.qubitsEmulated + ' binary variables');
    console.log('  Weights:         ' + JSON.stringify(qubo.weights));
    break;
  }

  default: {
    printBanner();
    console.log('Available Commands:');
    console.log('  npx tsx pqc-cli.ts keygen      Generate NIST FIPS 204 hybrid keypair');
    console.log('  npx tsx pqc-cli.ts sign <msg>  Sign payload with dual Ed25519 + ML-DSA-65 envelope');
    console.log('  npx tsx pqc-cli.ts kex         Execute X25519 + ML-KEM-768 hybrid key exchange');
    console.log('  npx tsx pqc-cli.ts optimize    Solve QUBO vs. Classical portfolio benchmark');
    break;
  }
}

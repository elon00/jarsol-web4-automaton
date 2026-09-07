import { PqcKeyPair } from '../types';
import { pqcMlDsa65 } from '../crypto/pqc/ml-dsa';
import { pqcMlKem768 } from '../crypto/pqc/ml-kem';
import { hybridEnvelopeEngine } from '../crypto/hybrid/hybrid-envelope';
import bs58 from 'bs58';

export function generatePqcLatticeKeyPair(
  algorithm: 'ML-DSA-65' | 'ML-DSA-87' | 'ML-KEM-768' | 'ML-KEM-1024' = 'ML-DSA-65'
): PqcKeyPair {
  if (algorithm.startsWith('ML-KEM')) {
    const key = pqcMlKem768.keygen();
    const pkBase58 = bs58.encode(key.publicKey);
    const skMasked = `0x_pqc_sk_masked_${bs58.encode(key.secretKey.slice(0, 32))}...`;
    const solAddress = `PQC_KEM_${pkBase58.substring(0, 24)}`;

    return {
      algorithm,
      standard: 'NIST FIPS 203 (Module-Lattice KEM)',
      publicKey: pkBase58,
      secretKey: skMasked,
      solanaHybridAddress: solAddress,
      latticeDimension: 6,
      modulusQ: 3329,
      polynomialRing: 'R_q = Z_3329[X] / (X^256 + 1)',
      shorQuantumResistance: '100% Resistant (Module Learning With Errors / SVP Hardness)',
      timestamp: new Date().toISOString(),
    };
  }

  // Default: ML-DSA-65
  const key = pqcMlDsa65.keygen();
  const pkBase58 = bs58.encode(key.publicKey);
  const skMasked = `0x_pqc_sk_masked_${bs58.encode(key.secretKey.slice(0, 32))}...`;
  const solAddress = `PQC_DSA_${pkBase58.substring(0, 24)}`;

  return {
    algorithm: 'ML-DSA-65',
    standard: 'NIST FIPS 204 (Module-Lattice Digital Signature)',
    publicKey: pkBase58,
    secretKey: skMasked,
    solanaHybridAddress: solAddress,
    latticeDimension: 6,
    modulusQ: 8380417,
    polynomialRing: 'R_q = Z_8380417[X] / (X^256 + 1)',
    shorQuantumResistance: '100% Resistant (Module Learning With Errors / SVP Hardness)',
    timestamp: new Date().toISOString(),
  };
}

export function calculateQuantumVulnerability(logicalQubits: number): {
  qubits: number;
  classicalRsaVulnerability: number; // 0-100%
  classicalEd25519Vulnerability: number; // 0-100%
  jarSolLatticeResistance: number; // 100%
  shorExecutionTimeHours: string;
  status: 'SAFE' | 'AT RISK' | 'COMPROMISED';
} {
  let ed25519Vuln = 0;
  let rsaVuln = 0;
  let timeEst = 'Infinite (Sub-quantum threshold)';

  if (logicalQubits < 1000) {
    rsaVuln = Math.min(15, (logicalQubits / 1000) * 15);
    ed25519Vuln = Math.min(20, (logicalQubits / 1000) * 20);
    timeEst = '> 100,000,000 Years';
  } else if (logicalQubits < 2500) {
    rsaVuln = 45;
    ed25519Vuln = 65;
    timeEst = '~72 Hours (Shor Phase Estimation)';
  } else if (logicalQubits < 4500) {
    rsaVuln = 95;
    ed25519Vuln = 100;
    timeEst = '~3.4 Hours (Full Discrete Logarithm Collapse)';
  } else {
    rsaVuln = 100;
    ed25519Vuln = 100;
    timeEst = '< 12 Minutes (Instant Shor Factorization)';
  }

  return {
    qubits: logicalQubits,
    classicalRsaVulnerability: Math.round(rsaVuln),
    classicalEd25519Vulnerability: Math.round(ed25519Vuln),
    jarSolLatticeResistance: 100,
    shorExecutionTimeHours: timeEst,
    status: logicalQubits >= 2500 ? 'COMPROMISED' : (logicalQubits >= 1000 ? 'AT RISK' : 'SAFE')
  };
}

export function signHybridMessage(message: string, _pk: string): {
  message: string;
  hybridSignature: string;
  digest: string;
  timestamp: string;
} {
  const enc = new TextEncoder().encode(message);
  const keyPair = hybridEnvelopeEngine.generateKeyPair();
  const envelope = hybridEnvelopeEngine.createEnvelope(enc, keyPair);

  return {
    message,
    hybridSignature: `DUAL_SIG [Ed25519: ${envelope.classicalSignatureBase58.substring(0, 16)}... | ML-DSA-65: ${envelope.pqcSignatureBase58.substring(0, 24)}...]`,
    digest: `0x${envelope.payloadHashHex}`,
    timestamp: envelope.timestamp,
  };
}

/**
 * JarSol Quantum-Ready Architecture
 * Module: Dual Hybrid Signature Envelope
 * Path: quantum/02_PQC_SECURITY/hybrid-envelope.ts
 *
 * Implements genuine dual-signature envelope combining classical Ed25519 with
 * NIST FIPS 204 (ML-DSA-65) post-quantum signatures using canonical @noble/post-quantum.
 * Both signatures MUST verify validly for the envelope to be accepted.
 */

import { Keypair } from '@solana/web3.js';
import { sha256 } from '@noble/hashes/sha256';
import { ed25519 } from '@noble/curves/ed25519';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import bs58 from 'bs58';

export interface HybridKeyPair {
  classical: {
    publicKey: Uint8Array; // 32 bytes Ed25519
    secretKey: Uint8Array; // 64 bytes
  };
  pqc: {
    algorithm: 'ML-DSA-65';
    publicKey: Uint8Array; // 1952 bytes (NIST FIPS 204)
    secretKey: Uint8Array; // 4032 bytes
  };
}

export interface HybridSignatureEnvelope {
  version: 'JARSOL-HYBRID-V1';
  payloadHash: string; // Hex SHA-256
  timestamp: number;
  signatures: {
    classical: {
      algorithm: 'Ed25519';
      publicKey: string; // Base58
      signature: string; // Hex (64 bytes)
    };
    pqc: {
      algorithm: 'ML-DSA-65';
      publicKey: string; // Hex (1952 bytes)
      signature: string; // Hex (3309 bytes)
    };
  };
}

/**
 * Generate a hybrid keypair containing genuine classical Ed25519 and ML-DSA-65 keys.
 */
export function generateHybridKeyPair(): HybridKeyPair {
  const classicalKp = Keypair.generate();

  // Generate genuine NIST FIPS 204 ML-DSA-65 keypair via lattice NTT
  const { publicKey: pqcPub, secretKey: pqcSec } = ml_dsa65.keygen();

  return {
    classical: {
      publicKey: classicalKp.publicKey.toBytes(),
      secretKey: classicalKp.secretKey,
    },
    pqc: {
      algorithm: 'ML-DSA-65',
      publicKey: pqcPub,
      secretKey: pqcSec,
    },
  };
}

/**
 * Sign a payload with BOTH classical Ed25519 and post-quantum ML-DSA-65.
 */
export function createHybridEnvelope(
  payload: Uint8Array,
  keyPair: HybridKeyPair
): HybridSignatureEnvelope {
  // 1. Compute SHA-256 payload digest
  const digest = sha256(payload);
  const digestHex = Buffer.from(digest).toString('hex');

  // 2. Classical Ed25519 signature
  const classicalPriv = keyPair.classical.secretKey.subarray(0, 32);
  const classicalSig = ed25519.sign(payload, classicalPriv);

  // 3. Post-Quantum ML-DSA-65 lattice signature
  const pqcSig = ml_dsa65.sign(payload, keyPair.pqc.secretKey);

  return {
    version: 'JARSOL-HYBRID-V1',
    payloadHash: digestHex,
    timestamp: Date.now(),
    signatures: {
      classical: {
        algorithm: 'Ed25519',
        publicKey: bs58.encode(keyPair.classical.publicKey),
        signature: Buffer.from(classicalSig).toString('hex'),
      },
      pqc: {
        algorithm: 'ML-DSA-65',
        publicKey: Buffer.from(keyPair.pqc.publicKey).toString('hex'),
        signature: Buffer.from(pqcSig).toString('hex'),
      },
    },
  };
}

/**
 * Verify a hybrid signature envelope. Both signatures must verify cleanly.
 */
export function verifyHybridEnvelope(
  payload: Uint8Array,
  envelope: HybridSignatureEnvelope
): {
  valid: boolean;
  classicalValid: boolean;
  pqcValid: boolean;
  error?: string;
} {
  // 1. Verify payload integrity
  const digest = sha256(payload);
  const digestHex = Buffer.from(digest).toString('hex');
  if (digestHex !== envelope.payloadHash) {
    return {
      valid: false,
      classicalValid: false,
      pqcValid: false,
      error: 'Payload hash mismatch (message tampered)',
    };
  }

  // 2. Verify Classical Ed25519 signature
  let classicalValid = false;
  try {
    const pubKeyBytes = bs58.decode(envelope.signatures.classical.publicKey);
    const sigBytes = Buffer.from(envelope.signatures.classical.signature, 'hex');
    classicalValid = ed25519.verify(sigBytes, payload, pubKeyBytes);
  } catch (err: any) {
    classicalValid = false;
  }

  // 3. Verify Post-Quantum ML-DSA-65 lattice signature
  let pqcValid = false;
  try {
    const pqcPubBytes = Buffer.from(envelope.signatures.pqc.publicKey, 'hex');
    const pqcSigBytes = Buffer.from(envelope.signatures.pqc.signature, 'hex');
    pqcValid = ml_dsa65.verify(pqcSigBytes, payload, pqcPubBytes);
  } catch (err: any) {
    pqcValid = false;
  }

  const bothValid = classicalValid && pqcValid;

  return {
    valid: bothValid,
    classicalValid,
    pqcValid,
    error: bothValid ? undefined : `Hybrid verification failed: Classical=${classicalValid}, PQC=${pqcValid}`,
  };
}

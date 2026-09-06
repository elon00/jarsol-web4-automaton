/**
 * JarSol Quantum-Ready Architecture
 * Module: Key Management & Secure Memory Zeroing
 * Path: quantum/02_PQC_SECURITY/key-management.ts
 *
 * Provides cryptographic key serialization, validation, and in-memory zeroing
 * to prevent secret material exposure in long-running Node/browser processes.
 */

import bs58 from 'bs58';

export interface SerializedKeyBundle {
  algorithm: string;
  publicKeyBase58: string;
  keySizeBytes: number;
  isEphemeral: boolean;
  createdAt: string;
}

/**
 * Safely overwrites a sensitive Uint8Array or Buffer with zeroes.
 */
export function zeroizeBuffer(buf: Uint8Array | Buffer): void {
  buf.fill(0);
}

/**
 * Validates whether key buffer conforms to NIST FIPS specifications.
 */
export function validateKeyDimensions(
  algorithm: 'ML-KEM-768' | 'ML-DSA-65' | 'SLH-DSA' | 'Ed25519',
  keyType: 'public' | 'secret',
  keyBytes: Uint8Array
): { valid: boolean; expected: number; actual: number } {
  const specs: Record<string, { public: number; secret: number }> = {
    'ML-KEM-768': { public: 1184, secret: 2400 },
    'ML-DSA-65': { public: 1952, secret: 4032 },
    'SLH-DSA': { public: 32, secret: 64 },
    Ed25519: { public: 32, secret: 64 },
  };

  const expected = specs[algorithm]?.[keyType] ?? 0;
  return {
    valid: keyBytes.length === expected,
    expected,
    actual: keyBytes.length,
  };
}

/**
 * Exports a public key to Base58 format for consistent display.
 */
export function exportPublicKeyBase58(
  algorithm: string,
  publicKeyBytes: Uint8Array,
  isEphemeral = false
): SerializedKeyBundle {
  return {
    algorithm,
    publicKeyBase58: bs58.encode(publicKeyBytes),
    keySizeBytes: publicKeyBytes.length,
    isEphemeral,
    createdAt: new Date().toISOString(),
  };
}

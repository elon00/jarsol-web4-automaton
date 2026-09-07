/**
 * JarSol Quantum-Ready Architecture
 * Module: Hybrid Key Exchange (X25519 + ML-KEM-768)
 * Path: quantum/03_PQ_COMMUNICATION/hybrid-key-exchange.ts
 *
 * Implements genuine dual-KEM key establishment combining classical X25519 with
 * NIST FIPS 203 (ML-KEM-768) using canonical @noble/post-quantum.
 * Produces a 256-bit symmetric key immune to "Harvest Now, Decrypt Later" attacks.
 */

import * as crypto from 'crypto';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

export interface AliceKeyExchangeState {
  x25519KeyPair: crypto.KeyPairSyncResult<Buffer, Buffer>;
  mlKemPublicKey: Uint8Array; // 1184 bytes
  mlKemSecretKey: Uint8Array; // 2400 bytes
}

export interface BobEncapsulationResult {
  x25519PublicKeyHex: string;
  mlKemCiphertext: Uint8Array; // 1088 bytes
  sharedSecret256: Uint8Array; // 32 bytes derived key
}

export interface HybridKeyExchangeResult {
  aliceSharedSecret: Uint8Array;
  bobSharedSecret: Uint8Array;
  keysMatch: boolean;
  algorithm: 'HYBRID-X25519-ML-KEM-768';
  fipsStandard: 'NIST FIPS 203';
  sessionKeyBits: 256;
}

/**
 * Step 1: Alice generates genuine ephemeral classical X25519 and ML-KEM-768 keypairs.
 */
export function aliceInit(): AliceKeyExchangeState {
  const x25519KeyPair = crypto.generateKeyPairSync('x25519');

  // Genuine NIST FIPS 203 ML-KEM-768 lattice keypair
  const { publicKey: mlKemPublicKey, secretKey: mlKemSecretKey } = ml_kem768.keygen();

  return {
    x25519KeyPair,
    mlKemPublicKey,
    mlKemSecretKey,
  };
}

/**
 * Step 2: Bob encapsulates a shared secret using Alice's public keys.
 */
export function bobEncapsulate(aliceState: AliceKeyExchangeState): BobEncapsulationResult {
  // Classical X25519 Diffie-Hellman
  const bobX25519 = crypto.generateKeyPairSync('x25519');
  const classicalSecret = crypto.diffieHellman({
    privateKey: bobX25519.privateKey,
    publicKey: aliceState.x25519KeyPair.publicKey,
  });

  // Genuine NIST FIPS 203 ML-KEM-768 encapsulation
  const { cipherText: mlKemCiphertext, sharedSecret: pqcSecret } = ml_kem768.encapsulate(aliceState.mlKemPublicKey);

  // Combine secrets via RFC 5869 HKDF-SHA256
  const combinedSecret = Buffer.concat([classicalSecret, Buffer.from(pqcSecret)]);
  const salt = Buffer.alloc(32, 0); // Zero-salt per standard RFC 5869
  const info = Buffer.from('JARSOL_HYBRID_KEX_V1', 'utf-8');
  const derivedKey = hkdf(sha256, combinedSecret, salt, info, 32);

  return {
    x25519PublicKeyHex: bobX25519.publicKey.export({ type: 'spki', format: 'der' }).toString('hex'),
    mlKemCiphertext,
    sharedSecret256: derivedKey,
  };
}

/**
 * Step 3: Alice decapsulates Bob's ciphertext and derives the identical shared key.
 */
export function aliceDecapsulate(
  aliceState: AliceKeyExchangeState,
  bobResult: BobEncapsulationResult
): Uint8Array {
  // Classical X25519 Diffie-Hellman
  const bobPubDer = Buffer.from(bobResult.x25519PublicKeyHex, 'hex');
  const bobPublicKey = crypto.createPublicKey({ key: bobPubDer, format: 'der', type: 'spki' });
  const classicalSecret = crypto.diffieHellman({
    privateKey: aliceState.x25519KeyPair.privateKey,
    publicKey: bobPublicKey,
  });

  // Genuine NIST FIPS 203 ML-KEM-768 decapsulation
  const pqcSecret = ml_kem768.decapsulate(bobResult.mlKemCiphertext, aliceState.mlKemSecretKey);

  // Combine secrets via RFC 5869 HKDF-SHA256
  const combinedSecret = Buffer.concat([classicalSecret, Buffer.from(pqcSecret)]);
  const salt = Buffer.alloc(32, 0);
  const info = Buffer.from('JARSOL_HYBRID_KEX_V1', 'utf-8');
  return hkdf(sha256, combinedSecret, salt, info, 32);
}

/**
 * Convenience runner executing full end-to-end handshake.
 */
export function runHybridKeyExchange(): HybridKeyExchangeResult {
  const alice = aliceInit();
  const bob = bobEncapsulate(alice);
  const aliceDerived = aliceDecapsulate(alice, bob);

  const keysMatch = Buffer.from(aliceDerived).equals(Buffer.from(bob.sharedSecret256));

  return {
    aliceSharedSecret: aliceDerived,
    bobSharedSecret: bob.sharedSecret256,
    keysMatch,
    algorithm: 'HYBRID-X25519-ML-KEM-768',
    fipsStandard: 'NIST FIPS 203',
    sessionKeyBits: 256,
  };
}

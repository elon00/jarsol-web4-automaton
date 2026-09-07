/**
 * JARSOL CRYPTOGRAPHIC ABSTRACTION LAYER
 * Standard: Reality-First, Standards-Conformant PQC (NIST FIPS 203 & 204)
 *
 * Defines unified interfaces for classical, post-quantum, and hybrid cryptographic engines.
 */

export interface KeyPairBytes {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface KemEncapsulationResult {
  cipherText: Uint8Array;
  sharedSecret: Uint8Array;
}

export interface PqcKemProvider {
  readonly algorithm: string;
  readonly standard: string;
  readonly securityLevel: number;
  readonly publicKeyBytes: number;
  readonly secretKeyBytes: number;
  readonly cipherTextBytes: number;
  readonly sharedSecretBytes: number;

  keygen(): KeyPairBytes;
  encapsulate(publicKey: Uint8Array): KemEncapsulationResult;
  decapsulate(cipherText: Uint8Array, secretKey: Uint8Array): Uint8Array;
}

export interface PqcSignatureProvider {
  readonly algorithm: string;
  readonly standard: string;
  readonly securityLevel: number;
  readonly publicKeyBytes: number;
  readonly secretKeyBytes: number;
  readonly signatureBytes: number;

  keygen(): KeyPairBytes;
  sign(msg: Uint8Array, secretKey: Uint8Array): Uint8Array;
  verify(sig: Uint8Array, msg: Uint8Array, publicKey: Uint8Array): boolean;
}

export interface ClassicalSignatureProvider {
  readonly algorithm: 'Ed25519';
  keygen(): { publicKey: Uint8Array; privateKey: Uint8Array };
  sign(msg: Uint8Array, privateKey: Uint8Array): Uint8Array;
  verify(sig: Uint8Array, msg: Uint8Array, publicKey: Uint8Array): boolean;
}

export interface ClassicalKeyExchangeProvider {
  readonly algorithm: 'X25519';
  keygen(): { publicKey: Uint8Array; privateKey: Uint8Array };
  computeSharedSecret(ourPrivateKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array;
}

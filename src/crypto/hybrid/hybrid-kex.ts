/**
 * Hybrid Key Exchange: X25519 + ML-KEM-768
 * Standard: Reality-First PQC Security (NIST FIPS 203 + RFC 7748 + RFC 5869)
 *
 * Implements dual forward-secure key establishment for autonomous agent communication.
 * Provides Harvest-Now-Decrypt-Later (HNDL) immunity.
 */

import { canonicalCryptoRegistry } from '../provider/provider-registry';
import { combineHybridSecrets } from '../classical/hkdf';

export interface AliceHybridState {
  x25519PrivateKey: Uint8Array;
  x25519PublicKey: Uint8Array;
  mlKemPrivateKey: Uint8Array;
  mlKemPublicKey: Uint8Array;
}

export interface BobInitiationResult {
  x25519PublicKey: Uint8Array;
  mlKemCipherText: Uint8Array;
  sharedSessionKey: Uint8Array;
}

export class HybridKeyExchangeEngine {
  private registry = canonicalCryptoRegistry;

  /**
   * Alice creates her long-term or ephemeral hybrid public keys.
   */
  public aliceInit(): AliceHybridState {
    const xKey = this.registry.classicalKeyExchange.keygen();
    const kemKey = this.registry.kem.keygen();

    return {
      x25519PrivateKey: xKey.privateKey,
      x25519PublicKey: xKey.publicKey,
      mlKemPrivateKey: kemKey.secretKey,
      mlKemPublicKey: kemKey.publicKey,
    };
  }

  /**
   * Bob encapsulates to Alice's public keys and derives his shared session key.
   */
  public bobEncapsulate(
    aliceX25519Pub: Uint8Array,
    aliceMlKemPub: Uint8Array
  ): BobInitiationResult {
    // 1. Classical X25519 ephemeral keygen and ECDH
    const bobXKey = this.registry.classicalKeyExchange.keygen();
    const classicalSecret = this.registry.classicalKeyExchange.computeSharedSecret(
      bobXKey.privateKey,
      aliceX25519Pub
    );

    // 2. Post-Quantum ML-KEM-768 encapsulation
    const { cipherText, sharedSecret: pqcSecret } = this.registry.kem.encapsulate(aliceMlKemPub);

    // 3. HKDF-SHA256 Combiner
    const sharedSessionKey = combineHybridSecrets(classicalSecret, pqcSecret);

    return {
      x25519PublicKey: bobXKey.publicKey,
      mlKemCipherText: cipherText,
      sharedSessionKey,
    };
  }

  /**
   * Alice decapsulates Bob's ciphertext and derives the identical shared session key.
   */
  public aliceDecapsulate(
    aliceState: AliceHybridState,
    bobX25519Pub: Uint8Array,
    bobMlKemCipherText: Uint8Array
  ): Uint8Array {
    // 1. Classical X25519 ECDH
    const classicalSecret = this.registry.classicalKeyExchange.computeSharedSecret(
      aliceState.x25519PrivateKey,
      bobX25519Pub
    );

    // 2. Post-Quantum ML-KEM-768 decapsulation
    const pqcSecret = this.registry.kem.decapsulate(
      bobMlKemCipherText,
      aliceState.mlKemPrivateKey
    );

    // 3. HKDF-SHA256 Combiner
    return combineHybridSecrets(classicalSecret, pqcSecret);
  }
}

export const hybridKeyExchangeEngine = new HybridKeyExchangeEngine();

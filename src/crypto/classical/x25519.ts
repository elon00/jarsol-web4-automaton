/**
 * Classical X25519 Diffie-Hellman Key Agreement
 * Conforms to RFC 7748.
 */

import { x25519 } from '@noble/curves/ed25519';
import { ClassicalKeyExchangeProvider } from '../provider/CryptoProvider';

export class NobleX25519Provider implements ClassicalKeyExchangeProvider {
  public readonly algorithm = 'X25519' as const;

  public keygen(): { publicKey: Uint8Array; privateKey: Uint8Array } {
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);
    return { publicKey, privateKey };
  }

  public computeSharedSecret(ourPrivateKey: Uint8Array, theirPublicKey: Uint8Array): Uint8Array {
    return x25519.getSharedSecret(ourPrivateKey, theirPublicKey);
  }
}

export const classicalX25519 = new NobleX25519Provider();

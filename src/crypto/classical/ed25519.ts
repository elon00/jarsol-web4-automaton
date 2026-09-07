/**
 * Classical Ed25519 Digital Signatures
 * Conforms to RFC 8032 and Solana transaction signature requirements.
 */

import { ed25519 } from '@noble/curves/ed25519';
import { ClassicalSignatureProvider } from '../provider/CryptoProvider';

export class NobleEd25519Provider implements ClassicalSignatureProvider {
  public readonly algorithm = 'Ed25519' as const;

  public keygen(): { publicKey: Uint8Array; privateKey: Uint8Array } {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    return { publicKey, privateKey };
  }

  public sign(msg: Uint8Array, privateKey: Uint8Array): Uint8Array {
    return ed25519.sign(msg, privateKey);
  }

  public verify(sig: Uint8Array, msg: Uint8Array, publicKey: Uint8Array): boolean {
    try {
      return ed25519.verify(sig, msg, publicKey);
    } catch {
      return false;
    }
  }
}

export const classicalEd25519 = new NobleEd25519Provider();

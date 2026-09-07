/**
 * Post-Quantum Digital Signatures: ML-DSA-65
 * Standard: NIST FIPS 204 (Module-Lattice-Based Digital Signature Algorithm)
 * Security Level: NIST Category 3 (128-bit quantum collision & forgery resistance)
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { PqcSignatureProvider, KeyPairBytes } from '../provider/CryptoProvider';

export class NobleMlDsa65Provider implements PqcSignatureProvider {
  public readonly algorithm = 'ML-DSA-65' as const;
  public readonly standard = 'NIST FIPS 204' as const;
  public readonly securityLevel = 3;
  public readonly publicKeyBytes = 1952;
  public readonly secretKeyBytes = 4032;
  public readonly signatureBytes = 3309;

  public keygen(): KeyPairBytes {
    const { publicKey, secretKey } = ml_dsa65.keygen();
    return { publicKey, secretKey };
  }

  public sign(msg: Uint8Array, secretKey: Uint8Array): Uint8Array {
    if (secretKey.length !== this.secretKeyBytes) {
      throw new Error(`Invalid ML-DSA-65 secret key length: expected ${this.secretKeyBytes}, got ${secretKey.length}`);
    }
    return ml_dsa65.sign(msg, secretKey);
  }

  public verify(sig: Uint8Array, msg: Uint8Array, publicKey: Uint8Array): boolean {
    if (publicKey.length !== this.publicKeyBytes) {
      return false;
    }
    if (sig.length !== this.signatureBytes) {
      return false;
    }
    try {
      return ml_dsa65.verify(sig, msg, publicKey);
    } catch {
      return false;
    }
  }
}

export const pqcMlDsa65 = new NobleMlDsa65Provider();

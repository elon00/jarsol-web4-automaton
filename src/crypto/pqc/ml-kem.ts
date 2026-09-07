/**
 * Post-Quantum Key Encapsulation: ML-KEM-768
 * Standard: NIST FIPS 203 (Module-Lattice-Based Key-Encapsulation Mechanism)
 * Security Level: NIST Category 3 (128-bit quantum security against Grover's algorithm)
 */

import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { PqcKemProvider, KeyPairBytes, KemEncapsulationResult } from '../provider/CryptoProvider';

export class NobleMlKem768Provider implements PqcKemProvider {
  public readonly algorithm = 'ML-KEM-768' as const;
  public readonly standard = 'NIST FIPS 203' as const;
  public readonly securityLevel = 3;
  public readonly publicKeyBytes = 1184;
  public readonly secretKeyBytes = 2400;
  public readonly cipherTextBytes = 1088;
  public readonly sharedSecretBytes = 32;

  public keygen(): KeyPairBytes {
    const { publicKey, secretKey } = ml_kem768.keygen();
    return { publicKey, secretKey };
  }

  public encapsulate(publicKey: Uint8Array): KemEncapsulationResult {
    if (publicKey.length !== this.publicKeyBytes) {
      throw new Error(`Invalid ML-KEM-768 public key length: expected ${this.publicKeyBytes}, got ${publicKey.length}`);
    }
    const { cipherText, sharedSecret } = ml_kem768.encapsulate(publicKey);
    return { cipherText, sharedSecret };
  }

  public decapsulate(cipherText: Uint8Array, secretKey: Uint8Array): Uint8Array {
    if (cipherText.length !== this.cipherTextBytes) {
      throw new Error(`Invalid ML-KEM-768 ciphertext length: expected ${this.cipherTextBytes}, got ${cipherText.length}`);
    }
    if (secretKey.length !== this.secretKeyBytes) {
      throw new Error(`Invalid ML-KEM-768 secret key length: expected ${this.secretKeyBytes}, got ${secretKey.length}`);
    }
    return ml_kem768.decapsulate(cipherText, secretKey);
  }
}

export const pqcMlKem768 = new NobleMlKem768Provider();

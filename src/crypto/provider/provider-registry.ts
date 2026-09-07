/**
 * Provider Registry & Algorithm Agility Configuration
 */

import { PqcKemProvider, PqcSignatureProvider, ClassicalSignatureProvider, ClassicalKeyExchangeProvider } from './CryptoProvider';
import { pqcMlKem768 } from '../pqc/ml-kem';
import { pqcMlDsa65 } from '../pqc/ml-dsa';
import { classicalEd25519 } from '../classical/ed25519';
import { classicalX25519 } from '../classical/x25519';

export interface CryptoSuiteRegistry {
  kem: PqcKemProvider;
  pqcSignature: PqcSignatureProvider;
  classicalSignature: ClassicalSignatureProvider;
  classicalKeyExchange: ClassicalKeyExchangeProvider;
}

export const canonicalCryptoRegistry: CryptoSuiteRegistry = {
  kem: pqcMlKem768,
  pqcSignature: pqcMlDsa65,
  classicalSignature: classicalEd25519,
  classicalKeyExchange: classicalX25519,
};

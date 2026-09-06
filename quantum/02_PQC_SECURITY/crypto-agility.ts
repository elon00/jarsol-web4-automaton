/**
 * JarSol Quantum-Ready Architecture
 * Module: Crypto Agility Container
 * Path: quantum/02_PQC_SECURITY/crypto-agility.ts
 *
 * Provides a runtime abstraction container that allows autonomous agents and
 * protocol components to switch between Classical, Hybrid, and Pure PQC
 * cryptographic suites without refactoring upstream application code.
 */

export type CipherSuite = 'CLASSICAL_ED25519' | 'HYBRID_ED25519_ML_DSA65' | 'PURE_PQC_ML_DSA65';

export interface CryptoAgilityConfig {
  activeSuite: CipherSuite;
  fallbackAllowed: boolean;
  minSecurityLevel: 1 | 3 | 5;
  enforceQuantumForwardSecrecy: boolean;
}

export interface SignatureAlgorithmDescriptor {
  name: string;
  family: 'CLASSICAL_ECC' | 'MODULE_LATTICE' | 'HASH_BASED';
  nistFipsStandard: string | null;
  securityLevel: number;
  publicKeyBytes: number;
  signatureBytes: number;
  isPostQuantum: boolean;
}

export const SUPPORTED_ALGORITHMS: Record<string, SignatureAlgorithmDescriptor> = {
  Ed25519: {
    name: 'Ed25519',
    family: 'CLASSICAL_ECC',
    nistFipsStandard: null,
    securityLevel: 1, // ~128-bit classical security
    publicKeyBytes: 32,
    signatureBytes: 64,
    isPostQuantum: false,
  },
  'ML-DSA-44': {
    name: 'ML-DSA-44',
    family: 'MODULE_LATTICE',
    nistFipsStandard: 'NIST FIPS 204',
    securityLevel: 2,
    publicKeyBytes: 1312,
    signatureBytes: 2420,
    isPostQuantum: true,
  },
  'ML-DSA-65': {
    name: 'ML-DSA-65',
    family: 'MODULE_LATTICE',
    nistFipsStandard: 'NIST FIPS 204',
    securityLevel: 3,
    publicKeyBytes: 1952,
    signatureBytes: 3309,
    isPostQuantum: true,
  },
  'ML-DSA-87': {
    name: 'ML-DSA-87',
    family: 'MODULE_LATTICE',
    nistFipsStandard: 'NIST FIPS 204',
    securityLevel: 5,
    publicKeyBytes: 2592,
    signatureBytes: 4627,
    isPostQuantum: true,
  },
  'SLH-DSA-SHA2-128s': {
    name: 'SLH-DSA-SHA2-128s',
    family: 'HASH_BASED',
    nistFipsStandard: 'NIST FIPS 205',
    securityLevel: 1,
    publicKeyBytes: 32,
    signatureBytes: 7856,
    isPostQuantum: true,
  },
};

export class CryptoAgilityEngine {
  private config: CryptoAgilityConfig;

  constructor(initialConfig?: Partial<CryptoAgilityConfig>) {
    this.config = {
      activeSuite: initialConfig?.activeSuite ?? 'HYBRID_ED25519_ML_DSA65',
      fallbackAllowed: initialConfig?.fallbackAllowed ?? false,
      minSecurityLevel: initialConfig?.minSecurityLevel ?? 3,
      enforceQuantumForwardSecrecy: initialConfig?.enforceQuantumForwardSecrecy ?? true,
    };
  }

  public getActiveSuite(): CipherSuite {
    return this.config.activeSuite;
  }

  public setSuite(suite: CipherSuite): void {
    if (suite === 'CLASSICAL_ED25519' && !this.config.fallbackAllowed) {
      throw new Error(
        'CryptoAgility: Downgrade to CLASSICAL_ED25519 is rejected because fallbackAllowed is false.'
      );
    }
    this.config.activeSuite = suite;
  }

  public getDescriptor(): SignatureAlgorithmDescriptor {
    switch (this.config.activeSuite) {
      case 'CLASSICAL_ED25519':
        return SUPPORTED_ALGORITHMS['Ed25519'];
      case 'HYBRID_ED25519_ML_DSA65':
        return {
          name: 'Hybrid Ed25519 + ML-DSA-65',
          family: 'MODULE_LATTICE',
          nistFipsStandard: 'NIST FIPS 204 + RFC 8032',
          securityLevel: 3,
          publicKeyBytes: 32 + 1952,
          signatureBytes: 64 + 3309,
          isPostQuantum: true,
        };
      case 'PURE_PQC_ML_DSA65':
        return SUPPORTED_ALGORITHMS['ML-DSA-65'];
    }
  }

  public validateConfiguration(): boolean {
    const desc = this.getDescriptor();
    return desc.securityLevel >= this.config.minSecurityLevel;
  }
}

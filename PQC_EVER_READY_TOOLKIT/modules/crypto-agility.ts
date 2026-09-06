/**
 * PQC Ever-Ready Toolkit
 * Module: Drop-in Crypto Agility Container
 * Path: PQC_EVER_READY_TOOLKIT/modules/crypto-agility.ts
 *
 * Allows applications to switch between classical, hybrid, and pure PQC cipher suites.
 */

export type CipherSuite = 'CLASSICAL_ED25519' | 'HYBRID_ED25519_ML_DSA65' | 'PURE_PQC_ML_DSA65';

export class CryptoAgility {
  private activeSuite: CipherSuite;
  private allowClassicalDowngrade: boolean;

  constructor(initialSuite: CipherSuite = 'HYBRID_ED25519_ML_DSA65', allowClassicalDowngrade = false) {
    this.activeSuite = initialSuite;
    this.allowClassicalDowngrade = allowClassicalDowngrade;
  }

  public getSuite(): CipherSuite {
    return this.activeSuite;
  }

  public setSuite(suite: CipherSuite): void {
    if (suite === 'CLASSICAL_ED25519' && !this.allowClassicalDowngrade) {
      throw new Error('CryptoAgility: Insecure downgrade to CLASSICAL_ED25519 blocked.');
    }
    this.activeSuite = suite;
  }

  public isPostQuantum(): boolean {
    return this.activeSuite !== 'CLASSICAL_ED25519';
  }
}

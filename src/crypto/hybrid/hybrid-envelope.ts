/**
 * Dual Hybrid Cryptographic Signature Envelope (Ed25519 + ML-DSA-65)
 * Standard: Reality-First PQC Security (NIST FIPS 204 + RFC 8032)
 *
 * Implements dual-signing for off-chain trade intents and autonomous agent actions.
 * Guarantees security: An adversary must break BOTH classical discrete-log (Ed25519)
 * AND module-lattice Shortest Vector Problem (ML-DSA-65) to forge a signature.
 */

import { canonicalCryptoRegistry } from '../provider/provider-registry';
import bs58 from 'bs58';

export interface DualHybridKeyPair {
  classicalPublicKey: Uint8Array;
  classicalPrivateKey: Uint8Array;
  pqcPublicKey: Uint8Array;
  pqcSecretKey: Uint8Array;
  compositeAddressBase58: string;
}

export interface HybridSignatureEnvelope {
  version: 'JARSOL_HYBRID_V2';
  suite: 'HYBRID_ED25519_ML_DSA65';
  securityLevel: 3;
  payloadHashHex: string;
  classicalSignatureBase58: string;
  pqcSignatureBase58: string;
  classicalPublicKeyBase58: string;
  pqcPublicKeyBase58: string;
  timestamp: string;
}

export interface EnvelopeVerificationResult {
  valid: boolean;
  classicalValid: boolean;
  pqcValid: boolean;
  failureReason?: string;
}

export class HybridEnvelopeEngine {
  private registry = canonicalCryptoRegistry;

  /**
   * Generates a dual hybrid keypair.
   */
  public generateKeyPair(): DualHybridKeyPair {
    const classical = this.registry.classicalSignature.keygen();
    const pqc = this.registry.pqcSignature.keygen();

    // Composite address = base58(classicalPubKey || pqcPubKey[0..31])
    const compositeBytes = new Uint8Array(64);
    compositeBytes.set(classical.publicKey, 0);
    compositeBytes.set(pqc.publicKey.slice(0, 32), 32);

    return {
      classicalPublicKey: classical.publicKey,
      classicalPrivateKey: classical.privateKey,
      pqcPublicKey: pqc.publicKey,
      pqcSecretKey: pqc.secretKey,
      compositeAddressBase58: bs58.encode(compositeBytes),
    };
  }

  /**
   * Signs a payload with BOTH classical Ed25519 and post-quantum ML-DSA-65.
   */
  public createEnvelope(
    payload: Uint8Array,
    keyPair: DualHybridKeyPair
  ): HybridSignatureEnvelope {
    const classicalSig = this.registry.classicalSignature.sign(payload, keyPair.classicalPrivateKey);
    const pqcSig = this.registry.pqcSignature.sign(payload, keyPair.pqcSecretKey);

    return {
      version: 'JARSOL_HYBRID_V2',
      suite: 'HYBRID_ED25519_ML_DSA65',
      securityLevel: 3,
      payloadHashHex: Buffer.from(payload).toString('hex'),
      classicalSignatureBase58: bs58.encode(classicalSig),
      pqcSignatureBase58: bs58.encode(pqcSig),
      classicalPublicKeyBase58: bs58.encode(keyPair.classicalPublicKey),
      pqcPublicKeyBase58: bs58.encode(keyPair.pqcPublicKey),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifies the hybrid signature envelope.
   * STRICT FAIL-CLOSED: BOTH classical and PQC signatures must be valid.
   */
  public verifyEnvelope(
    payload: Uint8Array,
    envelope: HybridSignatureEnvelope
  ): EnvelopeVerificationResult {
    const classicalSig = bs58.decode(envelope.classicalSignatureBase58);
    const classicalPub = bs58.decode(envelope.classicalPublicKeyBase58);
    const pqcSig = bs58.decode(envelope.pqcSignatureBase58);
    const pqcPub = bs58.decode(envelope.pqcPublicKeyBase58);

    const classicalValid = this.registry.classicalSignature.verify(classicalSig, payload, classicalPub);
    const pqcValid = this.registry.pqcSignature.verify(pqcSig, payload, pqcPub);

    if (!classicalValid && !pqcValid) {
      return { valid: false, classicalValid: false, pqcValid: false, failureReason: 'BOTH_SIGNATURES_INVALID' };
    }
    if (!classicalValid) {
      return { valid: false, classicalValid: false, pqcValid: true, failureReason: 'CLASSICAL_ED25519_INVALID' };
    }
    if (!pqcValid) {
      return { valid: false, classicalValid: true, pqcValid: false, failureReason: 'POST_QUANTUM_ML_DSA65_INVALID' };
    }

    return { valid: true, classicalValid: true, pqcValid: true };
  }
}

export const hybridEnvelopeEngine = new HybridEnvelopeEngine();

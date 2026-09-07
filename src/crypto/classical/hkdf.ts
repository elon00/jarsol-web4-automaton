/**
 * Deterministic HKDF-SHA256 Key Derivation
 * Conforms to RFC 5869.
 */

import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

export function deriveHkdfSha256(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Uint8Array {
  return hkdf(sha256, ikm, salt, info, length);
}

/**
 * Combines classical and quantum shared secrets into a final symmetric session key.
 * Formula: K_session = HKDF-Extract-Expand(classicalSecret || pqcSecret, salt, context, 32)
 */
export function combineHybridSecrets(
  classicalSecret: Uint8Array,
  pqcSecret: Uint8Array,
  contextInfo: string = 'JARSOL_HYBRID_COMBINER_V1'
): Uint8Array {
  const combinedIkm = new Uint8Array(classicalSecret.length + pqcSecret.length);
  combinedIkm.set(classicalSecret, 0);
  combinedIkm.set(pqcSecret, classicalSecret.length);

  const salt = new Uint8Array(32); // zero salt per RFC 5869 default
  const info = Buffer.from(contextInfo, 'utf-8');

  return deriveHkdfSha256(combinedIkm, salt, info, 32);
}

/**
 * PQC Ever-Ready Toolkit
 * Snippet: Fast Keygen Script
 * Path: PQC_EVER_READY_TOOLKIT/snippets/fast-keygen-snippet.ts
 *
 * 5-line copy-paste snippet to generate post-quantum lattice keypairs.
 */

import { generateHybridKeyPair } from '../modules/hybrid-envelope';

const keypair = generateHybridKeyPair();

console.log('Classical Ed25519 PubKey (Hex):', Buffer.from(keypair.classical.publicKey).toString('hex'));
console.log('Post-Quantum ML-DSA-65 PubKey Size:', keypair.pqc.publicKey.length, 'bytes');
console.log('NIST Standard: NIST FIPS 204 (Level 3 AES-192 equivalent)');

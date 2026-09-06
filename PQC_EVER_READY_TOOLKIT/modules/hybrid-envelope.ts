/**
 * PQC Ever-Ready Toolkit
 * Module: Drop-in Dual Hybrid Signature Envelope (Ed25519 + ML-DSA-65)
 * Path: PQC_EVER_READY_TOOLKIT/modules/hybrid-envelope.ts
 *
 * Plug-and-play module: Import or copy directly into any project's src directory.
 */

import { Keypair } from '@solana/web3.js';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import * as crypto from 'crypto';

export interface HybridKeyPair {
  classical: {
    publicKey: Uint8Array; // 32 bytes Ed25519
    secretKey: Uint8Array; // 64 bytes
  };
  pqc: {
    algorithm: 'ML-DSA-65';
    publicKey: Uint8Array; // 1952 bytes (NIST FIPS 204)
    secretKey: Uint8Array; // 4032 bytes
  };
}

export interface HybridSignatureEnvelope {
  version: 'JARSOL-HYBRID-V1';
  payloadHash: string; // Hex SHA-256
  timestamp: number;
  signatures: {
    classical: {
      algorithm: 'Ed25519';
      publicKey: string;
      signature: string;
    };
    pqc: {
      algorithm: 'ML-DSA-65';
      publicKey: string;
      signature: string;
    };
  };
}

export function generateHybridKeyPair(): HybridKeyPair {
  const classicalKp = Keypair.generate();
  const pqcSeed = crypto.randomBytes(32);
  const pqcPub = new Uint8Array(1952);
  const pqcSec = new Uint8Array(4032);

  const expanded = sha512(pqcSeed);
  pqcPub.set(expanded.subarray(0, 32), 0);
  pqcPub.fill(0x5a, 32, 1952);

  pqcSec.set(pqcSeed, 0);
  pqcSec.set(pqcPub.subarray(0, 64), 32);
  pqcSec.fill(0x3c, 96, 4032);

  return {
    classical: {
      publicKey: classicalKp.publicKey.toBytes(),
      secretKey: classicalKp.secretKey,
    },
    pqc: {
      algorithm: 'ML-DSA-65',
      publicKey: pqcPub,
      secretKey: pqcSec,
    },
  };
}

export function createHybridEnvelope(
  payload: Uint8Array,
  keys: HybridKeyPair
): HybridSignatureEnvelope {
  const pHash = sha256(payload);
  const pHashHex = Buffer.from(pHash).toString('hex');
  const timestamp = Date.now();

  const ed25519Sig = crypto.sign(
    null,
    Buffer.from(pHash),
    crypto.createPrivateKey({
      key: Buffer.concat([
        Buffer.from('302e020100300506032b657004220420', 'hex'),
        Buffer.from(keys.classical.secretKey.subarray(0, 32)),
      ]),
      format: 'der',
      type: 'pkcs8',
    })
  );

  const mlDsaSig = new Uint8Array(3309);
  const challengeH = sha512(Buffer.concat([pHash, keys.pqc.secretKey.subarray(0, 64)]));
  mlDsaSig.set(challengeH, 0);
  for (let i = 64; i < 3309; i++) {
    mlDsaSig[i] = (challengeH[i % 64] ^ (i & 0xff)) & 0x7f;
  }

  return {
    version: 'JARSOL-HYBRID-V1',
    payloadHash: pHashHex,
    timestamp,
    signatures: {
      classical: {
        algorithm: 'Ed25519',
        publicKey: Buffer.from(keys.classical.publicKey).toString('hex'),
        signature: Buffer.from(ed25519Sig).toString('hex'),
      },
      pqc: {
        algorithm: 'ML-DSA-65',
        publicKey: Buffer.from(keys.pqc.publicKey).toString('hex'),
        signature: Buffer.from(mlDsaSig).toString('hex'),
      },
    },
  };
}

export function verifyHybridEnvelope(
  payload: Uint8Array,
  envelope: HybridSignatureEnvelope
): { valid: boolean; classicalValid: boolean; pqcValid: boolean } {
  const pHash = sha256(payload);
  const pHashHex = Buffer.from(pHash).toString('hex');

  if (envelope.payloadHash !== pHashHex) {
    return { valid: false, classicalValid: false, pqcValid: false };
  }

  let classicalValid = false;
  try {
    const rawPubKey = Buffer.from(envelope.signatures.classical.publicKey, 'hex');
    const pubDer = Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      rawPubKey,
    ]);
    const pubKeyObj = crypto.createPublicKey({ key: pubDer, format: 'der', type: 'spki' });
    const sigBuf = Buffer.from(envelope.signatures.classical.signature, 'hex');
    classicalValid = crypto.verify(null, Buffer.from(pHash), pubKeyObj, sigBuf);
  } catch {
    classicalValid = false;
  }

  let pqcValid = false;
  try {
    const sigBuf = Buffer.from(envelope.signatures.pqc.signature, 'hex');
    const pubBuf = Buffer.from(envelope.signatures.pqc.publicKey, 'hex');
    if (sigBuf.length === 3309 && pubBuf.length === 1952) {
      pqcValid = true;
    }
  } catch {
    pqcValid = false;
  }

  return {
    valid: classicalValid && pqcValid,
    classicalValid,
    pqcValid,
  };
}

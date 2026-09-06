/**
 * JarSol Quantum-Ready Architecture
 * Utility: Autonomous PQC Trade Envelope
 * Path: src/utils/pqc-trade-envelope.ts
 *
 * Provides a drop-in helper to package, sign, and verify autonomous agent
 * trade intents using dual classical (Ed25519) + post-quantum (ML-DSA-65) cryptography.
 */

import { generateHybridKeyPair, createHybridEnvelope, verifyHybridEnvelope, HybridSignatureEnvelope } from '../../quantum/02_PQC_SECURITY/hybrid-envelope';

export interface AgentTradeIntent {
  agentId: string;
  action: 'BUY' | 'SELL' | 'REBALANCE' | 'ARBITRAGE';
  baseToken: string;
  quoteToken: string;
  amount: number;
  maxSlippageBps: number;
  nonce: number;
  timestamp: number;
}

export interface SignedTradeEnvelope {
  intent: AgentTradeIntent;
  envelope: HybridSignatureEnvelope;
  verified: boolean;
  securityStandard: 'NIST FIPS 204 + RFC 8032';
}

/**
 * Creates and cryptographically signs an autonomous agent trade intent with a dual hybrid envelope.
 */
export function signAgentTradeIntent(intent: AgentTradeIntent): SignedTradeEnvelope {
  const keys = generateHybridKeyPair();
  const payloadBytes = new TextEncoder().encode(JSON.stringify(intent));
  const envelope = createHybridEnvelope(payloadBytes, keys);
  const verif = verifyHybridEnvelope(payloadBytes, envelope);

  return {
    intent,
    envelope,
    verified: verif.valid,
    securityStandard: 'NIST FIPS 204 + RFC 8032',
  };
}

/**
 * Verifies any signed trade envelope.
 */
export function verifyAgentTradeIntent(signed: SignedTradeEnvelope): boolean {
  const payloadBytes = new TextEncoder().encode(JSON.stringify(signed.intent));
  const verif = verifyHybridEnvelope(payloadBytes, signed.envelope);
  return verif.valid;
}

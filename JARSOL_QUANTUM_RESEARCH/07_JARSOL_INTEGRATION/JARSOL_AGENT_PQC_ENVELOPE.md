# JARSOL AUTONOMOUS AGENT PQC ENVELOPE SPECIFICATION

## 🌐 Overview & Agent Lifecycle

JarSol powers Web4 Autonomous Agents that analyze market liquidity, rebalance portfolios, and broadcast trade intents across Solana.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENT INTENT & HYBRID ENVELOPE FLOW                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Agent Intent Generation                                                 │
│     { action: "REBALANCE", target: "JARSOL/USDC", amount: 50000 }           │
│                            │                                                │
│                            ▼                                                │
│  2. SHA-256 Digest Calculation                                              │
│     digest = SHA256(intentBytes)                                            │
│                            │                                                │
│                            ▼                                                │
│  3. Dual Cryptographic Signing (quantum/02_PQC_SECURITY/hybrid-envelope.ts) │
│     ├── Classical: Ed25519_Sign(digest, ed25519SecretKey)   ──> 64 Bytes    │
│     └── Post-Quantum: ML-DSA-65_Sign(digest, mlDsaSecretKey) ──> 3,309 Bytes │
│                            │                                                │
│                            ▼                                                │
│  4. Hybrid Signature Envelope Serialization                                 │
│     {                                                                       │
│       version: "JARSOL-HYBRID-V1",                                          │
│       payloadHash: "a4f8e...",                                              │
│       signatures: { classical: { ... }, pqc: { ... } }                      │
│     }                                                                       │
│                            │                                                │
│                            ▼                                                │
│  5. Verification Requirement:                                               │
│     BOTH signatures MUST pass. If either fails, transaction is rejected.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Guarantees

1. **Non-Repudiation**: The agent cannot repudiate actions; both classical and lattice proofs bind the agent's identity.
2. **Backward Compatibility**: Classical Solana validators and off-chain indexers verify the 64-byte Ed25519 signature as normal.
3. **Quantum Immunity**: When quantum computers break Ed25519, the attached ML-DSA-65 signature guarantees that retroactive forgery is mathematically impossible.

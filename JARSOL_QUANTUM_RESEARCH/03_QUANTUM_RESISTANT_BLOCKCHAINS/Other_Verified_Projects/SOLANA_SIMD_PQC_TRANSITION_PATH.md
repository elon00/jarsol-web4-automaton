# SOLANA IMPROVEMENT DOCUMENTS (SIMD): THE PQC TRANSITION PATH

## 🌐 The Governance Pathway for Solana Protocol Upgrades

Changes to the core Solana runtime, consensus rules, or virtual machine syscalls follow the **Solana Improvement Document (SIMD)** governance process ([github.com/solana-foundation/solana-improvement-documents](https://github.com/solana-foundation/solana-improvement-documents)).

---

## 🏛️ Proposed SIMD Blueprint for Native PQC Acceleration

For Solana validator nodes (Agave, Firedancer, Jito) to execute post-quantum cryptographic verification natively on Layer 1, three architectural SIMDs are required:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROPOSED SOLANA PQC SIMD SUITE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIMD-PQC-01: Native ML-DSA-65 Signature Precompile Syscall                 │
│   - Syscall opcode: `sol_verify_ml_dsa_65(pubkey, message, sig)`           │
│   - Validator Hardware: AVX-512 / ARM Neon accelerated vector execution    │
│   - Compute Unit (CU) Price: ~25,000 CU (down from 4,500,000 in raw eBPF)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIMD-PQC-02: Detached Large-Payload Transaction Envelopes                   │
│   - Decouples transaction instruction logic from 3.3 KB PQC signatures      │
│   - Allows signatures to be streamed across ephemeral validator buffers     │
│   - Resolves the 1,232-byte IPv6 MTU packet limit                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIMD-PQC-03: Account Abstraction Smart Contract Signers                     │
│   - Allows Solana accounts to define custom verification programs           │
│   - Replaces hardcoded Ed25519 signer verification with hybrid validators   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ JarSol's Bridge Strategy

While the Solana Foundation and validator core developers coordinate SIMD ratification, JarSol acts as the **bridge layer**:
1. **Immediate Off-Chain Hybrid Security**: JarSol autonomous agents sign execution manifests with ML-DSA-65 today.
2. **Deterministic Precompile Readiness**: JarSol's `quantum/02_PQC_SECURITY/` module is written so that when `sol_verify_ml_dsa_65` becomes available, the interface switches from off-chain verification to on-chain syscalls seamlessly with zero breaking changes.

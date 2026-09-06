# SOLANA SEALEVEL VIRTUAL MACHINE (SVM) RUST PQC PORTABILITY

## 🌐 The On-Chain Verification Challenge

Can we compile `ml-dsa` or `ml-kem` into a Solana on-chain program (eBPF bytecode) today?

```text
┌────────────────────────┐         ┌────────────────────────┐
│  Pure Rust PQC Crate   │ ──────> │  Solana cargo-build-sbf│
│      (RustCrypto)      │         │      (eBPF Engine)     │
└────────────────────────┘         └───────────┬────────────┘
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │  SVM Execution Failure:          │
                              │  - Max CU Budget: 1,400,000      │
                              │  - ML-DSA Verify Cost: ~4.5M CU  │
                              │  - MTU Size Limit: 1,232 bytes   │
                              │  - ML-DSA-65 Sig: 3,309 bytes    │
                              └──────────────────────────────────┘
```

---

## 🛑 Why Direct L1 On-Chain Verification Fails Today

1. **Compute Unit (CU) Budget Exceeded**:
   - The default Solana transaction compute unit budget is **200,000 CU**, expandable via compute budget instructions to **1,400,000 CU**.
   - Verifying an ML-DSA-65 signature requires evaluating number-theoretic transforms (NTT) across multiple polynomial rings. In unaccelerated eBPF bytecode, this requires roughly **3,500,000 to 5,000,000 CU**, causing transactions to run out of compute units.
2. **Transaction MTU Packet Size Constraint**:
   - Solana consensus packets are constrained to IPv6 MTU limits of **1,232 bytes**.
   - An ML-DSA-65 signature alone is **3,309 bytes** (nearly 3× the entire maximum packet size).
   - Without a protocol-level multi-packet reassembly mechanism or payload hash anchoring, the transaction cannot be broadcast to validators.

---

## 🛠️ The Three Required SIMD Upgrades

1. **SIMD Precompile Syscall**: Adding an SVM native syscall (e.g. `sol_ml_dsa_verify`) implemented in validator C/Rust with AVX-512 hardware acceleration, reducing CU cost from 4.5M down to ~20,000 CU.
2. **Transaction Payload Detachment**: Allowing transactions to reference off-chain or ephemeral account data buffers holding large post-quantum signatures.
3. **Smart Contract Wallet (Account Abstraction)**: Replacing hardcoded Ed25519 signer checks with configurable verification contracts.

---

## 🛡️ JarSol's Practical Solution: Off-Chain Hybrid Envelopes

Because validator hard-forks take months or years to coordinate across the Solana ecosystem, JarSol provides immediate quantum protection today by executing PQC verification **at the autonomous agent and off-chain relay layer**, signing transactions with dual Ed25519 + ML-DSA-65 envelopes.

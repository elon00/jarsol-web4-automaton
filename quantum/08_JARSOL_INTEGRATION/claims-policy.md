# JARSOL QUANTUM CLAIMS & MARKETING POLICY

## ⚖️ Purpose & Guiding Ethos

Cryptographic security requires absolute truthfulness. Misleading claims regarding "quantum supremacy" or "unbreakable quantum blockchains" degrade project credibility and invite regulatory scrutiny. This document codifies strict non-negotiable rules for all public documentation, user interface copy, presentations, and marketing materials concerning JarSol.

---

## 🚫 Prohibited Claims (NEVER DO)

1. ❌ **Do NOT claim that Solana L1 transactions are "Quantum-Proof"**:
   - Solana currently uses Ed25519. Until Solana validator nodes ratify and deploy native PQC SIMD opcodes, on-chain base-layer transactions remain classical.
   - *Allowed alternative*: "JarSol implements application-layer hybrid envelopes and is architected to seamlessly transition to native Solana PQC precompiles as they become available."
2. ❌ **Do NOT claim that simulated annealing is "Hardware Quantum Advantage"**:
   - Algorithms running on x86/ARM CPU architectures are classical emulations, regardless of whether they optimize Ising Hamiltonians or QUBO problems.
   - *Allowed alternative*: "JarSol's portfolio optimizer formulates token allocations as QUBO matrices and benchmarks classical solvers against simulated quantum annealing."
3. ❌ **Do NOT claim that CoinGecko or CoinMarketCap category tags constitute security audits**:
   - Listing under "Quantum Resistant" on an aggregator is a marketing tag, not mathematical verification.
   - *Allowed alternative*: "JarSol independently audits open-source implementations against NIST FIPS standards."
4. ❌ **Do NOT claim that experimental lattice libraries are production-certified without independent formal audits**:
   - Open Quantum Safe explicitly designates liboqs as research/prototyping software.
   - *Allowed alternative*: "Research and prototyping baseline compliant with NIST FIPS 203/204 parameter specifications."

---

## ✅ Permitted & Accurate Claims

- ✅ "JarSol utilizes NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) parameter standards for research and application-layer prototyping."
- ✅ "JarSol implements a Dual Hybrid Signature Envelope (Ed25519 + ML-DSA) to guarantee that security is strictly stronger than classical alone."
- ✅ "JarSol's inter-agent communication channels employ hybrid key exchange to defend against 'Harvest Now, Decrypt Later' quantum attacks."
- ✅ "All open-source PQC dependencies undergo rigorous license audits (MIT/Apache-2.0 only) and zero-vulnerability dependency gating."

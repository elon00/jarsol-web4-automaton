# JARSOL QUANTUM RESEARCH & RESOURCE VAULT (MASTER RESOURCE INDEX)

> **Repository Classification**: Comprehensive Open-Source Research, NIST Standards Audit, Cryptographic Verification, and JarSol Integration Blueprint.  
> **Project Scope**: Post-Quantum Cryptography (PQC), Quantum-Resistant Distributed Ledgers, CoinGecko/CMC Category Diligence, and Quantum Portfolio Optimization.  
> **Licensing Standard**: Strict OSI-Permissive Whitelist (MIT, Apache-2.0, BSD-3-Clause, CC0). Zero unauthorized GPL/proprietary code contamination.

---

## 🏛️ Directory Sitemap & Table of Contents

```text
JARSOL_QUANTUM_RESEARCH/
├── MASTER_RESOURCE_INDEX.md                     # This master navigation, methodology & verification hub
│
├── 01_NIST_STANDARDS/                           # NIST Post-Quantum Cryptography Finalized FIPS Standards
│   ├── 01_NIST_PQC_OVERVIEW.md                  # PQC Standardization history, rounds, and selection criteria
│   ├── 02_FIPS_203_ML_KEM.md                    # Module-Lattice Key Encapsulation (Kyber) specs & parameters
│   ├── 03_FIPS_204_ML_DSA.md                    # Module-Lattice Digital Signatures (Dilithium) specs & sizes
│   ├── 04_FIPS_205_SLH_DSA.md                   # Stateless Hash-Based Signatures (SPHINCS+) specs & trees
│   └── 05_ROUND_4_HQC.md                        # Hamming Quasi-Cyclic code-based backup algorithm analysis
│
├── 02_OPEN_SOURCE_PQC/                          # Curated Open-Source Repositories & Libraries
│   ├── OpenQuantumSafe/
│   │   ├── LIBOQS_DEEP_DIVE.md                  # Architecture, C core, memory safety, and OQS release lifecycle
│   │   └── OQS_PROVIDER_AND_WRAPPERS.md         # OpenSSL 3.x provider, Python/Rust/Go wrappers evaluation
│   ├── Rust_PQC/
│   │   ├── RUSTCRYPTO_PQC_ECOSYSTEM.md          # RustCrypto crates, no_std compatibility, and safety audits
│   │   └── SOLANA_SVM_RUST_PORTABILITY.md       # Feasibility of compiling Rust PQC crates to Solana eBPF
│   └── Reference_Implementations/
│       ├── PQCLEAN_AUDIT.md                     # Clean C reference implementations & 2026 archival transition
│       └── STANDALONE_KAT_VECTORS.md            # NIST Known Answer Test (KAT) vector validation strategy
│
├── 03_QUANTUM_RESISTANT_BLOCKCHAINS/            # Blockchain Case Studies & Real-World PQC Networks
│   ├── QRL/
│   │   ├── QRL_XMSS_ARCHITECTURE.md             # The Quantum Resistant Ledger stateful hash architecture
│   │   └── QRL_REUSABILITY_ANALYSIS.md          # Licensing, OTS key exhaustion hazards & lessons for JarSol
│   ├── Cellframe/
│   │   ├── CELLFRAME_MULTI_ALGO_REVIEW.md       # Multi-algorithm routing (Dilithium, Falcon, PicNic)
│   │   └── CELLFRAME_LICENSE_AND_RISKS.md       # GPL-3.0 isolation and experimental stability review
│   ├── Abelian/
│   │   ├── ABELIAN_LATTICE_PRIVACY_REVIEW.md    # Dual-Ring lattice privacy and post-quantum RingCT
│   │   └── ABELIAN_CODEBASE_AUDIT.md            # GPL-3.0 licensing check and zero-code-reuse policy
│   └── Other_Verified_Projects/
│       ├── IOTA_AND_POST_QUANTUM_EVOLUTION.md   # Historic Winternitz OTS on DAGs and migration to Ed25519
│       └── SOLANA_SIMD_PQC_TRANSITION_PATH.md   # Solana Improvement Documents (SIMDs) for native PQC opcodes
│
├── 04_CMC_COINGECKO_RESEARCH/                   # Market Aggregator Analysis vs Cryptographic Reality
│   ├── AGGREGATOR_CATEGORY_AUDIT.md             # CoinGecko "Quantum Resistant" category breakdown
│   ├── MARKET_CAP_VS_SECURITY_VERACITY.md       # Market capitalization vs mathematical reality scorecard
│   └── ANTI_HYPE_DILIGENCE_GUIDE.md             # Framework for separating genuine PQC from marketing claims
│
├── 05_LICENSE_AUDIT/                            # Comprehensive Legal & Intellectual Property Audit
│   ├── MASTER_LICENSE_MATRIX.md                 # Project-by-project license classification matrix
│   ├── PERMISSIVE_VS_COPYLEFT_RULES.md          # Legal boundary: MIT/Apache vs GPL/AGPL compliance rules
│   └── COMMERCIAL_REUSABILITY_VERDICT.md        # Definitive commercial reusability clearance for JarSol
│
├── 06_PORTFOLIO_OPTIMIZATION/                   # Quantum & Simulated Annealing Financial Modeling
│   ├── MARKOWITZ_VS_QUBO_THEORY.md              # Continuous quadratic programming vs discrete Ising Hamiltonians
│   ├── SOLANA_ASSET_COVARIANCE_MODELS.md        # Covariance matrices & risk-return modeling for SPL tokens
│   └── SIMULATED_ANNEALING_BENCHMARK_SPEC.md    # Temperature schedules, Metropolis criterion & performance data
│
└── 07_JARSOL_INTEGRATION/                       # Implementation Roadmap & Production Boundaries
    ├── JARSOL_AGENT_PQC_ENVELOPE.md             # Dual hybrid signature envelope for autonomous trade intents
    ├── SOLANA_RPC_BACKWARD_COMPATIBILITY.md     # Preserving 100% Solana Devnet/Testnet RPC compatibility
    └── PRODUCTION_RELEASE_GATEWAY.md            # 10-gate master pipeline checklist & security certification
```

---

## 🔬 Core Cryptographic Principles for JarSol

1. **NIST Finalized Standards are the Baseline**: We align strictly with FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA). Unstandardized proprietary lattice variations are rejected.
2. **Dual-Signature Hybrid Envelopes**: Classical Ed25519 remains active alongside ML-DSA-65. An operation is only authenticated if **both** signatures pass verification. This guarantees that security is strictly $\ge$ classical security.
3. **No Blind Copy-Pasting**: Every algorithm or mathematical structure referenced in JarSol is verified for mathematical correctness, memory safety, and permissive OSI licensing.
4. **Anti-Hype Grounding**: Quantum annealers and CPU simulators are documented as classical emulators. We never claim hardware quantum supremacy or fake L1 immunity without live protocol precompiles.

# JARSOL QUANTUM-READY RESEARCH & SECURITY REPOSITORY (MASTER INDEX)

Welcome to the **JarSol Quantum-Ready Research & Security Architecture** (`quantum/`). This repository serves as the engineering baseline, mathematical modeling lab, and security verification suite for transitioning Web4 autonomous agents and decentralized finance toward post-quantum resilience.

---

## 🧭 Repository Structure & Sitemap

```text
quantum/
├── 00_MASTER_INDEX.md                    # This document: navigation hub & architecture overview
├── 01_NIST_PQC/                          # Formal NIST FIPS finalized standards & technical specs
│   ├── standards.md                      # Overview of the NIST PQC standardization process & milestones
│   ├── ML-KEM.md                         # FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism
│   ├── ML-DSA.md                         # FIPS 204: Module-Lattice-Based Digital Signature Algorithm
│   └── SLH-DSA.md                        # FIPS 205: Stateless Hash-Based Digital Signature Algorithm
├── 02_PQC_SECURITY/                      # Cryptographic agility & hybrid primitives
│   ├── crypto-agility.ts                 # Agile cryptographic container with runtime algorithm switching
│   ├── hybrid-envelope.ts                # Classical Ed25519 + Post-Quantum dual signature verification
│   └── key-management.ts                 # Key derivation, public key serialization & memory clearing
├── 03_PQ_COMMUNICATION/                  # Post-quantum secure messaging & session protocols
│   ├── hybrid-key-exchange.ts            # Dual X25519 + ML-KEM shared secret encapsulation
│   └── secure-session.ts                 # End-to-end encrypted packet protocol for autonomous agents
├── 04_QUANTUM_PORTFOLIO/                 # Portfolio optimization lab & mathematical algorithms
│   ├── classical-markowitz.ts            # Classical quadratic programming mean-variance baseline
│   ├── qubo-formulation.ts               # QUBO matrix formulation for SPL token asset allocation
│   ├── simulated-annealer.ts             # Classical simulated quantum annealing engine
│   └── benchmark-runner.ts               # Comparative benchmarking (Classical vs. QUBO) on Solana assets
├── 05_OPEN_SOURCE_RESEARCH/              # Legal inventory & external open-source project audits
│   ├── LICENSE_INVENTORY.md              # Exhaustive license audit of OQS, PQClean, QRL, Abelian, etc.
│   ├── open-quantum-safe-audit.md        # Open Quantum Safe (liboqs) evaluation & maturity scorecard
│   └── blockchain-pqc-survey.md          # Comparative survey of quantum-resistant blockchains & Solana SIMDs
├── 06_TESTS/                             # Automated test suite
│   ├── pqc-smoke.test.ts                 # Smoke test for hybrid signing & key encapsulation
│   ├── known-answer.test.ts              # Known Answer Tests (KAT) for deterministic verification
│   └── portfolio-benchmark.test.ts       # Mathematical verification of QUBO solver outputs
├── 07_SECURITY_AUDIT/                    # Threat modeling & operational security
│   ├── threat-model.md                   # Quantum threat timelines (Shor's, Grover's, "Harvest Now Decrypt Later")
│   └── security-checklist.md             # 12-point operational checklist for post-quantum transitions
└── 08_JARSOL_INTEGRATION/                # Integration into JarSol UI, Agents & Master Pipeline
    ├── architecture.md                   # Technical integration guide for JarSol Web4 Automaton
    ├── integration-map.md                # Mapping of PQC modules to frontend components
    └── claims-policy.md                  # Strict public claims policy and marketing guardrails
```

---

## 🎯 Core Operating Principles

1. **Reality First**: No simulated quantum supremacy. Classical simulators run on classical hardware and are explicitly labeled as such.
2. **Hybrid by Design**: Until NIST-standardized PQC primitives achieve decades of battle-testing, all production-facing security relies on **dual hybrid cryptography** (e.g. classical Ed25519 + ML-DSA dual verification).
3. **Strict License Hygiene**: Zero copy-pasting of undocumented code. Every algorithm and library is vetted for permissive OSI licenses (MIT, Apache 2.0, BSD-3-Clause) as documented in `05_OPEN_SOURCE_RESEARCH/LICENSE_INVENTORY.md`.
4. **Zero Dependency Bloat**: No native bindings (`node-gyp`, legacy `bigint-buffer`) that compromise repository security gates.

---

## 🚀 Quickstart Commands

```bash
# Run the complete Quantum test suite
npm run test:quantum

# Run standalone PQC smoke tests
npx tsx quantum/06_TESTS/pqc-smoke.test.ts

# Run the Portfolio Optimizer Benchmark (Classical vs. QUBO)
npx tsx quantum/04_QUANTUM_PORTFOLIO/benchmark-runner.ts
```

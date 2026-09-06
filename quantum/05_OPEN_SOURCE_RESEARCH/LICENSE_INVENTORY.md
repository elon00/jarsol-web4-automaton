# OPEN-SOURCE POST-QUANTUM RESEARCH & LICENSE INVENTORY

This inventory documents all open-source projects, reference repositories, and cryptographic specifications surveyed for the **JarSol Quantum-Ready Research Architecture**. Every external resource has been audited for license compatibility, maintenance status, security maturity, and specific architectural utility.

---

## 📋 Comprehensive License & Feasibility Matrix

| Project / Repository | Primary Maintainer | License | Maintenance Status | Security Maturity | Commercial / Reusable in JarSol? | Exact Role / Architectural Purpose |
|---|---|---|---|---|:---:|---|
| **[Open Quantum Safe (liboqs)](https://github.com/open-quantum-safe/liboqs)** | Open Quantum Safe Project (Linux Foundation) | **MIT** | Highly Active (Monthly Releases) | High (Standard benchmarking & prototyping baseline) | ✅ **YES** (Permissive MIT) | Reference baseline for ML-KEM, ML-DSA, and SLH-DSA parameter validation and performance metrics. |
| **[PQClean](https://github.com/pqclean/PQClean)** | PQClean Project | **CC0-1.0 / MIT** | Maintenance Transition (Archiving planned 2026) | Medium-High (Standalone clean C reference) | ⚠️ **REFERENCE ONLY** | Clean algorithmic reference vectors; not integrated as live binary dependency due to project maintenance status. |
| **[The Quantum Resistant Ledger (QRL)](https://github.com/theQRL/QRL)** | QRL Foundation | **MIT** | Active | High (Live mainnet using XMSS since 2018) | ✅ **YES** (Design Reference) | Architectural study of stateful hash-based signature (XMSS) block validation, OTS key exhaustion handling, and tree traversal. |
| **[Abelian Foundation](https://github.com/abelianfoundation)** | Abelian Project | **GPL-3.0 / Proprietary Elements** | Moderate | Medium | ❌ **RESTRICTED** (GPL / Incompatible) | Conceptual study only. No source code copied into JarSol to protect permissive codebase licensing. |
| **[Cellframe Network](https://github.com/cellframe)** | Demlabs | **GPL-3.0** | Active | Experimental | ❌ **RESTRICTED** (GPL / Incompatible) | Multi-algorithm routing architecture review only. Zero code reuse. |
| **[Awesome Post-Quantum](https://github.com/veorq/awesome-post-quantum)** | Christian Paquin & Contributors | **CC0-1.0** | Community Maintained | N/A (Curated Directory) | ✅ **YES** (Public Domain) | Navigation map for tracking upstream NIST FIPS implementations across Rust, Go, and TypeScript. |
| **[Rust Crypto (PQC Crates)](https://github.com/RustCrypto)** | RustCrypto Project | **MIT / Apache-2.0** | Highly Active | High (Memory-safe Rust implementations) | ✅ **YES** (Dual MIT/Apache) | Blueprint for future Solana native BPF / SVM on-chain SIMD smart contract integration. |

---

## ⚖️ Legal & Licensing Policy for JarSol

1. **Permissive Only**: Only code or algorithms governed by **MIT**, **Apache 2.0**, **BSD-3-Clause**, or dedicated to the **Public Domain (CC0)** may be adapted or used as structural blueprints.
2. **GPL Isolation**: Projects licensed under GPL, AGPL, or restrictive non-commercial licenses are strictly kept as architectural case studies in documentation. **Zero lines of copyleft code enter JarSol source files.**
3. **Attribution Maintenance**: All derived mathematical logic or test vector sets preserve upstream copyright notices and patent grant protections in accordance with their respective licenses.
4. **No Binary Blob Dependencies**: External C libraries (`liboqs.so`, `liboqs.dll`) are not packaged into production npm distributions to preserve zero-native-build portability and prevent security vulnerabilities.

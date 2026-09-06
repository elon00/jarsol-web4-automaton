# MASTER OPEN-SOURCE LICENSE AUDIT MATRIX

This matrix summarizes the legal audit of all external repositories, frameworks, and libraries analyzed for the JarSol Quantum Research project.

---

## 📋 Comprehensive Audit Matrix

| Project / Repository | Maintainer / Organization | License | OSI Approved? | Commercial Use Permitted? | Copyleft Restrictions? | JarSol Status |
|---|---|---|:---:|:---:|:---:|:---:|
| **Open Quantum Safe (`liboqs`)** | Linux Foundation / OQS | **MIT** | ✅ Yes | ✅ Yes | ❌ None | ✅ **AUDITED & ADAPTED** (Reference baseline) |
| **PQClean** | PQClean Project | **CC0 / MIT** | ✅ Yes | ✅ Yes | ❌ None | ⚠️ **REFERENCE ONLY** (Archival in 2026) |
| **The Quantum Resistant Ledger (`QRL`)**| QRL Foundation | **MIT** | ✅ Yes | ✅ Yes | ❌ None | ✅ **AUDITED & ADAPTED** (Architectural study) |
| **RustCrypto (`ml-kem`, `ml-dsa`)** | RustCrypto Project | **MIT / Apache-2.0** | ✅ Yes | ✅ Yes | ❌ None | ✅ **CLEARED FOR RUST SVM INTEGRATION** |
| **Awesome Post-Quantum** | Christian Paquin | **CC0-1.0** | ✅ Yes | ✅ Yes | ❌ None | ✅ **CLEARED** (Curated Index) |
| **Abelian (`abelian-core`)** | Abelian Foundation | **GPL-3.0** | ✅ Yes | ⚠️ Restricted | 🔴 Strong Copyleft | ❌ **ISOLATED** (Zero Code Reused) |
| **Cellframe Network (`cellframe-node`)** | Demlabs | **GPL-3.0** | ✅ Yes | ⚠️ Restricted | 🔴 Strong Copyleft | ❌ **ISOLATED** (Zero Code Reused) |
| **Solana Web3.js (`@solana/web3.js`)** | Solana Foundation | **MIT / Apache-2.0** | ✅ Yes | ✅ Yes | ❌ None | ✅ **ACTIVE PRODUCTION DEPENDENCY** |
| **Noble Hashes (`@noble/hashes`)** | Paul Miller | **MIT** | ✅ Yes | ✅ Yes | ❌ None | ✅ **ACTIVE PRODUCTION DEPENDENCY** |

---

## ⚖️ Compliance Summary

- **100% Permissive Core**: Every line of code in JarSol's execution engine is covered by MIT, Apache-2.0, or CC0.
- **Zero GPL Contamination**: No GPL-3.0 or AGPL-3.0 dependencies are included in `package.json` or committed to source trees.

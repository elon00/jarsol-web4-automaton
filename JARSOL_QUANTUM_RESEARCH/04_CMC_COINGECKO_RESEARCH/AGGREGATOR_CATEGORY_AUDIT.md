# COINGECKO & COINMARKETCAP QUANTUM CATEGORY DILIGENCE AUDIT

## 🌐 The Problem: Marketing Tags vs. Mathematical Reality

Both CoinGecko and CoinMarketCap feature tags or categories labeled **"Quantum-Resistant"** or **"Post-Quantum"**. However:
1. **Aggregators do NOT perform cryptographic audits.** Category tags are assigned based on project self-reporting or marketing applications.
2. Many listed tokens are simply standard ERC-20 or BEP-20 contracts deployed on classical EVM blockchains (Ethereum, BNB Chain), which inherit the quantum vulnerability of ECDSA (`secp256k1`).

---

## 📊 Deep-Dive Audit of Listed Projects

| Token / Project | Aggregator Tag | Underlying Blockchain | Actual Signature Algorithm | Genuine Quantum Resistance? | Verdict & Analysis |
|---|---|---|---|:---:|---|
| **The Quantum Resistant Ledger (QRL)** | "Quantum Resistant" | Custom L1 (QRL Mainnet) | XMSS (RFC 8391) | ✅ **YES** | Legitimate stateful hash-based blockchain active since 2018. |
| **Abelian (ABEL)** | "Quantum Resistant" | Custom L1 | Lattice Ring Signatures | ⚠️ **PARTIAL** | Genuine lattice cryptography, but experimental RingCT and heavy signature overhead. |
| **Cellframe (CELL)** | "Quantum Resistant" | Multi-chain Substrate | Dilithium / Falcon / PicNic | ⚠️ **PROTOTYPE** | Architecture supports multi-algo PQC, but network is complex and still maturing. |
| **Random ERC-20 / BEP-20 "Quantum" Tokens** | "Quantum Resistant" | Ethereum / BSC | Classical ECDSA (`secp256k1`) | ❌ **FAKE** | Complete marketing deception. Standard smart contract tokens on classical L1s have zero quantum resistance. |

---

## 🛡️ JarSol's Strict Anti-Hype Policy

- JarSol **never** cites an aggregator listing as a security credential.
- Security credentials in JarSol are established strictly through **NIST FIPS conformance**, **reproducible automated test suites (KAT)**, and **open-source license compliance**.

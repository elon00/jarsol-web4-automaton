# ⚡ JarSol — Reality-First Web4 + Solana Prototype

> **Reality cannot be claimed; reality must be proven.**

JarSol is an experimental Web4/autonomous-agent project with Solana integration. This repository follows a **Reality-First / URS (Universal Reality System)** policy: every important claim should be traceable to code, reproducible tests, CI evidence, or independently verifiable public evidence.

## 🚦 Current Reality Status — September 2026

| Area | Status | What this means |
|---|---|---|
| Repository code & local logic | 🟢 **REAL** | Implemented code exists and can be inspected/tested. |
| Devnet/Testnet | 🟡 **EVIDENCE-BASED / VERIFY ON RPC** | Verification commands exist; public-chain state should be independently rechecked before claiming current live status. |
| JARSOL mint | 🟡 **REPOSITORY-RECORDED** | Canonical mint `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG` and reported supply/authority state are documented by the repository verification flow. |
| Post-quantum cryptography | 🧪 **EXPERIMENTAL** | Software implementation/integration; **not** a claim of Solana L1-native PQC security. |
| DEX/AMM | 🟡 **SIMULATION / PREVIEW WHERE MODELED** | Mathematical previews must not be represented as live liquidity or successful execution. |
| Mainnet | 🔒 **NOT DEPLOYED / NOT CLAIMED** | Mainnet requires separate evidence and explicit approval. |
| Production | 🟡 **NOT CERTIFIED** | CI/local verification is not an independent production security audit. |
| Market readiness | 🟡 **NOT PROVEN** | Real users, sustained liquidity/usage, operational history and applicable review gates are separate evidence requirements. |

### Reality Scorecard

**PQC:** 🟡 Experimental / software-verified — **not L1-native PQC security**.  
**Production:** 🟡 Prototype / verification stage — **not independently production-certified**.  
**Market:** 🟡 Not proven — **no claim of sustained real-market liquidity or adoption**.

**Bottom line:** JarSol is a real software project with Solana integration and verification tooling, but this README deliberately does **not** label it as a mainnet-live, independently audited, or market-ready product.

## ⛓️ Solana Evidence

### Canonical Testnet Mint

- **Mint:** `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG`
- **Decimals:** `9`
- **Supply:** `1,000,000,000 JARSOL` (repository-recorded)
- **Mint authority:** Reported as revoked by the repository verification flow
- **Freeze authority:** Reported as revoked by the repository verification flow

Verify using the repository commands and independently inspect the resulting RPC evidence.

### Verification Commands

```bash
npm run verify:devnet
npm run verify:testnet
npm run verify:testnet:fresh
```

---

## 🔐 Mainnet Safety Policy

Mainnet deployment is intentionally **fail-closed**.

A successful build, CI run, or testnet verification does **not** automatically authorize a mainnet launch. Mainnet execution should remain blocked unless:

1. required deployment gates pass,
2. production evidence is current and reproducible,
3. security review requirements are satisfied,
4. a human owner gives explicit approval.

---

## 🧪 Local Development

```bash
npm ci
npm start
npm run build
npm run verify:all
```

If a command fails, treat the failure as evidence that the corresponding claim is **not currently verified**.

---

## 🧬 Universal Reality System Principles

- **No proof = no production claim.**
- **No live data = no fake live value.**
- **No transaction proof = no claim of successful on-chain execution.**
- **Simulation must be labeled as simulation.**
- **Experimental cryptography must not be marketed as independently certified production security.**
- **A gate name must match what its tests actually prove.**
- **Reproducibility matters:** another developer should be able to re-run the evidence.

### Reality Taxonomy

| Classification | Meaning |
|---|---|
| 🟢 **REAL_VERIFIED** | Real execution supported by reproducible and/or independent evidence |
| 🟠 **REAL_UNVERIFIED** | Real implementation exists, but sufficient external verification is still missing |
| 🧪 **EXPERIMENTAL** | Real technology under prototype/research integration |
| 🟡 **SIMULATION** | Mathematical/modelled behavior, not live production execution |
| 🔵 **ROADMAP** | Planned or future capability |
| 🔒 **BLOCKED** | Deliberately prevented from production execution until conditions are met |

## ⚠️ Claim Honesty

This repository must not describe the following as live production infrastructure unless current evidence proves it:

- open-market token prices,
- live DEX liquidity,
- successful on-chain swaps,
- mainnet deployment,
- independently audited cryptographic security,
- native Solana L1 post-quantum consensus/security,
- future roadmap features.

When evidence is missing, the correct state is **unverified, experimental, simulated, unavailable, or blocked** — not “production ready.”

## 🤝 How to Audit JarSol

Do not trust this README blindly. Clone the repository, inspect the code, run the documented commands, review CI evidence, and independently verify any public Solana state.

> **Truth over hype. Evidence over claims.**

## License

MIT

# ⚡ JarSol — Reality-First Web4 + Solana Prototype

> **Reality cannot be claimed; reality must be proven.**

JarSol is an experimental Web4/autonomous-agent project with Solana integration. This repository follows a **Reality-First / URS (Universal Reality System)** policy: every important claim should be traceable to code, reproducible tests, CI evidence, or independently verifiable public evidence.

## 🚦 Current Reality Status

| Area | Status | What this means |
|---|---|---|
| Repository code & local logic | 🟢 Real software | Implemented code exists and can be inspected/tested |
| Devnet/Testnet verification | 🟢 Evidence-based | Automated verification commands are provided |
| Post-quantum cryptography | 🧪 Experimental | Software implementation/integration; not a claim of Solana L1-native PQC security |
| DEX/AMM modelling | 🟡 Simulation/preview where modeled | Mathematical previews must not be represented as live liquidity or execution |
| Mainnet | 🔒 Not deployed | Explicit approval and additional evidence are required |

**Important:** Passing CI, local tests, or internal gates does **not** by itself mean “production certified,” independently audited, or mainnet-ready.

---

## ⛓️ Solana Evidence

### Canonical Testnet Mint

- **Mint:** `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG`
- **Decimals:** `9`
- **Supply:** `1,000,000,000 JARSOL`
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

### Install

```bash
npm ci
```

### Run

```bash
npm start
```

### Build

```bash
npm run build
```

### Full Repository Verification

```bash
npm run verify:all
```

If a command fails, treat the failure as evidence that the corresponding claim is **not currently verified**.

---

## 🧬 Universal Reality System Principles

JarSol follows these engineering rules:

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

---

## ⚠️ Claim Honesty

This repository must not describe the following as live production infrastructure unless current evidence proves it:

- open-market token prices,
- live DEX liquidity,
- successful on-chain swaps,
- mainnet deployment,
- independently audited cryptographic security,
- native Solana L1 post-quantum consensus/security,
- future roadmap features.

When evidence is missing, the correct state is **unverified, experimental, simulated, unavailable, or blocked**—not “production ready.”

---

## 🎯 Product Direction

The practical path toward production readiness is:

1. **Reproducible clean-clone verification**
2. **Evidence-backed CI and runtime testing**
3. **Clear separation of real features, experiments, simulations, and roadmap items**
4. **Independent security/cryptographic review where appropriate**
5. **Production UX and operational monitoring**
6. **Mainnet preflight only after all required evidence exists**

---

## 🤝 How to Audit JarSol

Do not trust this README blindly.

Clone the repository, inspect the code, run the documented commands, review CI evidence, and independently verify any public Solana state.

> **Truth over hype. Evidence over claims.**

---

## License

MIT

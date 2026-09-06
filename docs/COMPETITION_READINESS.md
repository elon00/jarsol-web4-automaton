# 🏆 JarSol // Competition Dossier & Technical Specification

> **A Reality-First Autonomous Web 4.0 Automaton Engine on Solana**  
> Certified Reproducible • Fail-Closed Security • Zero Simulated Claims • Real On-Chain Cryptographic Proofs

---

## 1. Executive Summary & Project Story

**JarSol** is an autonomous Web 4.0 artificial intelligence automaton and neural execution environment built natively on the **Solana** blockchain. Combining **Conway Cellular Automaton entropy dynamics**, real-time **Google Gemini Flash AI reasoning**, and deterministic **SPL Token mechanics**, JarSol creates a self-sustaining agentic computational ecosystem where AI agent inference is metered, verified, and settled on-chain.

Rather than relying on marketing abstractions, JarSol adheres strictly to an uncompromising **Reality-First Engineering Policy**: every feature, token metric, and security guarantee shown in the user interface is backed by runnable, open-source code and finalized on-chain state on the Solana blockchain.

---

## 2. Problem Statement vs. JarSol Solution

| Traditional Web3 / AI Projects | The JarSol Reality-First Solution |
| :--- | :--- |
| **Centralized AI Silos:** AI agent compute runs on private cloud infrastructure with opaque server-side execution. | **Decentralized Compute Metering:** Agent reasoning cycles consume verifiable on-chain micro-gas derived from Conway cellular lattice entropy. |
| **Simulated Blockchain Data:** Projects display mock balances, fake transaction receipts, and synthetic test outputs. | **100% Cryptographic On-Chain Evidence:** Every balance, mint, ATA, and transaction signature is validated live against Solana RPCs at finalized commitment. |
| **Unsafe Deployment Gates:** Private keys bundled in client code, uncontrolled mainnet deployment risks, and leaky configurations. | **Hard-Gated Fail-Closed Boundary:** Routine operations restricted to Devnet/Testnet; Mainnet deployment is locked behind dual explicit approval variables and strict keypair validation. |
| **Vulnerable Dependencies:** Heavy legacy SDK chains importing vulnerable packages (e.g. `bigint-buffer` GHSA-3gc7-fjrx-p6mg). | **Zero-Dependency Native Helpers:** Direct `@solana/web3.js` and Borsh instruction serialization achieving **0 High / 0 Critical** production vulnerabilities. |

---

## 3. System Architecture Blueprint

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        JarSol Frontend Layer                           │
│     React 18 • Vite • TailwindCSS • Lucide Icons • Web Audio Engine    │
│   (Real Wallet Adapters: Phantom / Solflare • Cluster State Switcher) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON-RPC & REST
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        JarSol Backend Engine                           │
│               Node.js • Express • TypeScript • Fail-Closed             │
│   - /api/solana/balance/:pubkey    -> Confirmed on-chain balance query │
│   - /api/solana/canonical-mint     -> Multi-cluster registry provider  │
│   - /api/solana/deploy-token       -> Testnet/Devnet mint allocation   │
│   - /api/gemini/chat               -> Configured Gemini reasoning core │
│   - /api/dex/swap                  -> Fail-closed roadmap preview      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Native Solana Instructions
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Solana Blockchain Layer                         │
│   - Canonical SPL Token Program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623│
│   - Associated Token Account (ATA): ATokenGPvbdGVxr1b2hvZbsiqW5xWH25ef │
│   - Metaplex Token Metadata V3: metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt5 │
│   - Canonical Testnet Mint: AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQx│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Verified On-Chain Evidence (Solana Testnet)

The canonical Phase 4 Testnet deployment serves as the gold-standard verified production template:

| Attribute | Verified On-Chain Value | Verification Proof |
| :--- | :--- | :--- |
| **Solana Cluster** | Solana Testnet | `https://api.testnet.solana.com` |
| **Token Mint** | `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG` | [View on Solana Explorer](https://explorer.solana.com/address/AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG?cluster=testnet) |
| **Token Program** | Legacy SPL Token (`Tokenkeg...`) | Standard 82-byte space |
| **Decimals** | `9` | Decimals = 9 |
| **Total Supply** | `1,000,000,000` (1 Billion $JARSOL) | Exact `1000000000000000000` raw units |
| **Mint Authority** | **REVOKED (`null`)** | 100% fixed, mathematically immutable supply |
| **Freeze Authority** | **REVOKED (`null`)** | 100% trustless, non-freezable token accounts |
| **Deployer ATA** | `DYfJeDoaU4P3PV2E5SQQ8o4NpDuWqdPkb4qRuKrdzEtz` | Holds 100% of initial circulating supply |
| **Metaplex Metadata PDA** | `27CcdoNxjp5LNLtTYRmvDJVSThhbvXuFjGjZPYBD6AhR` | Metaplex V3 account verified on-chain |

---

## 5. Security & Fail-Closed Boundary

1. **Dependency Hygiene**:
   - Zero Critical vulnerabilities.
   - Zero High vulnerabilities in production dependencies (`npm audit --omit=dev --audit-level=high` exits 0).
   - Upstream vulnerable `bigint-buffer` eliminated by replacing heavy legacy Metaplex/SPL packages with lightweight native byte helpers ([`scripts/spl-helper.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/scripts/spl-helper.ts) & [`scripts/metaplex-helper.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/scripts/metaplex-helper.ts)).
2. **Mainnet Airgap**:
   - Mainnet deployment requires explicit local environment configuration:
     - `SOLANA_NETWORK=mainnet-beta`
     - `MAINNET_DEPLOYMENT_APPROVED=true`
     - Explicitly specified `SOLANA_KEYPAIR_PATH` (never defaults to development keys).
   - Automated CI and test suites NEVER execute against mainnet or spend mainnet SOL.
3. **Wallet Signing Autonomy**:
   - Client applications never store, touch, or transmit private keys.
   - All transactions require interactive user approval via standard browser wallet extensions (Phantom / Solflare).

---

## 6. One-Click Verification Pipeline (`finish:all`)

To independently verify the entire repository in a single command, run:

```bash
npm run finish:all
```

This consolidated master command runs all 9 validation gates sequentially:
1. `npm ci` — Validates locked dependency synchronization.
2. `npm audit --omit=dev --audit-level=high` — Enforces 0 High / 0 Critical vulnerabilities.
3. `npx tsc --noEmit` — Typechecks the entire TypeScript codebase.
4. `npm run build` — Validates production Vite bundling.
5. `npx tsx scripts/verify-secrets.ts` — Scans for leaked keys and ensures fail-closed mainnet guards.
6. `npm run verify:devnet` — Live on-chain verification of Devnet canonical mint.
7. `npm run verify:testnet` — Live on-chain verification of Testnet canonical mint.
8. `npm run verify:testnet:fresh` — Full audit of Testnet mint, ATA, supply, revoked authorities, and Metaplex metadata PDA.
9. `Documentation & Reality Check` — Validates dossier and reality policies.

**Output:** Emits a deterministic `🟢 READY` verdict upon 100% completion.

---

## 7. 3-Minute Judge Demo Flow

1. **Launch the Application**:
   ```bash
   npm start
   ```
2. **Explore Live Blockchain Telemetry**:
   - Navigate to the **Launchpad** tab to inspect the canonical 1,000,000,000 $JARSOL deployment with direct links to Solana Explorer.
3. **Connect a Solana Wallet**:
   - Open the **Connect Wallet** modal to observe extension detection (Phantom / Solflare) or generate an instant ephemeral Devnet keypair for sandbox testing.
4. **Interact with AI Polymath Agent**:
   - Navigate to the **Humanoid Jarvis** or **Gemini Brain** terminal to execute real-time multi-modal reasoning queries.
5. **Inspect Reality-First Disclosures**:
   - Review the **DEX Swap** and **PQC Shield** tabs to see transparent roadmap disclaimers and educational quantum threat models.
6. **Execute Automated On-Chain Verification**:
   ```bash
   npm run verify:testnet:fresh
   ```
   - Watch the script query Solana Testnet RPC live and confirm token supply, revoked authorities, and Metaplex metadata PDA.

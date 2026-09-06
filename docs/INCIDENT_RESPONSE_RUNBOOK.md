# JARSOL INCIDENT RESPONSE & ROLLBACK RUNBOOK

> **Standard**: Solana Production Readiness & Zero-Trust Operational Safety  
> **Status**: APPROVED  
> **Scope**: Devnet, Testnet, and Mainnet-Beta Preflight

---

## 1. Incident Severity Classification

| Level | Definition | Response SLA | Action Required |
|---|---|---|---|
| **SEV-1 (Critical)** | Key compromise, unauthorized funds transfer, RPC catastrophic partition | < 15 minutes | Immediate emergency pause, isolate signer, rotate RPC credentials. |
| **SEV-2 (High)** | RPC rate-limiting / degraded throughput, PQC handshake verification failure | < 1 hour | Switch to fallback secondary RPC endpoint, engage fail-closed circuit breaker. |
| **SEV-3 (Medium)** | UI anomaly, minor metadata mismatch, non-blocking telemetry delay | < 4 hours | Diagnostic triage, hotfix branch, routine CI deployment. |

---

## 2. On-Chain Security Controls & Immutability Proof

### A. Supply Inflation Immunity (Mint Authority Revocation)
* **Devnet Mint**: `224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn`  
  * Mint Authority: **REVOKED (`null`)**
* **Testnet Mint**: `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG`  
  * Mint Authority: **REVOKED (`null`)**
  * Freeze Authority: **REVOKED (`null`)**
* **Guarantee**: No party—including the original deployer—can ever mint additional tokens or freeze user accounts on Testnet. Supply is mathematically capped at 1,000,000,000 $JARSOL.

---

## 3. Circuit Breakers & Emergency Procedures

### Circuit Breaker 1: Mainnet Fail-Closed Gate
* **Enforcement**: `scripts/deploy-mainnet.ts` strictly requires:
  1. `SOLANA_NETWORK === 'mainnet-beta'`
  2. `MAINNET_DEPLOYMENT_APPROVED === 'true'`
  3. `SOLANA_KEYPAIR_PATH` pointing to an existing, non-default keypair file with sufficient balance.
* **Emergency Halt**: Unsetting or setting `MAINNET_DEPLOYMENT_APPROVED=false` instantly terminates any deployment process.

### Circuit Breaker 2: API Unimplemented Endpoint Gates
* **Enforcement**: In `server.ts`, sensitive endpoints that do not have certified live execution return HTTP 501 `NOT_IMPLEMENTED`:
  * `POST /api/dex/swap` -> `501 NOT_IMPLEMENTED`
  * `POST /api/pqc/generate-keys` -> `501 NOT_IMPLEMENTED`
  * `POST /api/pqc/verify-signature` -> `501 NOT_IMPLEMENTED`
* **Protection**: Prevents client-side spoofing or false assumption of on-chain PQC settlement.

---

## 4. RPC Outage & Failover Matrix

If public RPC endpoints (`api.devnet.solana.com`, `api.testnet.solana.com`) experience rate limiting (HTTP 429) or transient timeouts:
1. **Automated Retries**: Scripts implement exponential backoff with jitter (`runWithRetry` in verification scripts).
2. **Fallback RPC Configuration**:
   ```bash
   # Set custom private RPC endpoint via environment variable
   export SOLANA_RPC_URL="https://your-private-rpc-node.solana.com"
   export SOLANA_TESTNET_RPC="https://your-private-testnet-node.solana.com"
   ```
3. **Health Verification**: Check node block height and slot lag:
   ```bash
   npx tsx -e "import { Connection } from '@solana/web3.js'; const c = new Connection(process.env.SOLANA_RPC_URL); c.getSlot().then(s => console.log('Current Slot:', s));"
   ```

---

## 5. Rollback Procedure

In the event of a critical frontend or backend regression:
1. **Frontend Rollback**:
   * Revert to last certified git tag on `main`:
     ```bash
     git checkout <LAST_KNOWN_STABLE_COMMIT>
     npm run build
     ```
2. **On-Chain Token State**:
   * Because SPL Token mint authority is revoked, token state is immutable. No on-chain rollback is needed or possible for token parameters.
3. **Post-Mortem Protocol**:
   * Document Root Cause Analysis (RCA) within 24 hours in `docs/incidents/YYYY-MM-DD-rca.md`.

# ⚡ JarSol — Reality-First Solana Project

## Status

**CI/CD:** ✅ Green  
**Production dependency audit:** ✅ 0 High / 0 Critical gate passing  
**Devnet/Testnet verification:** ✅ Automated and passing  
**Mainnet:** 🔒 **Not deployed — explicit approval required**

JarSol is a Web 4.0 / autonomous-agent project with Solana integration and a reality-first engineering policy: claims must be backed by runnable code, CI results, or independently verifiable on-chain evidence.

---

## ⛓️ Verified Solana Evidence

### Canonical Testnet mint

- **Mint:** `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG`
- **Decimals:** 9
- **Supply:** 1,000,000,000 JARSOL
- **Mint authority:** Revoked
- **Freeze authority:** Revoked

### Automated verification

```bash
npm run verify:devnet
npm run verify:testnet
npm run verify:testnet:fresh
```

The CI workflow runs locked dependency installation, TypeScript checks, production build, on-chain verification, and a production dependency audit.

---

## 🔐 Mainnet Safety Policy

Mainnet deployment is intentionally fail-closed.

No mainnet deployment should be performed unless the repository's explicit deployment gates are satisfied and a human owner gives explicit approval. Passing CI or testnet verification does **not** itself certify a mainnet launch.

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

### Full verification

```bash
npm run verify:all
```

---

## 🤖 Project Direction

The next development focus is product readiness:

1. **Multi-wallet UX** with clear network and transaction confirmation.
2. **Live demo polish** with evidence-based status indicators.
3. **Competition/submission materials** including architecture, demo flow, and reproducible verification.
4. **Security documentation** covering keys, permissions, dependencies, and mainnet gates.
5. **Mainnet preflight** only after explicit human approval and independent review.

---

## Reality-First Claims Policy

JarSol documentation must not describe simulated, planned, or unverified functionality as live production infrastructure.

Any claim about:
- token supply,
- authorities,
- network deployment,
- swaps/liquidity,
- burns,
- security compliance,
- AI model availability,

must be traceable to current code, CI evidence, or independently verifiable public evidence.

---

## License

MIT

# JarSol — Reality-First Solana Web4 Prototype

JarSol is a Web4/AI interface and Solana prototype developed with a **reality-first engineering policy**: features are only described as live when independently verifiable.

## Current verified baseline

- GitHub Actions CI: quality/build, Solana verification, and production dependency audit are maintained as separate gates.
- Production code uses `@solana/web3.js` and lightweight project helpers.
- Mainnet deployment remains explicitly human-gated.
- Testnet/Devnet verification scripts are included for the project's recorded evidence.

> **Important:** Testnet/Devnet evidence is not a Mainnet deployment certificate. No marketing claim should imply otherwise.

## Quick start

```bash
npm ci
npm run build
npm start
```

Open the local dashboard at the Vite URL shown in your terminal.

## Verification

```bash
npm run verify:devnet
npm run verify:testnet
npm run verify:testnet:fresh
npm audit --omit=dev --audit-level=high
```

For the full gate sequence:

```bash
npm run verify:all
```

## Project gates

1. Security and dependency gate
2. TypeScript and production build gate
3. Independent Solana RPC verification
4. Secrets/keypair safety
5. Mainnet preflight and explicit human approval

## Mainnet policy

Mainnet actions are intentionally **not part of routine CI**. Deployment requires the repository's explicit safety gates and a separate human approval decision.

## Documentation

- [Security policy](SECURITY.md)
- [Competition readiness](docs/COMPETITION_READINESS.md)
- [Product roadmap](docs/ROADMAP.md)
- [Mainnet preflight](docs/MAINNET_PREFLIGHT.md)

## License

MIT

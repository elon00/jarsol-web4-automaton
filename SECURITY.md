# Security Policy

## Reality-first rule
Do not report a feature as deployed, audited, compliant, or secure unless the corresponding evidence can be independently checked.

## Secrets
- Never commit private keys, seed phrases, API secrets, or wallet keypair files.
- Keep deployment keypairs outside version control.
- Rotate any credential that may have been exposed.

## Release gate
Before a release, run:

```bash
npm ci
npx tsc --noEmit
npm run build
npm run verify:devnet
npm run verify:testnet
npm run verify:testnet:fresh
npm audit --omit=dev --audit-level=high
```

# Live Flow Test Checklist

## Wallet balance
- Invalid wallet address returns an error state.
- RPC failure is displayed as unavailable; no synthetic balance is shown.
- Successful responses are marked with the active network.

## Airdrop
- Only Devnet/Testnet are permitted.
- Failed requests return failure; no synthetic transaction signature is generated.
- UI should display the returned signature only after a verified response.

## Token deployment
- Client-side deployment simulation is disabled.
- Deployment requires the server-side configured payer and an approved test cluster.
- Mainnet remains outside this flow and requires the dedicated explicit-approval gate.

## Release evidence
Run:

```bash
npm ci
npx tsc --noEmit
npm run build
npm run verify:all
```

A passing checklist is evidence of the tested scope only; it does not certify Mainnet deployment or legal compliance.

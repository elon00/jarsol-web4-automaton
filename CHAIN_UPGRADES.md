# Solana Alpenglow compatibility

Reviewed 2026-10-21 UTC. JarSol uses the shared read-only capability SDK from [Plonky](https://github.com/elon00/plonky/blob/main/src/chain-upgrades.ts). This application integration detects Solana consensus; it does not activate a network upgrade or implement Ethereum consensus.

Install and verify the application:

```text
npm ci --ignore-scripts
npm run test:upgrades
npm run typecheck
npm run build
```

Run the backend with `npm run server`. Configure `SOLANA_NETWORK` as devnet, testnet or mainnet-beta and `SOLANA_RPC_URL` as the matching HTTPS endpoint. Defaults target Devnet. Keep private provider URLs on the server; browser bundles are public. A network mismatch fails the identity check. Cluster genesis hashes are pinned in the shared SDK; a Devnet reset requires reviewing the new identity before updating the pin.

The backend exposes `GET /api/solana/consensus` and includes its result in `/api/health`. Backend balance reads, MCP balance reads and the browser balance fallback select the commitment from the same runtime probe. Probe requests are coalesced and cached for 15 seconds with `checkedAt` metadata. The browser fallback uses the public cluster endpoint. Backend responses omit configured provider URLs and raw provider error text.

## Runtime detection

The [official migration guide](https://solana.com/upgrades/alpenglow) describes `getAgGenesisCert`. A null result means TowerBFT, method-not-found means an older RPC server, and a certificate reports that the cluster migrated. The SDK checks the configured genesis identity first, distinguishes these outcomes, and validates certificate structure. It does not independently verify the BLS signature.

A structurally valid provider-reported certificate selects finalized. TowerBFT and unknown/unavailable capability results retain confirmed. Identity or connectivity errors are not reported as successful probes. Dates and client-version strings never select a new commitment. Check `upgrade.capability`, `upgrade.consensus` and `checkedAt` rather than assuming a target latency.

Alpenglow changes consensus, leaving program execution, transaction formats and fees unchanged. This patch changes no signing or deployment behavior and sends no transactions. Mainnet deployment remains a separate release decision.

## Streaming and further upgrades

Geyser consumers need per-connection buffers keyed on slot and bank_id; reconciliation across providers uses blockhash because bank IDs are node-local. Indexers must review vote-transaction counts, tick assumptions and Clock timestamp behavior. JarSol's account-state reads do not implement a Geyser indexer. Rotor is a later phase without a scheduled activation in the reviewed source.

Ethereum Glamsterdam probing and its standalone CLI are provided by the canonical Plonky workbench, not by this JarSol checkout. Other chains require their own official specifications, identity checks and compatibility tests. Local/hosted test success is not an independent security certification or an application finality guarantee.

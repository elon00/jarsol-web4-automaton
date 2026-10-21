# Wallet balance behavior

Wallet connection and balance availability are separate states. A connected provider can remain connected while its RPC is unavailable. The UI then displays **Unavailable**, rather than interpreting a failed read as zero.

A backend balance is accepted only when its verified flag, public address, selected network, safe lamport count and SOL conversion agree. Invalid or mismatched responses fall back to the selected network's RPC, whose genesis identity is checked by the upgrade monitor. Failed or malformed RPC reads raise an availability error. Network changes invalidate the previous values; responses from older refresh requests cannot overwrite the current selection.

JARSOL display balances combine accounts matching the configured canonical mint for that network. An unrelated first token is never treated as JARSOL. Numeric UI amounts are rounded display values; they must not be used as transaction authorization or accounting amounts. Current account enumeration covers the legacy SPL Token program, not Token-2022 extensions.

The disposable wallet is Devnet only. Its generated key exists in page memory and is discarded on reload. Opening it removes the former session-storage entry without reading or logging it. Use an external browser wallet for other networks. Observing the configured public address is labelled watch-only and does not prove access to a signer.

The launchpad's backend uses its operator payer. The UI does not automatically request funds for a connected wallet as a side effect of deployment. Backend transaction authorization, cluster enforcement, operator funding and independent security review remain separate release requirements; a connected UI wallet does not satisfy them.

Run `npm run test:balances` for identity, fallback, malformed data, unavailable-versus-zero, canonical-mint, disposable-wallet and display regression checks. `npm test` includes these checks and the existing integration, upgrade and type checks.

# Backend operation boundaries

The backend listens on 127.0.0.1 by default. Configure JARSOL_HOST explicitly before exposing a listener, and place any remote deployment behind a TLS gateway. The public GitHub Pages site remains a static browser application; it does not contain operator credentials.

Privileged HTTP operations are disabled when JARSOL_OPERATOR_TOKEN is empty or invalid. An operator can inject a random 32-byte hexadecimal credential through a server secret manager. Authorized CLI or server requests use the Authorization Bearer header. Query-string credentials are ignored and browser-origin operator requests are rejected. Never put this credential in source, chat, a VITE_ variable, local storage or the public frontend.

Public POST access is limited to the read-only MCP tools and unsigned Devnet/Testnet Action builder. The Action builder checks the configured cluster identity before preparing a transaction; it does not sign or send one. Other POST operations require operator authorization before JSON parsing or handler execution.

Airdrops and token deployment additionally require an explicit supported network matching server configuration. The identity monitor must verify the RPC genesis before payer access or a transaction request. Mainnet is refused by these routes. Airdrops are limited to at most 2 SOL, expressed in whole lamports. Keypair files must contain 64 valid bytes and reside outside the checkout and static directories; no keypair is generated as a fallback.

The legacy payment endpoints, fabricated swap receipts, random agent proofs and server key-export demos have been removed. These routes return 501. Commerce discovery returns an unavailable response with no services, and the commerce page requests no payment. Browser cryptography demos remain local and experimental. DEX quotes are labelled mathematical simulations. A stored deployment registry is repository evidence rather than live RPC verification.

MCP metadata and startup messages omit the configured RPC URL. Public error responses do not forward provider exception messages. JSON bodies are limited to 1 MiB; RPC fetches and HTTP request/header lifetimes have bounds. These controls are not a complete deployment security review.

Run npm run test:backend for HTTP authorization and network-boundary regression checks. Run npm test and npm run build for the integrated checks. No test sends funds or deploys a token. A production release still needs user authentication, rate limiting and capacity testing, a reviewed signing/custody design, transaction recovery and idempotency, independent security review, and owner acceptance. A real payment service needs a reviewed protocol adapter and durable replay protection before it is advertised.

The browser links Devnet users to the official faucet rather than calling the operator-only airdrop route. The launchpad is a read-only repository registry and offers no browser deployment action. Static deployment records do not establish current on-chain authority, metadata or supply.

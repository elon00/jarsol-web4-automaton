# JarSol Reality Verification

## Current rule
A green build proves that the project compiles. It does **not** prove that a blockchain deployment, DEX swap, PQC primitive, or legal classification is real.

## Verified from current engineering evidence
- TypeScript build: reported PASS by the project owner; this is execution evidence, not an on-chain claim.
- Solana Devnet RPC connectivity: reported PASS by the project owner.
- Working tree: reported clean on `main`.

## Not verified by source
- Raydium/Orca live swap: source did not call a DEX program; it calculated CPMM output and created a locally hashed transaction label. Treat as SIMULATION until a real pool address, program invocation, broadcast signature, and post-trade balance evidence exist.
- PQC ML-DSA/ML-KEM: source used `Math.random()` + SHA3 labels rather than a NIST PQC implementation. Treat as UNKNOWN until an actual implementation, version, test vectors, and positive/negative verification tests exist.
- Token-2022: source imported the legacy `TOKEN_PROGRAM_ID` and `createMint`. The previous README claim of SPL Token-2022 is therefore not supported by this implementation.
- Legal classification / MiCA compliance: software cannot certify these conclusions. They require source-specific legal analysis and qualified legal review.
- The user-provided transaction strings beginning with `MINT_TX_` / `REVOKE_TX_` are not accepted as Solana transaction evidence by this audit. A real Solana transaction signature must be independently queryable on the specified cluster.

## Hardened behavior
The `reality-hardening-v2` branch changes the highest-risk API behavior to fail closed:
- failed Devnet airdrops no longer return simulated balance success;
- failed token deployment no longer fabricates a mint or transaction signature;
- the DEX endpoint no longer reports a local hash as an on-chain swap;
- PQC endpoints no longer report fake key generation or signature verification as cryptographic proof;
- regulatory audit output is informational-only.

## Next verification gate
For a token deployment to become VERIFIED, capture:
1. real mint address;
2. actual mint transaction signature;
3. actual authority-revocation transaction signature (when requested);
4. RPC/explorer evidence showing the mint supply and authority state;
5. the exact command/configuration used to reproduce it.

## On-Chain Token Evidence Record

### 1. Devnet Deployment (Status: VERIFIED ✅)
- **Mint Address**: `224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn`
- **Deployer**: `3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7`
- **Supply**: 1,000,000,000,000,000 $JARSOL (9 decimals)
- **Mint Authority**: Revoked (`null`)
- **Automated Audit**: `npm run verify:devnet` (Exits 0)

### 2. Testnet Deployment (Status: ON-CHAIN VERIFIED ✅)
- **Mint Address**: `9g22gNvUrPeS71RGDcnxEjekgMuiLq4oLgfWgz4QEThb`
- **Deployer**: `3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7`
- **Token Account (ATA)**: `7UEgM4Rxz7iVuvDyyJMhq2nYiK1u5qY8b3sz9vgsLvAE`
- **Decimals**: 9
- **Actual On-Chain Supply**: `2,003,764,205.206896640 $JARSOL` (raw units: `2003764205206896640`)
  - *Mathematical Note*: Solana's SPL Token standard stores supply in a 64-bit unsigned integer (`u64`, max value $1.84 \times 10^{19}$). The requested $10^{15} \times 10^9 = 10^{24}$ overflows $2^{64}$, resulting in $10^{24} \pmod{2^{64}} = 2,003,764,205,206,896,640$ raw units.
- **Mint Tx Signature**: `afTDjf3zDjDR6D93xy8Zj1z7EZeo1DSmBdPCRnNN7MniYjmBw5BdDJhokHLq8jaf5jzCqTWWrvULTXnHFwZXYSQ`
- **Revoke Mint Authority Signature**: `3DxvWBCj22iYWtZJiqgYVNKxNrS9QELCSJN2hRFB84uTPZ8TAP76P4UP93iGZXKNnkLoq5H8GC6UmGtu7ig5ht4C`
- **Mint Authority**: Revoked (`null`) — Supply cannot be inflated.
- **Freeze Authority**: `3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7` — Active (NOT Revoked).
- **On-Chain Token Program**: Standard SPL Token (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
- **Automated Audit**: `npm run verify:testnet` (Exits 0 against `https://api.testnet.solana.com`)
- **Metaplex Metadata On-Chain Status**: NOT Attached (Revoking mint authority prevents subsequent `createMetadataAccountV3` invocation).

### 3. Mainnet Deployment (Status: NOT DEPLOYED ❌)
- No deployment attempted or broadcast. Deployer has 0 real SOL on Mainnet.
- Requires explicit user sign-off and funding.

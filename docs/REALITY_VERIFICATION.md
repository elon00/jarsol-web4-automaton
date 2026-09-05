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

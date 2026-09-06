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

### 2. Testnet Canonical Deployment — Phase 4 Fresh Safe Dry Run (Status: ON-CHAIN VERIFIED PRODUCTION TEMPLATE ✅)
- **Mint Address**: `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG`
- **Deployer**: `3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7`
- **Token Account (ATA)**: `DYfJeDoaU4P3PV2E5SQQ8o4NpDuWqdPkb4qRuKrdzEtz`
- **Decimals**: 9
- **Exact On-Chain Supply**: `1,000,000,000 $JARSOL` (raw units: `1000000000000000000`, 10^18)
  - *Mathematical Proof*: $10^9 \times 10^9 = 10^{18} < 2^{64}-1 \approx 1.844 \times 10^{19}$. Fits completely inside $u64$ without truncation.
- **On-Chain Metaplex Metadata V3**:
  - **PDA Address**: `27CcdoNxjp5LNLtTYRmvDJVSThhbvXuFjGjZPYBD6AhR`
  - **Status**: **ATTACHED & VERIFIED ON-CHAIN ✅** (Created before mint authority revocation)
  - **Metadata Tx Signature**: `3qvix7RfLU2jvqTGchDwUm1eeAagHLKYgsv6CNDTJuSVMSrWxoKfHSoyaL1BmdadeEPkEDTKY5Kh9M8w5BGmLwyd`
  - **URI**: `https://raw.githubusercontent.com/elon00/jarsol-web4-automaton/main/public/jarsol-metadata.json`
- **Mint Tx Signature**: `rg3zCWaTpVEVRGVhEbjFUtDuDkJ7ntz2MdMCkSqZCQL8u6yofmA2us2WtxytXtjXaPindDLUs8wgqE2v9sAhGwZ`
- **Revoke Mint Authority Signature**: `4kqS6DZ84yHwFj8ERzHwEey4RxgLmzuxD1g1obLdAmRkjKygmmciCyossgC5GQasaDYVNgmqD4yeKj8LDb29sh9m`
- **Revoke Freeze Authority Signature**: `2PbX3KooEBYwPr8EwRf1zVSNwvhR5JpwFoNziUBoD9wBkTH9sT7BhsC26EfDmWiBW1MXNx9syUGMa7Sg4LnuJH7e`
- **Mint Authority**: **REVOKED (`null`)** — Supply is mathematically locked.
- **Freeze Authority**: **REVOKED (`null`)** — Option A: 100% Trustless Censorship Resistance.
- **Token Program**: Standard SPL Token (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
- **Automated Audit**: `npm run verify:testnet:fresh` (Exits 0 against `https://api.testnet.solana.com`)
- **Historical Testing Milestone**: Initial testnet mint `9g22gNvUrPeS71RGDcnxEjekgMuiLq4oLgfWgz4QEThb` had u64 supply wrapping ($10^{24} \to 2.003\text{B}$) and active freeze authority, successfully superseded by this Phase 4 dry run.

### 3. Mainnet Deployment (Status: NOT DEPLOYED ❌)
- No deployment attempted or broadcast. Deployer has 0 real SOL on Mainnet.
- Requires explicit user sign-off and funding.

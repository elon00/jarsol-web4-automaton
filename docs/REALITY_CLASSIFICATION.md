# JARSOL Reality Classification

This document is generated as a review contract for the one-click pipeline.

## Classification

- REAL: independently reproducible execution with direct code/runtime or on-chain evidence.
- SIMULATION: computational model or classical emulation; it must not be labeled as native quantum execution.
- MOCK: fixture, placeholder, or demonstration-only behavior.
- UNVERIFIED: a claim lacking sufficient automated evidence.

## Mandatory boundaries

- Passing the pipeline does not convert a simulation into a real quantum computation.
- Passing local cryptographic tests does not constitute an independent cryptographic audit.
- Off-chain PQC protection must not be represented as native Solana L1 PQC support.
- Mainnet deployment remains fail-closed unless separately reviewed and explicitly authorized.

## One-click command

`npm run finish:all`

The command is fail-closed: the first failed mandatory gate blocks the final verdict.

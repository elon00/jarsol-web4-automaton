# JarSol Reality Audit

## Status
**Audit branch:** reality-first-audit  
**Rule:** No feature may be described as real, live, deployed, compliant, secure, or production-ready without reproducible evidence.

## Evidence classes
- VERIFIED: reproducible runtime/on-chain/test evidence exists.
- IMPLEMENTED: source implementation exists but has not been independently verified.
- SIMULATION: intentionally modeled or mocked behavior.
- PLANNED: documented intent with no implementation evidence.
- UNKNOWN: repository evidence could not be retrieved or reproduced.

## Current repository-access finding
The repository metadata is accessible, but the connected GitHub content endpoint currently returned Not Found for direct file retrieval. Therefore no source-level claim has been upgraded to VERIFIED by this audit.

## Required evidence
### Blockchain
Mint address, network, transaction signature, explorer-verifiable state, and reproducible deployment command.

### DEX
Pool address, network, transaction signatures, program identifiers, and independently reproducible swap evidence.

### AI
Actual provider and model name must be read from runtime configuration; marketing text must not hard-code an unverified model.

### PQC
Algorithm/library version, test vectors, unit tests, and a statement of the exact security scope. Never claim absolute immunity.

### Compliance
Software checklists are informational only and must not claim legal classification or legal approval.

## Acceptance rule
A feature becomes VERIFIED only when automated tests or external evidence are linked from the project and can be reproduced.

# Reality-First Architecture

## Core
Planner -> Policy Gate -> Executor -> Observer -> Audit Log

## Capability boundaries
- Agent: plans tasks but does not bypass permissions.
- Tools: execute only within explicit capability and confirmation boundaries.
- Blockchain: separates transaction construction, user approval/signing, broadcast, and verification.
- PQC: isolated behind tested cryptographic interfaces.
- UI: reads status from evidence records rather than marketing constants.

## Reality Status schema
```json
{
  "capability": "example",
  "status": "UNKNOWN",
  "environment": null,
  "evidence": [],
  "last_verified_at": null
}
```

## Verification pipeline
1. Build
2. Unit tests
3. Integration tests
4. Security checks
5. External/on-chain verification where applicable
6. Publish evidence
7. Mark VERIFIED

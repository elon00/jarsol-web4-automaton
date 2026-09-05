# JarSol Reality Guard

## Purpose
Prevent unsupported claims, embedded secrets, and unsafe AI-generated changes from becoming trusted project state.

## Blocking rules
1. No `VERIFIED` or `LIVE` label without machine-checkable evidence.
2. No absolute cryptographic claims such as "100% quantum-proof" or "zero leakage".
3. No legal conclusion such as "SEC confirmed non-security" or "MiCA fully passed" from an AI-generated report.
4. No embedded API keys, bearer tokens, private keys, wallet secrets, or signing material.
5. AI-generated source must pass deterministic syntax/static preflight before writing.
6. Agent-created files must stay inside the declared project workspace.
7. Shell execution, `eval`, and `exec` from generated source are blocked unless explicitly reviewed.
8. Automatic dependency installation from untrusted AI output is disabled by default.

## Evidence statuses
- VERIFIED: reproducible test or external evidence exists.
- IMPLEMENTED: implementation exists, verification incomplete.
- SIMULATION: intentionally mocked/demo behavior.
- UNKNOWN: insufficient evidence.
- FAILED: verification failed.

## Fail-closed principle
Missing, stale, contradictory, or unverifiable evidence downgrades a capability to UNKNOWN. UNKNOWN must never become VERIFIED by inference.

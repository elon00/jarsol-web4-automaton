# Truth & Claims Policy

## The JarSol rule
**NO CLAIM WITHOUT EVIDENCE.**

UI, README, API responses, demos, and pitch material must distinguish VERIFIED, IMPLEMENTED, SIMULATION, PLANNED, and UNKNOWN.

## Forbidden wording without evidence
Do not state or imply:
- guaranteed security
- 100% immunity
- legally confirmed non-security status
- real liquidity or burned LP tokens
- live on-chain deployment
- production readiness

## Runtime truth
The application should expose a Reality Status record for every major capability containing:
1. capability name
2. status
3. environment/network
4. evidence identifier
5. last verification time
6. verifier/test name

## Safe defaults
If evidence is missing, status is UNKNOWN. Unknown must never be rendered as live.

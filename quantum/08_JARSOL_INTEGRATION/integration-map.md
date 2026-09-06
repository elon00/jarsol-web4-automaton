# JARSOL QUANTUM MODULE INTEGRATION MAP

This document maps the quantum research files and TypeScript modules directly to components, scripts, and workflows in the JarSol project.

---

## 🗺️ Module to Component Mapping

| Research / Engine Module | Implementation File | Consuming JarSol Component | Purpose & UI Display |
|---|---|---|---|
| **Cryptographic Agility** | `quantum/02_PQC_SECURITY/crypto-agility.ts` | `src/components/PqcSecurityModule.tsx` | Algorithm selector pill; displays active cryptographic cipher suite and fallback status. |
| **Hybrid Signature Envelope** | `quantum/02_PQC_SECURITY/hybrid-envelope.ts` | `src/components/PqcSecurityModule.tsx` | Dual signature test panel; displays Ed25519 (64B) + ML-DSA-65 (3,309B) combined envelope. |
| **Secure PQ Messaging** | `quantum/03_PQ_COMMUNICATION/secure-session.ts` | `src/components/PqcSecurityModule.tsx` | Agent peer-to-peer secure session demonstrator with X25519 + ML-KEM shared secret derivation. |
| **QUBO Portfolio Lab** | `quantum/04_QUANTUM_PORTFOLIO/benchmark-runner.ts` | `src/components/PqcSecurityModule.tsx` | Benchmark visualizer comparing Classical Markowitz vs. Simulated Annealing allocation on SPL tokens. |
| **Master CI Gate** | `quantum/06_TESTS/*.test.ts` | `scripts/finish-all.ts` | Integrated test runner guaranteeing all quantum primitives pass during `npm run finish:all`. |

---

## 💻 API Export Interfaces

All core primitives from `quantum/` export standard TypeScript interfaces for easy import into frontend and agent subsystems:

```typescript
import { createHybridEnvelope, verifyHybridEnvelope } from '../quantum/02_PQC_SECURITY/hybrid-envelope';
import { runHybridKeyExchange } from '../quantum/03_PQ_COMMUNICATION/hybrid-key-exchange';
import { runPortfolioBenchmark } from '../quantum/04_QUANTUM_PORTFOLIO/benchmark-runner';
```

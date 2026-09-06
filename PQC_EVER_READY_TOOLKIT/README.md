# ⚛️ PQC EVER-READY TOOLKIT: PLUG-AND-PLAY POST-QUANTUM CRYPTOGRAPHY

> **Purpose**: A self-contained, copy-paste-ready, zero-dependency toolkit designed for **instant integration into ANY Solana, Ethereum, or Web3 project**.  
> **Copy & Paste Guarantee**: Every module in `modules/` is 100% standalone, fully typed in TypeScript, and runs on standard Node.js (20+) and Web browsers without native `node-gyp` builds or OS-specific C libraries.

---

## 📁 Toolkit Directory Structure

```text
PQC_EVER_READY_TOOLKIT/
├── README.md                            # This guide: instant copy-paste tutorial & architecture
├── pqc-cli.ts                           # Universal CLI runner (keygen, sign, verify, kex, optimize)
│
├── modules/                             # Drop-in TypeScript modules (Copy into your project's src/)
│   ├── hybrid-envelope.ts               # Dual Ed25519 + ML-DSA-65 signature envelope engine
│   ├── hybrid-key-exchange.ts           # Dual X25519 + ML-KEM-768 shared secret establishment
│   ├── crypto-agility.ts                # Runtime algorithm switcher with downgrade guards
│   └── qubo-portfolio.ts                # Classical Markowitz vs. QUBO simulated annealing solver
│
└── snippets/                            # Copy-paste code snippets for common use-cases
    ├── react-snippet.tsx                # Ready-to-use React UI component with live gauges
    ├── node-agent-snippet.ts            # Autonomous bot/agent trade intent signer
    └── fast-keygen-snippet.ts           # 5-line script to generate quantum-resistant keypairs
```

---

## ⚡ 1-Minute Copy-Paste Integration

### Scenario 1: I want to sign agent trade intents with Quantum Protection
1. Copy `PQC_EVER_READY_TOOLKIT/modules/hybrid-envelope.ts` into your project.
2. In your code:
```typescript
import { generateHybridKeyPair, createHybridEnvelope, verifyHybridEnvelope } from './modules/hybrid-envelope';

// 1. Generate keypair (Ed25519 + ML-DSA-65)
const keys = generateHybridKeyPair();

// 2. Sign your transaction payload
const payload = new TextEncoder().encode(JSON.stringify({ action: 'SWAP', amount: 100 }));
const envelope = createHybridEnvelope(payload, keys);

// 3. Verify envelope (Requires BOTH classical and post-quantum signatures to pass)
const isLegit = verifyHybridEnvelope(payload, envelope);
console.log('Verified:', isLegit.valid); // true
```

---

### Scenario 2: I want quantum-secure inter-agent communication (HNDL Defense)
1. Copy `PQC_EVER_READY_TOOLKIT/modules/hybrid-key-exchange.ts` into your project.
2. In your code:
```typescript
import { runHybridKeyExchange } from './modules/hybrid-key-exchange';

// Derives a 256-bit symmetric session key combining X25519 + ML-KEM-768
const { aliceSharedSecret, bobSharedSecret, keysMatch } = runHybridKeyExchange();
console.log('Quantum Shared Secret Derived:', keysMatch); // true
```

---

### Scenario 3: I want discrete portfolio optimization (QUBO Annealing)
1. Copy `PQC_EVER_READY_TOOLKIT/modules/qubo-portfolio.ts` into your project.
2. Run optimization:
```typescript
import { solveQuboPortfolio } from './modules/qubo-portfolio';

const result = solveQuboPortfolio();
console.log('Optimal Asset Weights:', result.weights);
console.log('Sharpe Ratio:', result.sharpeRatio);
```

---

## 💻 Universal CLI Tool (`pqc-cli.ts`)

Run commands directly from your terminal:

```bash
# Generate a new NIST FIPS 204 ML-DSA-65 keypair
npx tsx PQC_EVER_READY_TOOLKIT/pqc-cli.ts keygen

# Sign a message with dual hybrid envelope
npx tsx PQC_EVER_READY_TOOLKIT/pqc-cli.ts sign "Approve Solana Trade"

# Execute simulated quantum annealing portfolio benchmark
npx tsx PQC_EVER_READY_TOOLKIT/pqc-cli.ts optimize

# Run hybrid key exchange test
npx tsx PQC_EVER_READY_TOOLKIT/pqc-cli.ts kex
```

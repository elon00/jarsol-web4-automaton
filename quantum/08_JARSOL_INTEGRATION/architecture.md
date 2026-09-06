# JARSOL QUANTUM-READY ARCHITECTURAL INTEGRATION

## 🏛️ System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       JARSOL WEB4 AUTOMATON APPLICATION                     │
│                                                                             │
│   ┌────────────────────────────────┐     ┌───────────────────────────────┐  │
│   │   Web4 Autonomous Agent Core   │     │  Quantum-Ready Security UI    │  │
│   │  (Intent, Reasoning, Trading)  │     │  (PqcSecurityModule.tsx)      │  │
│   └───────────────┬────────────────┘     └───────────────┬───────────────┘  │
└───────────────────┼──────────────────────────────────────┼──────────────────┘
                    ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JARSOL QUANTUM RESEARCH & EXECUTION LAYER                │
│                                                                             │
│   ┌───────────────────────────────┐     ┌────────────────────────────────┐  │
│   │     Track 1: PQC Security     │     │ Track 2: Secure Communication  │  │
│   │  - Crypto-Agile Container     │     │  - X25519 + ML-KEM-768         │  │
│   │  - Ed25519 + ML-DSA-65 Hybrid │     │  - AES-256-GCM Session Packets │  │
│   └───────────────┬───────────────┘     └────────────────┬───────────────┘  │
│                   │                                      │                  │
│   ┌───────────────┴───────────────┐     ┌────────────────┴───────────────┐  │
│   │  Track 3: Portfolio Optimizer │     │ Track 4: Research & Audit Lab  │  │
│   │  - Classical Markowitz Solver │     │  - NIST FIPS 203/204/205 Specs │  │
│   │  - QUBO Matrix Formulation    │     │  - License Matrix (MIT/OQS)    │  │
│   │  - Simulated Annealing Engine │     │  - Automated KAT Tests (CI)    │  │
│   └───────────────────────────────┘     └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                      │
                    ▼                                      ▼
┌───────────────────────────────────────┐  ┌──────────────────────────────────┐
│        SOLANA LAYER 1 BOUNDARY        │  │       EXTERNAL AGENT PEERS       │
│                                       │  │                                  │
│  - Standard Ed25519 Transactions      │  │  - Encrypted P2P Communications  │
│  - Canonical $JARSOL SPL Token Mint   │  │  - Harvest-Now-Decrypt-Later     │
│  - Prepared for future PQC SIMD L1    │  │    Immunity                      │
└───────────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 🔄 Lifecycle of a Quantum-Resilient Agent Action

1. **Intent Generation**: The agent evaluates market conditions or portfolio allocation requirements.
2. **Optimization**: If rebalancing is required, the agent calls the **QUBO Optimizer** (`quantum/04_QUANTUM_PORTFOLIO/`) to calculate optimal asset fractions across SPL tokens.
3. **Hybrid Manifest Creation**: The agent prepares an execution manifest containing trade parameters and signs it using the **Hybrid Envelope** (`quantum/02_PQC_SECURITY/`), appending both an Ed25519 signature and an ML-DSA-65 post-quantum signature.
4. **Peer Broadcast**: When sharing trading signals or coordinating with peer agents, the communication channel is secured via the **Hybrid Key Exchange** (`quantum/03_PQ_COMMUNICATION/`), ensuring future quantum eavesdroppers cannot decrypt historical agent traffic.
5. **Solana L1 Settlement**: The on-chain transaction is executed via standard Solana RPC using classical Ed25519, preserving 100% compatibility with Solana mainnet-beta, devnet, and testnet.

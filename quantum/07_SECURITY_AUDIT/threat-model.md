# JARSOL QUANTUM THREAT MODEL & RISK TIMELINE

## 🎯 Threat Vectors & Quantum Algorithms

| Threat Vector | Affected Primitive | Quantum Algorithm | Quantum Complexity | Classical Equivalent | Mitigation Strategy in JarSol |
|---|---|---|---|---|---|
| **Public Key Cryptanalysis** | Ed25519, X25519, RSA, ECDSA | **Shor's Algorithm** | $\mathcal{O}((\log N)^3)$ (Polynomial Time) | Sub-exponential | Migrate to **NIST FIPS 204 (ML-DSA)** and **FIPS 203 (ML-KEM)** via hybrid wrappers. |
| **Symmetric Cipher Brute-Force** | AES-128, ChaCha20-128 | **Grover's Algorithm** | $\mathcal{O}(\sqrt{N})$ (Quadratic Speedup) | $\mathcal{O}(N)$ | Enforce **AES-256** and **ChaCha20-256** across all agent encrypted sessions (providing 128-bit quantum security). |
| **Hash Function Collision Resistance** | SHA-256, SHA3-256 | **Brassard-Høyer-Tapp (BHT)** | $\mathcal{O}(N^{1/3})$ | $\mathcal{O}(N^{1/2})$ (Birthday Bound) | Enforce **SHA-384 / SHA-512** or SHA3-256 with conservative truncation. |
| **"Harvest Now, Decrypt Later" (HNDL)** | Inter-agent RPCs, off-chain trade signals | Passive Eavesdropping + Future Shor's Run | Instantaneous once Q-Day arrives | Impenetrable today | Implement **Hybrid Key Exchange (X25519 + ML-KEM-768)** immediately. |

---

## ⏳ Estimated Timeline to Cryptographically Relevant Quantum Computers (CRQC)

1. **Near-Term (2024–2028: NISQ Era)**:
   - 100 to 1,000 physical noisy qubits.
   - Zero cryptographic threat to 256-bit elliptic curves (requires thousands of error-corrected logical qubits).
   - **Active Threat**: Harvest Now, Decrypt Later against sensitive long-term communications.
2. **Mid-Term (2029–2035: Fault-Tolerant Early Era)**:
   - Early logical qubits with surface code error correction.
   - Potential vulnerability for weak classical keys (RSA-1024, short curves).
   - Mandatory enterprise and government migration to FIPS 203/204.
3. **Long-Term (2035+: Full CRQC Era)**:
   - Commercial-scale quantum computing capable of executing full Shor's algorithm on Ed25519.
   - Non-upgraded blockchains experience existential loss of funds from exposed public keys.

---

## 🛡️ Attack Surface Boundaries for JarSol

1. **On-Chain Balance Protection**:
   - Solana addresses derived from Ed25519 public keys only expose their public key upon the **first outgoing transaction**.
   - Before an address sends a transaction, only the hash (in Bitcoin/Ethereum) or public key (in Solana) is known. On Solana, the public key *is* the address, making Solana addresses immediately discoverable on-chain.
   - Therefore, transition to post-quantum signature schemes before CRQC arrival is essential.
2. **Off-Chain Autonomous Agent Protection**:
   - Agent-to-agent trading intents, private key derivations, and cross-chain execution manifests are protected via the PQC Communication protocol.

# ANTI-HYPE DILIGENCE GUIDE: SEPARATING REAL PQC FROM DECEPTION

## 🔍 The 6-Question Diligence Test

When evaluating any cryptocurrency project claiming "quantum safety", apply this rigorous 6-question framework:

---

### Question 1: What specific mathematical algorithm is implemented?
- **Red Flag**: "Proprietary proprietary quantum algorithm", "AI-powered quantum defense", or vague buzzwords.
- **Green Flag**: Explicitly names **NIST FIPS 203 (ML-KEM)**, **FIPS 204 (ML-DSA)**, **FIPS 205 (SLH-DSA)**, or **IETF RFC 8391 (XMSS)** with standard parameter sets.

### Question 2: Where is the signature verified: on-chain, off-chain, or in a simulator?
- **Red Flag**: Claiming that an ERC-20 token or Solana SPL token is "quantum safe on-chain" when the base Layer 1 blockchain still verifies classical ECDSA/Ed25519 transactions.
- **Green Flag**: Transparently stating: *"Base layer transactions use classical Ed25519; off-chain agent trade intents and communication sessions use post-quantum hybrid envelopes."*

### Question 3: Is the codebase public, open-source, and licensed permissively?
- **Red Flag**: Closed-source binaries, obfuscated contracts, or restrictive proprietary licensing.
- **Green Flag**: Permissive OSI licenses (MIT, Apache 2.0) with verifiable public repositories and reproducible builds.

### Question 4: How are simulated quantum algorithms labeled?
- **Red Flag**: Claiming "quantum supremacy" or "running on quantum hardware" when running classical simulated annealing on x86/ARM CPUs.
- **Green Flag**: Explicitly labeling benchmarks as *"Classical Simulated Annealing / QUBO Mathematical Emulation"*.

### Question 5: How does the scheme defend against lattice breaks?
- **Red Flag**: Single point of failure relying solely on an experimental new algorithm.
- **Green Flag**: **Dual Hybrid Cryptography**: requiring both classical (Ed25519) and post-quantum (ML-DSA) signatures to validate concurrently.

### Question 6: Are there deterministic Known Answer Tests (KAT)?
- **Red Flag**: No automated tests, or tests that pass with randomized non-deterministic assertions.
- **Green Flag**: Automated test vectors matching official NIST test suites and RFC standards that run in CI on every push.

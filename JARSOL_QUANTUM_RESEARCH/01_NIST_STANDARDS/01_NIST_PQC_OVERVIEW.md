# NIST POST-QUANTUM CRYPTOGRAPHY STANDARDIZATION OVERVIEW

## 🏛️ History of the NIST PQC Project

In 2016, the National Institute of Standards and Technology (NIST) initiated an international public competition to identify cryptographic algorithms that could replace RSA, Diffie-Hellman, ECDSA, and Ed25519 in the face of quantum computing advances.

```text
[2016] Call for Proposals ──> 82 Submissions
  │
[2017] Round 1 ────────────> 69 Candidate Algorithms
  │
[2019] Round 2 ────────────> 26 Candidate Algorithms
  │
[2020] Round 3 ────────────> 7 Finalists + 8 Alternates
  │
[2022] Selection ──────────> CRYSTALS-Kyber, CRYSTALS-Dilithium, SPHINCS+, FALCON
  │
[2024] FIPS Finalization ──> FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA)
  │
[Ongoing] Round 4 ─────────> HQC (Code-Based KEM) selected for future standardization
```

---

## 🎯 Cryptographic Threats to Classical Blockchain Networks

1. **Shor's Algorithm (Polynomial Time $\mathcal{O}((\log N)^3)$)**:
   - Solves the Discrete Logarithm Problem (DLP) over elliptic curves (Curve25519, secp256k1).
   - Once a quantum computer achieves roughly 2,000 to 4,000 error-corrected logical qubits, an attacker with a known public key can derive the private key within minutes to hours.
   - **Direct Impact**: Every Solana account that has published an outgoing transaction has its 32-byte Ed25519 public key exposed on-chain.
2. **Grover's Algorithm (Quadratic Speedup $\mathcal{O}(\sqrt{N})$)**:
   - Attacks symmetric encryption (AES, ChaCha20) and hash preimages (SHA-256).
   - Reduces 128-bit symmetric security to 64 bits (vulnerable to brute force).
   - **Mitigation**: Double symmetric key lengths to 256 bits (providing 128-bit post-quantum security).
3. **"Harvest Now, Decrypt Later" (HNDL)**:
   - State adversaries and network eavesdroppers are currently recording encrypted inter-agent signals and mempool communications.
   - Even if quantum computers arrive in 2035, traffic intercepted today can be retrospectively decrypted unless protected by post-quantum key encapsulation.

---

## 📊 Summary of Finalized Standards

| Standard | Algorithm Name | Mathematical Problem | Function | Key/Sig Sizes |
|---|---|---|---|---|
| **FIPS 203** | **ML-KEM** (Kyber) | Module Learning With Errors (M-LWE) | General Key Encapsulation | $pk$: 1,184B, $ct$: 1,088B (ML-KEM-768) |
| **FIPS 204** | **ML-DSA** (Dilithium) | Module Learning With Errors & Short Integer Solution | General Digital Signatures | $pk$: 1,952B, $\sigma$: 3,309B (ML-DSA-65) |
| **FIPS 205** | **SLH-DSA** (SPHINCS+) | Stateless Merkle Hash Trees & WOTS+ | Backup Hash-Based Signatures | $pk$: 32B, $\sigma$: 7,856B (128s) |

---

## 🛡️ Adoption Stance for JarSol

JarSol integrates **ML-KEM-768** for inter-agent key exchange and **ML-DSA-65** for dual-signature transaction envelopes. These provide NIST Security Category 3 (equivalent to AES-192 hardness), offering an optimal balance of runtime performance, memory efficiency, and theoretical security.

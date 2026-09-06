# NIST POST-QUANTUM CRYPTOGRAPHY STANDARDIZATION OVERVIEW

## 🏛️ Background & Purpose

Classical public-key cryptographic algorithms (RSA, ECDSA, Ed25519, ECDH) rely on mathematical problems—specifically integer factorization and the discrete logarithm problem over finite fields and elliptic curves. In 1994, Peter Shor demonstrated that a sufficiently powerful fault-tolerant quantum computer running **Shor's Algorithm** can solve both integer factorization and discrete logarithms in polynomial time ($\mathcal{O}((\log N)^3)$), rendering all standard public-key cryptography obsolete.

In response, the National Institute of Standards and Technology (NIST) initiated the Post-Quantum Cryptography (PQC) Standardization Project in 2016 to solicit, evaluate, and standardize quantum-resistant public-key cryptographic algorithms.

In August 2024, NIST officially released the first three finalized Federal Information Processing Standards (FIPS):
1. **FIPS 203**: ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism, derived from CRYSTALS-Kyber)
2. **FIPS 204**: ML-DSA (Module-Lattice-Based Digital Signature Algorithm, derived from CRYSTALS-Dilithium)
3. **FIPS 205**: SLH-DSA (Stateless Hash-Based Digital Signature Algorithm, derived from SPHINCS+)

Additionally, NIST continues Round 4 evaluations with **HQC** (Hamming Quasi-Cyclic) selected for future code-based standardization to provide mathematical diversity against potential lattice vulnerabilities.

---

## 📊 Summary of Finalized Standards

| Standard | Algorithm | Mathematical Family | Primary Function | Primary Parameter Sets | Security Levels |
|---|---|---|---|---|---|
| **FIPS 203** | **ML-KEM** | Module Learning with Errors (M-LWE) | General Key Encapsulation (KEM) | ML-KEM-512, ML-KEM-768, ML-KEM-1024 | NIST Levels 1, 3, 5 |
| **FIPS 204** | **ML-DSA** | Module Learning with Errors & Short Integer Solution (M-SIS) | Primary Digital Signatures | ML-DSA-44, ML-DSA-65, ML-DSA-87 | NIST Levels 2, 3, 5 |
| **FIPS 205** | **SLH-DSA** | Stateless Merkle Hash Trees & One-Time Signatures (XMSS/WOTS+) | Backup / Conservative Digital Signatures | SLH-DSA-SHA2-128s, 128f, 192s, 192f, 256s, 256f | NIST Levels 1, 3, 5 |

---

## 🔒 Security Levels Defined by NIST

- **Level 1**: Equivalent to AES-128 key exhaustion resistance.
- **Level 2**: Equivalent to SHA-256 collision resistance.
- **Level 3**: Equivalent to AES-192 key exhaustion resistance.
- **Level 4**: Equivalent to SHA-384 collision resistance.
- **Level 5**: Equivalent to AES-256 key exhaustion resistance.

---

## 🛡️ Strategic Adoption in JarSol

JarSol targets **NIST Security Level 3** (ML-KEM-768 and ML-DSA-65) as the default operational baseline:
- **ML-KEM-768** balances efficient ciphertext size (1,088 bytes) and public key size (1,184 bytes) with robust Level 3 quantum security.
- **ML-DSA-65** delivers high-throughput signing with 3,309-byte signatures and 1,952-byte public keys.
- **Hybrid Envelope**: To mitigate theoretical vulnerabilities in newly standardized lattice schemes, JarSol employs hybrid schemes combining classical Ed25519 / X25519 with ML-DSA / ML-KEM.

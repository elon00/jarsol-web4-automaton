# NIST ROUND 4: HQC (HAMMING QUASI-CYCLIC) CODE-BASED KEM

## 📌 Context & Motivation

While NIST finalized ML-KEM (lattice-based) in FIPS 203, standardizing a single mathematical family creates a systemic risk: if any mathematical shortcut is discovered against the Module Learning With Errors problem, all standardized KEM implementations would be simultaneously compromised.

To ensure **mathematical diversity**, NIST initiated Round 4 to select a secondary standard based on **error-correcting codes**. In 2024, NIST confirmed **HQC (Hamming Quasi-Cyclic)** as the primary candidate selected for future code-based standardization.

---

## 📐 Algorithmic Specifications

- **Mathematical Problem**: Hardness of syndrome decoding for quasi-cyclic codes with feedback shift registers.
- **Error Correcting Core**: Tensor product of Reed-Muller codes and Reed-Solomon codes.
- **Decryption Failure Rate (DFR)**: Proven bounded strictly below $2^{-128}$ (eliminating CCA2 decryption failure attacks).

| Parameter Set | Security Level | Public Key Size | Secret Key Size | Ciphertext Size |
|---|:---:|:---:|:---:|:---:|
| **HQC-128** | Level 1 | 2,249 bytes | 2,289 bytes | 4,481 bytes |
| **HQC-192** | Level 3 | 4,522 bytes | 4,562 bytes | 9,028 bytes |
| **HQC-256** | Level 5 | 7,245 bytes | 7,285 bytes | 14,469 bytes |

---

## ⚖️ Comparison with ML-KEM

| Feature | ML-KEM-768 (Lattice) | HQC-192 (Code-Based) |
|---|:---:|:---:|
| **Underlying Math** | Module-LWE (Ring Lattices) | Quasi-Cyclic Syndrome Decoding |
| **Public Key Size** | **1,184 bytes** (74% smaller) | 4,522 bytes |
| **Ciphertext Size** | **1,088 bytes** (88% smaller) | 9,028 bytes |
| **Performance (ops/sec)** | ~100,000 | ~10,000 |
| **Standardization Status** | Finalized (FIPS 203) | In Draft / Round 4 Selection |

---

## 🛡️ Strategic Takeaway for JarSol

HQC serves as an external hedge in our open-source research portfolio. We monitor upstream C implementations in Open Quantum Safe, but keep ML-KEM-768 as the operational default due to its significantly smaller wire footprint (1 KB vs 9 KB).

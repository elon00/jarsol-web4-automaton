# NIST FIPS 204: ML-DSA (MODULE-LATTICE DIGITAL SIGNATURE ALGORITHM)

## 📌 Specification Summary

- **Standard**: NIST FIPS 204 (Finalized August 2024)
- **Origin**: Derived from CRYSTALS-Dilithium
- **Mathematical Basis**: Hardness of the Module Learning With Errors (M-LWE) and Module Short Integer Solution (M-SIS) problems over polynomial rings with modulus $q = 8380417$.
- **Design Paradigm**: "Fiat-Shamir with Aborts" construction over module lattices.
- **Primary Function**: Quantum-resistant Digital Signatures for authentication, message signing, and integrity verification.

---

## 📐 Parameter Sets & Byte Sizes

| Parameter Set | Security Category | Public Key ($pk$) Size | Secret Key ($sk$) Size | Signature ($\sigma$) Size |
|---|:---:|:---:|:---:|:---:|
| **ML-DSA-44** | Level 2 (SHA-256) | 1,312 bytes | 2,560 bytes | 2,420 bytes |
| **ML-DSA-65** | Level 3 (AES-192) | 1,952 bytes | 4,032 bytes | 3,309 bytes |
| **ML-DSA-87** | Level 5 (AES-256) | 2,592 bytes | 4,896 bytes | 4,627 bytes |

---

## ⚙️ Verification Mechanics

1. **Deterministic or Hedged Signing**:
   - Takes message $M$ and secret key $sk$.
   - Generates masking polynomials, computes commitment $w$, samples challenge $c$, and generates candidate signature $z$.
   - Executes rejection sampling to ensure signature distributions do not leak secret key coefficients.
2. **Verification (`Verify(pk, M, \sigma)`)**:
   - Recomputes commitment $\tilde{w}$ using public key $pk$ and challenge $c$.
   - Confirms norm bounds $\|z\|_\infty < \gamma_1 - \beta$.
   - Validates that high bits match the challenge hash.

---

## 🛡️ Role in JarSol Web4 Automaton

In JarSol, ML-DSA-65 is deployed in the **Dual Hybrid Signature Envelope** (`02_PQC_SECURITY/hybrid-envelope.ts`):
- Pairs an Ed25519 signature (64 bytes) with an ML-DSA-65 signature (3,309 bytes).
- Guarantees backward compatibility with existing Solana off-chain indexers while offering post-quantum non-repudiation for off-chain autonomous agent execution manifests.

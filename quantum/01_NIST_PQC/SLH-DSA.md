# NIST FIPS 205: SLH-DSA (STATELESS HASH-BASED DIGITAL SIGNATURE ALGORITHM)

## 📌 Specification Summary

- **Standard**: NIST FIPS 205 (Finalized August 2024)
- **Origin**: Derived from SPHINCS+
- **Mathematical Basis**: Security relies strictly on the collision resistance and second-preimage resistance of standardized cryptographic hash functions (SHA-2, SHAKE-256).
- **Design Paradigm**: Stateless hash-based tree of trees (Hypertree) composed of XMSS multi-tree layers, Fors (Few-Time) signatures, and WOTS+ (Winternitz One-Time Signatures).
- **Primary Function**: Conservative, non-lattice digital signature alternative serving as an insurance policy against unexpected mathematical breakthroughs in lattice reductions.

---

## 📐 Parameter Sets & Byte Sizes

| Parameter Set | Security Category | Public Key ($pk$) Size | Secret Key ($sk$) Size | Signature ($\sigma$) Size |
|---|:---:|:---:|:---:|:---:|
| **SLH-DSA-SHA2-128s** | Level 1 (Small) | 32 bytes | 64 bytes | 7,856 bytes |
| **SLH-DSA-SHA2-128f** | Level 1 (Fast) | 32 bytes | 64 bytes | 17,088 bytes |
| **SLH-DSA-SHA2-192s** | Level 3 (Small) | 48 bytes | 96 bytes | 16,224 bytes |
| **SLH-DSA-SHA2-192f** | Level 3 (Fast) | 48 bytes | 96 bytes | 35,664 bytes |
| **SLH-DSA-SHA2-256s** | Level 5 (Small) | 64 bytes | 128 bytes | 29,792 bytes |
| **SLH-DSA-SHA2-256f** | Level 5 (Fast) | 64 bytes | 128 bytes | 49,856 bytes |

*(Suffix `s` optimizes for small signature size at the cost of signing speed; suffix `f` optimizes for signing speed at the cost of larger signature size).*

---

## 🛡️ Role in JarSol Web4 Automaton

- **Crypto-Agility Fallback**: While ML-DSA is prioritized for general agent manifests due to smaller signature sizes (3.3 KB vs 16-35 KB), SLH-DSA provides an essential fallback algorithm in JarSol's `crypto-agility.ts` container. If any structural flaw is ever identified in Module-LWE lattices, JarSol can pivot to hash-based signatures without architectural redesign.

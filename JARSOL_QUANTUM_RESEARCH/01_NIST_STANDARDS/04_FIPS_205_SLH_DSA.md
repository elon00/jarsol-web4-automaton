# NIST FIPS 205: SLH-DSA (STATELESS HASH-BASED DIGITAL SIGNATURE ALGORITHM)

## 📌 Standard Specifications

- **Standard Document**: NIST FIPS 205 (Published August 13, 2024)
- **Primary Source Algorithm**: SPHINCS+
- **Mathematical Foundation**: Security rests strictly on the collision resistance, preimage resistance, and pseudorandom properties of standardized cryptographic hash functions (SHA-256, SHAKE-256).
- **Primary Role**: The ultimate conservative backup signature algorithm. If a structural algebraic breakthrough ever invalidates lattice-based schemes (M-LWE/M-SIS), SLH-DSA remains completely unaffected.

---

## 📐 Parameter Sets & Trade-Offs

| Parameter Set | Security Category | Public Key Size | Secret Key Size | Signature Size | Design Priority |
|---|:---:|:---:|:---:|:---:|:---:|
| **SLH-DSA-SHA2-128s** | Level 1 | 32 bytes | 64 bytes | 7,856 bytes | Small signature size |
| **SLH-DSA-SHA2-128f** | Level 1 | 32 bytes | 64 bytes | 17,088 bytes | Fast signing speed |
| **SLH-DSA-SHA2-192s** | Level 3 | 48 bytes | 96 bytes | 16,224 bytes | Small signature size |
| **SLH-DSA-SHA2-192f** | Level 3 | 48 bytes | 96 bytes | 35,664 bytes | Fast signing speed |
| **SLH-DSA-SHA2-256s** | Level 5 | 64 bytes | 128 bytes | 29,792 bytes | Small signature size |
| **SLH-DSA-SHA2-256f** | Level 5 | 64 bytes | 128 bytes | 49,856 bytes | Fast signing speed |

---

## ⚙️ Architecture: Stateless Hypertree & FORS

1. **Why "Stateless" Matters**:
   - Traditional hash-based signatures like XMSS (RFC 8391) are **stateful**: each leaf in the Merkle tree can only sign a single message. Signing twice with the same leaf completely breaks private key security.
   - SLH-DSA solves this by creating a massive hypertree (e.g. $h = 60$ levels deep) with $2^{60}$ available leaves. Signatures select random leaves based on a digest of the message. The probability of two messages selecting the same leaf is negligible ($< 2^{-128}$).
2. **FORS (Forest of Random Subsets)**:
   - Signs the message digest using a few-time signature scheme before anchoring it into the lowest layer of the XMSS hypertree.

---

## 🛡️ Role in JarSol

SLH-DSA is incorporated into JarSol's [`crypto-agility.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/02_PQC_SECURITY/crypto-agility.ts) as an emergency fallback suite. Its 7.8 KB to 16.2 KB signature size is too large for regular high-frequency Solana RPC transmissions, but it serves as a fail-safe disaster recovery key algorithm.

# 🛡️ JARSOL CRYPTOGRAPHIC AUDIT PACKAGE & FORMAL SPECIFICATION

**Document Revision:** 1.0.0  
**Classification:** Open Cryptographic Audit Specification  
**Standard Compliance:** NIST FIPS 203 (ML-KEM), NIST FIPS 204 (ML-DSA), RFC 7748 (X25519), RFC 8032 (Ed25519), RFC 5869 (HKDF), NIST SP 800-38D (AES-GCM)  
**Security Level:** NIST Category 3 (128-bit quantum security against Grover and Shor attacks)  
**Engineering Reality Status:** `EXPERIMENTAL: OFF-CHAIN HYBRID PROTOCOL` (Off-chain agent intent encryption & authentication; Solana L1 execution strictly classical Ed25519).

---

## 1. Executive Summary & Reality Boundary

JarSol implements a **Defense-in-Depth Hybrid Cryptographic Architecture** designed to safeguard off-chain agent communication, cross-node consensus, and transaction intents against both classical compromise and future quantum decryption (**Store-Now-Decrypt-Later / SNDL** attacks).

### 🔍 Truth-in-Engineering Invariants ("Doodh ka doodh, paani ka paani")

1. **Off-Chain Scope:** Post-Quantum Cryptography (PQC) in JarSol currently protects **Layer A (Off-Chain)** workloads:
   - Node-to-node intent communication.
   - Quantum-resistant encrypted session channels (Hybrid KEX).
   - Agent dual-authorization envelopes.
2. **On-Chain Solana Reality:** Solana L1 blockchain transactions currently use **Ed25519** exclusively. Native on-chain PQC verification requires a Solana Improvement Document (**SIMD**) to add hardware-accelerated lattice instructions to the Solana Virtual Machine (SVM).
3. **No Deceptive Supremacy Claims:** We make **zero claims** of quantum supremacy or unbreakable mathematics. Security bounds are strictly derived from concrete lattice hardness parameters specified by the National Institute of Standards and Technology (NIST).
4. **Independent Reproducibility:** Any external auditor can verify all cryptographic primitives in this repository using a zero-dependency script:
   ```bash
   npm run audit:crypto
   # or directly with pure Node.js:
   node scripts/audit-crypto.mjs
   ```

---

## 2. Mathematical Foundations: Lattice-Based Cryptography

JarSol's post-quantum engine is built on the hard mathematical problems in Euclidean lattices: **Module Learning With Errors (M-LWE)** and **Module Short Integer Solution (M-SIS)**.

### 2.1 The Polynomial Ring

Both ML-KEM and ML-DSA operate over the cyclotomic polynomial ring:

$$\mathcal{R}_q = \mathbb{Z}_q[X] / (X^n + 1)$$

where:
- Polynomial degree $n = 256$
- Prime modulus $q = 3329$ (for ML-KEM) and $q = 8380417$ (for ML-DSA)
- The ring structure permits arithmetic acceleration using the **Number Theoretic Transform (NTT)**, reducing polynomial multiplication from $\mathcal{O}(n^2)$ to $\mathcal{O}(n \log n)$.

### 2.2 Concrete Parameter Sets

| Parameter | ML-KEM-768 (FIPS 203) | ML-DSA-65 (FIPS 204) |
| :--- | :--- | :--- |
| **Hardness Problem** | Module-LWE / Module-LWR | Module-LWE / Module-SIS |
| **NIST Security Level** | **Category 3** (128-bit quantum security) | **Category 3** (128-bit quantum security) |
| **Modulus ($q$)** | $3329$ | $8380417 = 2^{23} - 2^{13} + 1$ |
| **Ring Degree ($n$)** | $256$ | $256$ |
| **Matrix Dimensions ($k, \ell$)** | $k = 3, \ell = 3$ | $k = 6, \ell = 5$ |
| **Noise Distribution ($\eta_1, \eta_2$)** | $\eta_1 = 2, \eta_2 = 2$ | $\eta = 4$ |
| **Compression $(d_u, d_v)$** | $d_u = 10, d_v = 4$ | N/A |
| **Public Key Wire Size** | **$1,184$ bytes** | **$1,952$ bytes** |
| **Secret Key Wire Size** | **$2,400$ bytes** | **$4,032$ bytes** |
| **Ciphertext / Signature Size** | **$1,088$ bytes** (ciphertext) | **$3,309$ bytes** (signature) |
| **Shared Secret Size** | **$32$ bytes** ($256$ bits) | N/A |

---

## 3. Hybrid Cryptographic Constructions

To eliminate single points of failure, JarSol employs **strict hybrid combiners** combining battle-tested classical primitives with NIST-standardized PQC primitives. An adversary must break **both** independent mathematical problems simultaneously to compromise the system.

### 3.1 Hybrid Key Exchange (X25519 + ML-KEM-768)

$$\text{Shared Secret Derivation:}$$
1. **Classical ECDH:** $\text{SS}_{\text{classical}} = \text{X25519}(\text{sk}_{\text{alice}}, \text{pk}_{\text{bob}}) \in \mathbb{F}_{2^{255}-19}$ ($32$ bytes)
2. **Quantum Lattice KEM:** $(\text{ct}_{\text{pqc}}, \text{SS}_{\text{pqc}}) = \text{ML-KEM-768.Encapsulate}(\text{pk}_{\text{pqc}})$ ($32$ bytes)
3. **KDF Combiner (RFC 5869 HKDF-SHA256):**

$$\text{PRK} = \text{HMAC-SHA256}(\text{salt} = \text{ct}_{\text{classical}} \parallel \text{ct}_{\text{pqc}}, \text{IKM} = \text{SS}_{\text{classical}} \parallel \text{SS}_{\text{pqc}})$$

$$\text{SS}_{\text{hybrid}} = \text{HKDF-Expand}(\text{PRK}, \text{info} = \text{"JARSOL-HYBRID-KEX-v1"}, L = 32)$$

**Security Theorem:** If either Curve25519 (ECDLP) or ML-KEM-768 (M-LWE) remains computationally intractable, $\text{SS}_{\text{hybrid}}$ is indistinguishable from a uniform random 256-bit string in the random oracle model.

### 3.2 Dual Digital Signatures (Ed25519 + ML-DSA-65)

Every high-assurance intent envelope contains a composite signature:

$$\Sigma = (\sigma_{\text{Ed25519}} \parallel \sigma_{\text{ML-DSA-65}})$$

**Verification Policy (Strict Conjunction):**

$$\text{IsValid}(\Sigma, M) \iff \text{Ed25519.Verify}(\sigma_{\text{Ed25519}}, M, \text{pk}_{\text{Ed}}) \land \text{ML-DSA-65.Verify}(\sigma_{\text{ML-DSA-65}}, M, \text{pk}_{\text{DSA}})$$

If **either** sub-signature fails verification or is omitted, the intent is immediately rejected (`FAIL_CLOSED`).

---

## 4. Threat Model & Security Bounds

| Threat Vector | Attack Mechanism | Classical Defense | Quantum / Lattice Defense | JarSol Fail-Closed Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **SNDL (Harvest Now, Decrypt Later)** | Adversary records ciphertexts today, decrypts when Q-Day arrives | ❌ Broken by Shor's algorithm | 🟢 Protected by ML-KEM-768 ($2^{128}$ quantum bit security) | Hybrid KEX protects session transport |
| **Quantum Signature Forgery** | Shor's algorithm solves discrete log in polynomial time | ❌ Broken by Shor's algorithm | 🟢 Protected by ML-DSA-65 ($2^{128}$ post-quantum bit security) | Dual signature conjunction requires both |
| **Cryptographic Downgrade Attack** | Adversary strips PQC fields, forcing fallback to classical-only | ⚠️ Vulnerable if fallback allowed | ⚠️ N/A | `PolicyEngine` enforces strict hybrid wire mode; zero classical fallback permitted |
| **Implicit Rejection Attack** | Adversary submits malformed ciphertext to probe secret key | N/A | 🟢 FIPS 203 Section 7.3 implicit rejection | Decapsulation of invalid ciphertext yields pseudo-random secret tied to $z$, leaking 0 bits |
| **Malleability / Bit-Flipping** | Adversary flips bits in ciphertext or signature | ⚠️ Requires AEAD | 🟢 Lattice polynomial noise bounds prevent homomorphic forgery | Wycheproof vector tests verify zero malleability |

---

## 5. Verification Test Suite & Known Answer Vectors

The JarSol cryptographic suite executes against official standards:

### 5.1 RFC 5869 HKDF-SHA256 Known Answer Test
- **Source:** IETF RFC 5869 Test Case 1 & 2.
- **Verification:** IKM, Salt, and Info inputs generate byte-for-byte identical OKM output.

### 5.2 RFC 7748 X25519 Curve25519 Known Answer Test
- **Source:** IETF RFC 7748 Section 6.1.
- **Verification:** Alice private key `77076d0a...` and Bob public key `de9edb7d...` produce exact shared secret `4a5d9d5b...`.

### 5.3 RFC 8032 Ed25519 Digital Signature Known Answer Test
- **Source:** IETF RFC 8032 Section 7.1.
- **Verification:** Standard test vectors (empty message, multi-byte test string) verify exact public key derivation and deterministic signature generation.

### 5.4 NIST FIPS 203 ML-KEM-768 Deterministic Test Vector
- **Source:** NIST ACVP (Automated Cryptographic Validation Protocol).
- **Verification:** 64-byte deterministic seed $(d \parallel z)$ produces fixed public key and secret key. Encapsulation with fixed message seed $m$ produces exact ciphertext and shared secret. Decapsulation recovers exact shared secret.
- **Implicit Rejection Test:** Single-bit tampered ciphertext produces a pseudo-random shared secret different from sender's shared secret, avoiding exception oracle leakage.

### 5.5 NIST FIPS 204 ML-DSA-65 Deterministic Test Vector
- **Source:** NIST ACVP / FIPS 204 Algorithm 7.
- **Verification:** 32-byte deterministic seed $\xi$ produces fixed keypair. Deterministic signing with $\text{extraEntropy} = 0^{32}$ produces verifiable signature.
- **Negative Testing:** Bit-flipped signatures and modified message payloads fail verification.

---

## 6. How External Auditors Can Independently Verify

External auditors do not need to take any claim on faith. Run the independent audit script from the root of the repository:

```bash
# 1. Run the standalone, zero-internal-dependency cryptographic audit:
node scripts/audit-crypto.mjs

# 2. Run the full deterministic test vector suite:
npx tsx src/crypto/tests/official-nist-vectors.test.ts

# 3. Run all 11 unit & integration cryptographic suites:
npm run test:quantum

# 4. Verify the 14-Gate Surgical Production Readiness Pipeline:
npm run production:ready
```

**Verification Guarantee:** All cryptographic primitives run in pure TypeScript, without native binary shims or mock buffers, backed by `@noble/post-quantum` (audited by Cure53).

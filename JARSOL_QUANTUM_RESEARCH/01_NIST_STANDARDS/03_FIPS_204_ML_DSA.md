# NIST FIPS 204: ML-DSA (MODULE-LATTICE-BASED DIGITAL SIGNATURE ALGORITHM)

## 📌 Standard Specifications

- **Standard Document**: NIST FIPS 204 (Published August 13, 2024)
- **Primary Source Algorithm**: CRYSTALS-Dilithium
- **Underlying Ring**: $R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$ with prime modulus $q = 8,380,417 = 2^{23} - 2^{13} + 1$.
- **Core Hardness Assumption**: Module Learning With Errors (M-LWE) and Module Short Integer Solution (M-SIS).
- **Design Paradigm**: "Fiat-Shamir with Aborts" over module lattices.

---

## 📐 Parameter Sets & Sizes

| Metric | ML-DSA-44 | ML-DSA-65 (JarSol Default) | ML-DSA-87 |
|---|:---:|:---:|:---:|
| **NIST Security Category** | Level 2 (SHA-256 equivalent) | Level 3 (AES-192 equivalent) | Level 5 (AES-256 equivalent) |
| **Matrix Dimension ($k \times \ell$)** | $4 \times 4$ | $6 \times 5$ | $8 \times 7$ |
| **Public Key ($pk$) Size** | 1,312 bytes | 1,952 bytes | 2,592 bytes |
| **Secret Key ($sk$) Size** | 2,560 bytes | 4,032 bytes | 4,896 bytes |
| **Signature ($\sigma$) Size** | 2,420 bytes | 3,309 bytes | 4,627 bytes |

---

## ⚙️ Mathematical Verification Mechanics

### 1. Rejection Sampling to Prevent Side-Channel Leaks
In classical lattice signing, signature vectors $z$ can inadvertently leak the geometry of the secret key basis over repeated signatures. ML-DSA uses **rejection sampling** (sampling from a uniform distribution $\pm \gamma_1$ and rejecting candidates whose norm exceeds $\gamma_1 - \beta$). This guarantees that the signature distribution is completely independent of the secret key.

### 2. High-Bits / Low-Bits Decomposition
To compress signatures, vectors $w = A \cdot y$ are split into higher-order bits $w_1$ and lower-order bits $w_0$ modulo $\alpha = 2\gamma_2$. The signer only outputs hints to allow the verifier to reconstruct $w_1$, dramatically reducing signature overhead from ~15 KB down to 3.3 KB.

### 3. Verification Steps
1. Verifier unpacks public key $pk = (\rho, t_1)$ and signature $\sigma = (\tilde{c}, z, h)$.
2. Verifies infinity norm: $\|z\|_\infty < \gamma_1 - \beta$.
3. Expands matrix $A \leftarrow \text{SHAKE-128}(\rho)$.
4. Reconstructs high bits: $w_1' = \text{UseHint}(h, A \cdot z - \tilde{c} \cdot t_1 \cdot 2^d)$.
5. Recomputes challenge: $c' = H(\mu \parallel w_1')$.
6. Accepts signature if and only if $c' == \tilde{c}$ and hint weight bounds are satisfied.

---

## 🛡️ Implementation in JarSol

JarSol integrates ML-DSA-65 in [`quantum/02_PQC_SECURITY/hybrid-envelope.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/02_PQC_SECURITY/hybrid-envelope.ts) as part of the dual Ed25519 + ML-DSA-65 envelope.

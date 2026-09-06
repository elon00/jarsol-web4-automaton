# NIST FIPS 203: ML-KEM (MODULE-LATTICE-BASED KEY-ENCAPSULATION MECHANISM)

## 📌 Standard Specifications

- **Standard Document**: NIST FIPS 203 (Published August 13, 2024)
- **Primary Source Algorithm**: CRYSTALS-Kyber (Round 3 Finalist)
- **Underlying Ring**: Polynomial ring $R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$ with prime modulus $q = 3329$.
- **Core Hardness Assumption**: Infeasibility of finding shortest vectors in random module lattices (Module Learning With Errors, M-LWE).

---

## 📐 Parameter Configurations

NIST defined three parameter sets corresponding to security levels 1, 3, and 5:

| Metric | ML-KEM-512 | ML-KEM-768 (JarSol Default) | ML-KEM-1024 |
|---|:---:|:---:|:---:|
| **NIST Security Category** | Level 1 (AES-128 equivalent) | Level 3 (AES-192 equivalent) | Level 5 (AES-256 equivalent) |
| **Module Rank ($k$)** | $k = 2$ | $k = 3$ | $k = 4$ |
| **Public Key ($pk$) Length** | 800 bytes | 1,184 bytes | 1,568 bytes |
| **Ciphertext ($c$) Length** | 768 bytes | 1,088 bytes | 1,568 bytes |
| **Secret Key ($sk$) Length** | 1,632 bytes | 2,400 bytes | 3,168 bytes |
| **Shared Secret Key Length** | 32 bytes | 32 bytes | 32 bytes |

---

## ⚙️ Mathematical Operation Mechanics

### 1. Key Generation
1. Samples 32 bytes of randomness $d$ and derives seed matrix $A \in R_q^{k \times k}$ via SHAKE-128.
2. Samples error vectors $s, e \in R_q^k$ from a centered binomial distribution $\beta_\eta$.
3. Computes public vector: $t = A \cdot s + e \pmod q$.
4. Outputs public key $pk = (\text{ByteEncode}_{12}(t) \parallel \rho)$ and decapsulation key $sk$.

### 2. Encapsulation
1. Chooses 32-byte ephemeral seed $m \leftarrow \{0, 1\}^{256}$.
2. Derives $(\bar{K}, r) = \text{SHA3-512}(m \parallel H(pk))$.
3. Generates ciphertext $c = (u, v)$ where $u = A^T r + e_1$ and $v = t^T r + e_2 + \text{Decompress}_q(m)$.
4. Returns ciphertext $c$ and shared secret $K = \text{SHAKE-256}(\bar{K} \parallel H(c))$.

### 3. Decapsulation & Fujisaki-Okamoto Rejection
1. Decrypts candidate message: $m' = \text{Compress}_q(v - s^T u)$.
2. Re-encrypts $m'$ using $pk$ to re-generate candidate ciphertext $c'$.
3. If $c' == c$, returns valid shared secret $K = \text{SHAKE-256}(\bar{K} \parallel H(c))$.
4. If $c' \neq c$, returns pseudorandom reject key $K = \text{SHAKE-256}(z \parallel H(c))$, preventing chosen-ciphertext oracle timing attacks (IND-CCA2 security).

---

## 🛡️ Implementation in JarSol

JarSol integrates ML-KEM-768 in [`quantum/03_PQ_COMMUNICATION/hybrid-key-exchange.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/03_PQ_COMMUNICATION/hybrid-key-exchange.ts) combined with classical X25519 ECDH.

# NIST FIPS 203: ML-KEM (MODULE-LATTICE KEY ENCAPSULATION MECHANISM)

## 📌 Specification Summary

- **Standard**: NIST FIPS 203 (Finalized August 2024)
- **Origin**: Derived from CRYSTALS-Kyber
- **Mathematical Basis**: Hardness of the Module Learning With Errors (M-LWE) problem over polynomial rings $R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$ with prime modulus $q = 3329$.
- **Primary Function**: Quantum-resistant Key Encapsulation Mechanism (KEM) used to establish shared symmetric secrets over insecure communication channels.

---

## 📐 Parameter Sets & Byte Sizes

| Parameter Set | Security Category | Public Key ($pk$) Size | Ciphertext ($c$) Size | Secret Key ($sk$) Size | Shared Secret ($K$) Size |
|---|:---:|:---:|:---:|:---:|:---:|
| **ML-KEM-512** | Level 1 (AES-128) | 800 bytes | 768 bytes | 1,632 bytes | 32 bytes |
| **ML-KEM-768** | Level 3 (AES-192) | 1,184 bytes | 1,088 bytes | 2,400 bytes | 32 bytes |
| **ML-KEM-1024** | Level 5 (AES-256) | 1,568 bytes | 1,568 bytes | 3,168 bytes | 32 bytes |

---

## ⚙️ Algorithmic Workflow

### 1. Key Generation (`KeyGen()`)
Generates public encapsulation key $pk$ and secret decapsulation key $sk$:
$$(pk, sk) \leftarrow \text{ML-KEM.KeyGen}(d, z)$$
Where $d$ and $z$ are 32-byte cryptographic random seeds.

### 2. Encapsulation (`Encaps(pk)`)
Takes public key $pk$, generates a random 32-byte message $m$, derives shared secret $K$, and computes ciphertext $c$:
$$(c, K) \leftarrow \text{ML-KEM.Encaps}(pk, m)$$

### 3. Decapsulation (`Decaps(c, sk)`)
Takes ciphertext $c$ and secret key $sk$ to reconstruct the identical shared secret $K$:
$$K \leftarrow \text{ML-KEM.Decaps}(c, sk)$$
*Note: If ciphertext $c$ is corrupted or tampered with, ML-KEM uses the Fujisaki-Okamoto transform to output a pseudorandom key derived from a rejection seed, preventing chosen-ciphertext oracle attacks.*

---

## 🛡️ Role in JarSol Web4 Automaton

In JarSol, ML-KEM-768 is utilized in **Hybrid Session Handshakes** (`03_PQ_COMMUNICATION/hybrid-key-exchange.ts`):
- Combines classical X25519 Diffie-Hellman with ML-KEM-768.
- Defends against **"Harvest Now, Decrypt Later" (HNDL)** adversarial attacks where encrypted agent communication traffic is recorded today to be decrypted once quantum hardware matures.

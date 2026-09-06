# RUSTCRYPTO POST-QUANTUM ECOSYSTEM ANALYSIS

## 🌐 Overview

The **RustCrypto** project ([github.com/RustCrypto](https://github.com/RustCrypto)) is the premier community initiative providing pure Rust implementations of cryptographic algorithms. Within its post-quantum initiatives, several dedicated crates implement NIST PQC standards:

- **`ml-kem` crate**: Pure Rust implementation of NIST FIPS 203 (ML-KEM-512, 768, 1024).
- **`ml-dsa` crate**: Pure Rust implementation of NIST FIPS 204 (ML-DSA-44, 65, 87).
- **`slh-dsa` crate**: Pure Rust implementation of NIST FIPS 205 (SPHINCS+).

---

## 🔬 Key Architectural Characteristics

1. **`no_std` Support**:
   - Designed to run in embedded microcontrollers, bare-metal kernels, and WebAssembly without requiring standard operating system libraries.
   - Crucial for blockchain smart contracts that execute in constrained virtual machines (e.g. Solana eBPF / SVM).
2. **Zero Dynamic Memory Allocation Option**:
   - Keys, ciphertexts, and signatures can be allocated as fixed-size stack arrays (`[u8; N]`), eliminating heap fragmentation and allocation panic risks.
3. **Formal Verification & Constant-Time Operations**:
   - Leverages `subtle` crate traits (`ConstantTimeEq`, `ConditionallySelectable`) to prevent timing side-channels.
4. **Licensing**:
   - Dual-licensed under **MIT** OR **Apache-2.0**, guaranteeing 100% legal compatibility with JarSol.

---

## 🛡️ Strategic Value for JarSol

These pure Rust crates serve as our blueprint for writing future **Solana native smart contracts (programs)** once Solana validators support the necessary compute unit limits or SIMD precompiles.

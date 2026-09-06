# OPEN QUANTUM SAFE (OQS) EVALUATION & MATURITY SCORECARD

## 🌐 Overview

The **Open Quantum Safe (OQS)** project is an open-source initiative affiliated with the Linux Foundation that develops and promotes quantum-resistant cryptography. Its primary software artifact is **liboqs**, an open-source C library providing implementations of quantum-safe key encapsulation mechanisms (KEMs) and digital signature algorithms.

- **Primary Repository**: [github.com/open-quantum-safe/liboqs](https://github.com/open-quantum-safe/liboqs)
- **License**: MIT License
- **Supported Standards**: NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA), alongside legacy Round 3 candidate algorithms.

---

## 🔬 Maturity & Security Evaluation

| Dimension | Rating (1-5) | Analysis |
|---|:---:|---|
| **Code Quality & CI** | ⭐⭐⭐⭐⭐ (5/5) | Extensive CI across Linux, macOS, Windows, ARM64, and x86_64 with Valgrind memory checks, ASan/UBSan sanitizers, and continuous constant-time testing. |
| **Standard Alignment** | ⭐⭐⭐⭐⭐ (5/5) | Rapidly tracks final NIST FIPS parameters and test vectors. |
| **Licensing** | ⭐⭐⭐⭐⭐ (5/5) | Clean MIT licensing throughout core library. |
| **Production Readiness** | ⭐⭐⭐⭐☆ (4/5) | OQS explicitly cautions: *"liboqs is provided for research and prototyping purposes; production deployments require vendor assurances regarding physical side-channel resistance."* |
| **Solana / Web4 Portability** | ⭐⭐⭐☆☆ (3/5) | Pure C implementation requires compiled native bindings. Not directly embeddable in browser extensions or Node.js without native build tools or WASM compilation. |

---

## 🎯 JarSol Takeaway & Integration Policy

1. **Benchmark Reference**: Use OQS published performance metrics and Known Answer Test (KAT) vectors to validate JarSol's pure TypeScript off-chain execution harness.
2. **Side-Channel Awareness**: Acknowledge that while mathematical formulations are quantum-resistant, practical physical deployments on hardware require constant-time guarantees and side-channel hardening.
3. **No Native C Dependencies in Production**: Avoid compiling `liboqs` as a native Node.js addon in production releases to maintain cross-platform build determinism (`0 High / 0 Critical` vulnerability guarantee).

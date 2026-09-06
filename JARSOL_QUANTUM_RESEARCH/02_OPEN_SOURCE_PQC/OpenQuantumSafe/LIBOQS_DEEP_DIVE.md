# OPEN QUANTUM SAFE: LIBOQS ARCHITECTURE & EVALUATION

## 🌐 Project Identity

- **Repository**: [https://github.com/open-quantum-safe/liboqs](https://github.com/open-quantum-safe/liboqs)
- **Affiliation**: Linux Foundation (Open Quantum Safe Project)
- **License**: MIT License (Permissive, commercial-friendly)
- **Primary Language**: C (with CMake build system)
- **Supported Platforms**: Linux, macOS, Windows (MSVC/MinGW), Android, iOS, ARM64, x86_64, RISC-V.

---

## 🏛️ Architecture Breakdown

```text
liboqs/
├── src/
│   ├── common/              # Constant-time utilities, PRNG (AES-NI, Chacha), SHA-3/SHAKE
│   ├── kem/                 # Key Encapsulation Mechanisms
│   │   ├── ml_kem/          # NIST FIPS 203 (ML-KEM-512, 768, 1024)
│   │   ├── classic_mceliece/# Conservative code-based KEM
│   │   └── hqc/             # NIST Round 4 candidate
│   └── sig/                 # Digital Signature Schemes
│       ├── ml_dsa/          # NIST FIPS 204 (ML-DSA-44, 65, 87)
│       ├── slh_dsa/         # NIST FIPS 205 (SPHINCS+)
│       └── falcon/          # Fast-Fourier lattice signatures
```

---

## 🔬 Security & Constant-Time Hardening

1. **Side-Channel Mitigation**:
   - Employs compiler barriers (`OQS_MEM_cleanse`) to prevent compiler optimization from stripping out zeroing functions.
   - Core polynomial multiplications in ML-KEM and ML-DSA are designed to be constant-time to prevent timing attacks.
2. **CI Sanitizers**:
   - Automated test pipelines continuously run AddressSanitizer (ASan), UndefinedBehaviorSanitizer (UBSan), MemorySanitizer (MSan), and Valgrind.
3. **Upstream Recommendation**:
   - OQS maintainers explicitly state: *"liboqs is an open-source library for research and prototyping quantum-resistant cryptography. While it aims for high quality, production systems require physical side-channel guarantees from hardware security modules."*

---

## ⚖️ JarSol Licensing & Integration Policy

- **License**: 100% Permissive MIT.
- **Integration Policy**:
  - We do NOT link native C binaries (`liboqs.so` or `liboqs.dll`) into the JarSol production npm bundle to prevent native build failures, node-gyp vulnerabilities, and OS-specific binary issues.
  - We utilize liboqs's audited test vector suite, mathematical structures, and benchmark curves to calibrate our pure TypeScript execution layer.

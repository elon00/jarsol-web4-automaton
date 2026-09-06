# 12-POINT POST-QUANTUM TRANSITION SECURITY CHECKLIST

This checklist provides standard operating procedures for developing, testing, and reviewing quantum-resistant code within the JarSol ecosystem.

---

## 📋 The 12-Point Checklist

- [ ] **1. NIST FIPS Conformance**: Are all post-quantum primitives explicitly aligned with finalized NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), or FIPS 205 (SLH-DSA) parameter sets?
- [ ] **2. Dual Hybrid Signing**: Does the implementation require both classical (Ed25519) and post-quantum (ML-DSA) signatures to pass verification, preventing single-point-of-failure risks?
- [ ] **3. Permissive License Compliance**: Have all referenced algorithms and libraries been audited to ensure strictly MIT, Apache 2.0, BSD-3, or CC0 licensing?
- [ ] **4. Zero Vulnerability Gate**: Does the code introduce zero high or critical security audit vulnerabilities (`npm audit --omit=dev --audit-level=high` exits 0)?
- [ ] **5. Memory Clearing**: Are private decapsulation and signing keys cleared from memory (overwritten with zeroes) immediately after use?
- [ ] **6. Deterministic Test Vectors (KAT)**: Does the cryptographic harness execute Known Answer Tests with byte-for-byte reproducibility?
- [ ] **7. Negative Test Coverage**: Are corrupted ciphertexts, invalid public key lengths, and tampered signatures rejected deterministically?
- [ ] **8. Symmetric Key Length (256-bit)**: Are all symmetric ciphers (AES, ChaCha20) initialized with 256-bit keys to maintain 128-bit security under Grover's algorithm?
- [ ] **9. Constant-Time Logic**: Are sensitive comparison operations executed using constant-time comparison algorithms to defend against timing attacks?
- [ ] **10. Anti-Hype Truth in Labeling**: Are classical quantum simulators clearly designated as classical CPU emulators rather than real quantum hardware?
- [ ] **11. Solana Boundary Awareness**: Does the codebase avoid claiming that on-chain Solana L1 transactions are quantum-resistant until native SIMDs are deployed?
- [ ] **12. Crypto-Agility Ready**: Can the underlying cryptographic algorithm be swapped at runtime without changing upstream application APIs?

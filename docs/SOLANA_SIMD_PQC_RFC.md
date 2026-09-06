# SOLANA IMPROVEMENT DOCUMENT (SIMD) RFC DRAFT: NATIVE POST-QUANTUM PRECOMPILES

- **SIMD Proposal Number**: RFC-SIMD-2026-PQC
- **Title**: Native Sealevel Virtual Machine (SVM) Precompiles for Module-Lattice Cryptography (ML-DSA & ML-KEM)
- **Author**: JarSol Autonomous Systems Engineering Team
- **Category**: Core / Virtual Machine / Cryptography
- **Status**: Draft Proposal for Validator Governance Review
- **Requires**: SIMD-0021 (Syscall Extensions), SIMD-0045 (Transaction Payload Optimization)

---

## 📌 1. Summary

This RFC proposes two native Sealevel Virtual Machine (SVM) cryptographic precompile syscalls:
1. `sol_ml_dsa_65_verify`: Hardware-accelerated verification of NIST FIPS 204 (ML-DSA-65) digital signatures.
2. `sol_ml_kem_768_encaps`: Hardware-accelerated key encapsulation for NIST FIPS 203 (ML-KEM-768).

These syscalls allow Solana programs (smart contracts) to verify post-quantum signatures and establish quantum-safe session keys at a cost of approximately **25,000 Compute Units (CU)**, down from **> 4,500,000 CU** in unaccelerated eBPF bytecode.

---

## 🔍 2. Motivation

Solana transaction signatures rely exclusively on **Ed25519**. Shor's algorithm on a quantum computer with $\approx 3,000$ logical qubits breaks discrete logarithms over Curve25519 in polynomial time. Because public keys are exposed on-chain upon an account's first outgoing transaction, all active Solana balances will face existential theft risk once cryptographically relevant quantum computers emerge.

While off-chain protocols (such as JarSol) can enforce post-quantum hybrid envelopes today, on-chain execution and settlement require native validator-level acceleration to satisfy Solana's strict 400ms slot time constraints.

---

## ⚙️ 3. Detailed Technical Specification

### 3.1 `sol_ml_dsa_65_verify` Syscall Signature

```rust
pub fn sol_ml_dsa_65_verify(
    public_key: &[u8; 1952],
    message: &[u8],
    signature: &[u8; 3309],
) -> Result<bool, ProgramError>;
```

#### Parameter Bounds:
- `public_key`: Exactly 1,952 bytes conforming to NIST FIPS 204 Table 1 parameter set $\text{ML-DSA-65}$.
- `message`: Arbitrary byte slice (internally hashed via SHAKE-256 with domain separation).
- `signature`: Exactly 3,309 bytes containing commitment hint $h$, challenge seed $\tilde{c}$, and response vector $z$.

#### Compute Unit Cost:
- Base Syscall Overhead: **1,000 CU**
- Polynomial NTT Transformation & Verification: **24,000 CU**
- Total Invocation Cost: **25,000 CU** (well within standard 200,000 CU transaction limit).

---

### 3.2 `sol_ml_kem_768_encaps` Syscall Signature

```rust
pub fn sol_ml_kem_768_encaps(
    public_key: &[u8; 1184],
    random_seed: &[u8; 32],
    out_ciphertext: &mut [u8; 1088],
    out_shared_secret: &mut [u8; 32],
) -> Result<(), ProgramError>;
```

#### Compute Unit Cost:
- Total Invocation Cost: **18,000 CU**

---

## 📦 4. Transaction Size Handling (Detached Payload Buffer)

Because an ML-DSA-65 signature ($3,309$ bytes) exceeds the standard IPv6 MTU limit ($1,232$ bytes), this proposal introduces a **Detached Signature Account Buffer**:
1. The transaction references an account holding the 3.3 KB post-quantum signature created in the preceding slot.
2. The transaction instruction passes the account public key to `sol_ml_dsa_65_verify`.
3. The validator reads the signature directly from validator memory cache without packing it into the wire network packet.

---

## 🛡️ 5. Backward Compatibility & Security Considerations

1. **Non-Breaking to Ed25519**: Classical transactions remain 100% functional and unmodified.
2. **Side-Channel Resistance**: Validator hardware implementations (AVX-512, NEON) MUST execute in constant time to prevent cache-timing attacks.
3. **No Dynamic Memory Allocation**: Syscall executions must use stack memory exclusively.

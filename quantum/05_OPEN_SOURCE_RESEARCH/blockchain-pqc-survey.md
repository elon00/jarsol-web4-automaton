# QUANTUM-RESISTANT BLOCKCHAINS & SOLANA UPGRADE SURVEY

## 🌐 Survey of Existing Post-Quantum Blockchain Projects

### 1. The Quantum Resistant Ledger (QRL)
- **Launch**: Mainnet active since 2018.
- **Cryptographic Core**: IETF RFC 8391 compliant **eXtended Merkle Signature Scheme (XMSS)**.
- **Key Characteristics**: Stateful hash-based signatures. Because XMSS is stateful, every signature uses an explicit one-time leaf in a Merkle tree; reusing an OTS index exposes private key material.
- **Strengths**: Proven on-chain track record; extremely conservative mathematical assumptions (hash functions only).
- **Weaknesses**: Significant state management complexity; large signature sizes; transaction throughput constraints.

### 2. Abelian Network (ABEL)
- **Launch**: 2022.
- **Cryptographic Core**: Lattice-based privacy-preserving ring signatures (derived from Dual-Ring lattice constructions).
- **Strengths**: Privacy-first post-quantum architecture.
- **Weaknesses**: High transaction overhead (several kilobytes per transaction); GPL-encumbered codebase; slower verification times.

### 3. Cellframe Network (CELL)
- **Launch**: Multi-chain framework.
- **Cryptographic Core**: Multi-algorithm signature support (Dilithium, Falcon, SPHINCS+, PicNic).
- **Strengths**: Crypto-agility across different post-quantum algorithm families.
- **Weaknesses**: High complexity; experimental status; non-permissive licensing across core modules.

---

## ⚡ The Solana Landscape & Quantum Roadmap

### Current Reality
- Solana Layer 1 uses **Ed25519** (Edwards-curve Digital Signature Algorithm on Curve25519) for transaction signing and account authorization.
- Ed25519 keypairs are 32 bytes (public key) and 64 bytes (signature).
- Ed25519 relies on the discrete logarithm problem over the twisted Edwards curve, which is mathematically breakable by Shor's algorithm on a quantum computer with $\approx 2,000$ to $4,000$ stable logical qubits.

### Why PQC Cannot Run Naively on Solana SVM Today
1. **Compute Unit (CU) Limits**: A standard Solana transaction is capped at 200,000 to 1,400,000 Compute Units. Verifying an ML-DSA lattice signature or SLH-DSA hash tree in standard eBPF instructions exceeds current CU budgets without precompiles.
2. **Transaction Size Limits**: An IPv6 MTU packet on Solana allows up to 1,232 bytes per serialized transaction packet. An ML-DSA-65 signature alone is 3,309 bytes, exceeding the entire packet limit.

### Necessary Architectural Upgrades for Solana L1 PQC
1. **Solana Improvement Documents (SIMDs)**: Dedicated syscalls / precompiles (similar to `secp256k1_recover` or `ed25519_verify`) accelerated natively in validator hardware.
2. **Transaction Chunking & Reassembly**: Protocol-level support for jumbo transactions or transaction payload references stored in validator memory.
3. **Account Abstraction / Smart Contract Wallets**: Replacing fixed Ed25519 public key account derivations with arbitrary verification logic.

### 🛡️ JarSol's Practical Implementation Strategy
Because L1 base-layer changes require Solana core protocol governance, JarSol implements quantum resilience where it is immediately actionable today:
1. **Off-Chain Autonomous Agent Manifests**: Dual Ed25519 + ML-DSA hybrid signing for agent transaction proposals.
2. **Agent-to-Agent Encrypted Communication**: X25519 + ML-KEM hybrid key encapsulation to prevent harvest-now-decrypt-later attacks.
3. **Crypto-Agile Envelopes**: Pre-built abstraction layers ready to connect to native Solana PQC SIMD syscalls the moment they are deployed on testnet/mainnet.

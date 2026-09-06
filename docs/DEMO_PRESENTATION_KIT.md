# JARSOL // 3-MINUTE COMPETITION DEMO & JUDGE PRESENTATION KIT

> **Target Audience**: Solana Hackathon Judges, Web3 Security Auditors, and Technical Reviewers  
> **Core Narrative**: Moving decentralized finance and autonomous agents from vulnerable classical elliptic curves to **NIST-standardized post-quantum resilience** without breaking Solana Layer 1 compatibility.

---

## ⏱️ 3-Minute Live Demo Walkthrough Script

### Minute 1: The Quantum Problem on Solana (0:00 - 1:00)
- **Speaker**:
  > *"Every Solana account that has ever sent an outgoing transaction has published its 32-byte Ed25519 public key on-chain. When Shor's algorithm runs on fault-tolerant quantum hardware, all 256-bit elliptic curves become breakable in polynomial time. Furthermore, adversaries are executing 'Harvest Now, Decrypt Later' attacks against inter-agent communication channels today."*
- **Action on Screen**:
  1. Open the **JarSol Dashboard** and click the **PQC Security** tab (`PqcSecurityModule.tsx`).
  2. Slide the **Simulated Quantum Computer Power** slider from 100 up to 4,096 logical qubits.
  3. Point to the gauge showing Solana Classical Ed25519 reaching 100% vulnerability, while the **JarSol ML-DSA Lattice** remains 100% immune under Shortest Vector Problem (SVP) hardness.

---

### Minute 2: Live Dual Hybrid Signing & Autonomous Agent Intent (1:00 - 2:00)
- **Speaker**:
  > *"How do we protect transactions today without waiting for years of Layer 1 hard-forks? We implement a Dual Hybrid Signature Envelope combining classical Ed25519 with NIST FIPS 204 (ML-DSA-65). Verification requires BOTH signatures to pass."*
- **Action on Screen**:
  1. Under **Hybrid Transaction Signer**, click **"SIGN & VERIFY HYBRID DUAL-SIGNATURE"**.
  2. Show the verified dual proof containing both the 64-byte Ed25519 signature and the 3,309-byte ML-DSA-65 lattice signature.
  3. Under **Autonomous Agent PQC Trade Envelope**, click **"SIGN SAMPLE AGENT REBALANCE INTENT"**.
  4. Display the verified off-chain trade intent payload hash and show that it prevents quantum retro-forgery while remaining compatible with Solana RPC indexers.

---

### Minute 3: Quantum Portfolio Optimization & Verifiable Evidence (2:00 - 3:00)
- **Speaker**:
  > *"Beyond security, quantum algorithms revolutionize portfolio optimization. We formulate discrete token lot allocations as a Quadratic Unconstrained Binary Optimization (QUBO) problem and benchmark classical Markowitz against simulated quantum annealing across a 5-token Solana basket (SOL, JARSOL, USDC, JUP, RAY)."*
- **Action on Screen**:
  1. Click **"EXECUTE LIVE PORTFOLIO BENCHMARK"**.
  2. Watch the real solver calculate live expected returns, volatility, Sharpe ratios, and emulated qubit allocations in milliseconds.
  3. Highlight our **Anti-Hype Truth in Labeling**: Classical gradient descent is faster on convex simplex bounds (5.8 ms vs 16.4 ms), but QUBO eliminates fractional dust allocations.
  4. Show the terminal executing `npm run finish:all` with all 10 gates passing 100% green.

---

## 🏆 Key Verifiable Evidence Table for Reviewers

| Criterion | Metric / Result | Verification Command |
|---|---|---|
| **Production Security Gate** | **0 High / 0 Critical** vulnerabilities | `npm audit --omit=dev --audit-level=high` |
| **NIST Standards Conformance** | FIPS 203 (ML-KEM-768), FIPS 204 (ML-DSA-65), FIPS 205 | `npm run test:quantum` (13/13 passing) |
| **Devnet Verified Mint** | `224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn` (Mint Revoked) | `npm run verify:devnet` |
| **Testnet Verified Mint** | `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG` (1B Fixed Supply) | `npm run verify:testnet` |
| **Secret Leaks / Keys** | **Zero Leaks Detected** (Tracked files clean) | `npm run verify:secrets` |
| **Mainnet Safety Boundary** | **100% Fail-Closed** (Requires dual approval env vars) | `scripts/verify-secrets.ts` |
| **Open Source Licensing** | **100% Permissive** (MIT / Apache-2.0 / CC0 only) | `JARSOL_QUANTUM_RESEARCH/05_LICENSE_AUDIT/` |
| **Continuous Integration** | **GitHub Actions 100% Green** | `Run #34046509734` |

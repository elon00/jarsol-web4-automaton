# CELLFRAME LICENSE AUDIT & TECHNICAL RISK PROFILE

## ⚖️ Legal & Licensing Classification

- **Primary Repositories**: `cellframe-node`, `cellframe-sdk`
- **License**: **GPL-3.0 (GNU General Public License v3)**
- **Commercial Reusability Verdict for JarSol**: ❌ **STRICTLY RESTRICTED**.

### Why GPL-3.0 is Incompatible with JarSol
Under the terms of GPL-3.0, incorporating or statically linking GPL code into another codebase mandates that the entire derivative work must be licensed under GPL-3.0. Because JarSol is built with permissive MIT-compliant architecture and targets enterprise Web3 integration:
1. **Zero lines of Cellframe source code may be copied into JarSol.**
2. Cellframe is evaluated strictly as an external architectural case study in documentation.

---

## 🛑 Technical Risks Identified in Cellframe

1. **Monolithic C Codebase**: Custom memory allocators in C introduce potential buffer overflow and memory corruption attack vectors if exposed to untrusted RPC inputs.
2. **Pre-Standard Parameterization**: Portions of the codebase utilize early Round 2/3 Dilithium parameters that differ from finalized NIST FIPS 204.
3. **Complexity Overhead**: Supporting 5+ concurrent signature schemes increases validator attack surface.

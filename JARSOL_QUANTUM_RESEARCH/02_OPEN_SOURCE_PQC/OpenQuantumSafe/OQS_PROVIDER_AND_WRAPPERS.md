# OPENSSL OQS-PROVIDER & LANGUAGE WRAPPERS EVALUATION

## 🌐 Ecosystem Overview

The Open Quantum Safe project maintains integration layers beyond the standalone `liboqs` C library:
1. **oqs-provider**: An OpenSSL 3.x dynamic provider enabling standard OpenSSL commands (`openssl s_client`, TLS 1.3 handshakes, X.509 certificate generation) to use PQC algorithms.
2. **liboqs-python**: Python CFFI bindings for rapid scripting and algorithmic verification.
3. **liboqs-rust**: Safe Rust wrappers wrapping `liboqs-sys`.
4. **liboqs-go**: CGO wrappers for Go applications.

---

## 🔬 Wrapper Maturity & Portability Matrix

| Component | Language | Maintenance | Web/Browser Portable? | Node.js Zero-Native Compatible? |
|---|---|:---:|:---:|:---:|
| **oqs-provider** | C / OpenSSL 3 | High | ❌ No (Requires native OpenSSL) | ❌ No (OS-level shared object) |
| **liboqs-rust** | Rust (`liboqs-sys`) | Moderate | ⚠️ WASM only with Emscripten | ⚠️ Requires native build tools |
| **liboqs-python** | Python (CFFI) | High | ❌ No | ❌ No |
| **Pure TypeScript (JarSol)**| TypeScript / WebCrypto | Managed in-tree | ✅ **100% Portable** | ✅ **Zero Native Dependencies** |

---

## 🛡️ Strategic Decision for JarSol

To maintain **100% cross-platform compatibility** across Windows, Linux, macOS, and Web browsers, JarSol avoids bundling C-based wrappers (`liboqs-sys` or CGO). Instead, JarSol adopts:
- Off-chain pure TypeScript implementations compliant with NIST FIPS 203/204 byte layouts.
- Standard WebCrypto API / `@noble/hashes` primitives for high-speed symmetric and hash operations.

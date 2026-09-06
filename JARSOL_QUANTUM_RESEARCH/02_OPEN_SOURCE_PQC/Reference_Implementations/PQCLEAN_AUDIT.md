# PQCLEAN PROJECT AUDIT & 2026 ARCHIVAL TRANSITION

## 🌐 Project Identity

- **Repository**: [https://github.com/pqclean/PQClean](https://github.com/pqclean/PQClean)
- **Goal**: To provide clean, standalone, portable C implementations of post-quantum cryptography schemes, free from architecture-specific assembly or external dependencies.
- **Licensing**: Dual CC0-1.0 (Public Domain) / MIT.

---

## ⚠️ Important Maintenance Advisory: 2026 Archival Transition

The PQClean maintainers have announced plans to transition the project toward archival in 2026. The primary reasons include:
1. NIST has finalized official FIPS standards (FIPS 203, 204, 205), making the earlier Round 3 candidate implementations in PQClean outdated.
2. Active upstream development has consolidated under the Linux Foundation's Open Quantum Safe (`liboqs`) and standardized language-specific ecosystems.

---

## ⚖️ JarSol Policy on PQClean

- **Status in JarSol**: **REFERENCE ONLY**.
- **Action**: We do NOT adopt PQClean as a production dependency or submodule.
- **Utility**: PQClean remains valuable for inspecting historical constant-time C implementations, test harnesses, and validation test vector structures.

# PERMISSIVE VS. COPYLEFT COMPLIANCE RULES FOR JARSOL

## ⚖️ The Intellectual Property Boundary

When building production-grade Web3 infrastructure, open-source license hygiene is a critical legal and commercial requirement:

```text
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│       PERMISSIVE LICENSES            │       │        COPYLEFT LICENSES             │
│   (MIT, Apache-2.0, BSD-3, CC0)      │       │      (GPL-2.0, GPL-3.0, AGPL)        │
├──────────────────────────────────────┤       ├──────────────────────────────────────┤
│ - Free for commercial use            │       │ - Mandates all derivative works      │
│ - Can be combined with closed/open   │       │   must open-source entire repository │
│ - Requires simple attribution notice │       │ - Prohibits proprietary integration  │
│ - Compatible with enterprise SaaS    │       │ - Legal liability for enterprise users│
├──────────────────────────────────────┤       ├──────────────────────────────────────┤
│ ✅ FULLY ADMISSIBLE IN JARSOL         │       │ ❌ STRICTLY PROHIBITED IN JARSOL CODE│
└──────────────────────────────────────┘       └──────────────────────────────────────┘
```

---

## 🛑 Strict Rules of Engagement

1. **Rule 1 (Zero Copying of GPL Code)**: Under no circumstances may code from GPL/AGPL repositories (such as Abelian or Cellframe) be copy-pasted into JarSol.
2. **Rule 2 (Permissive Dependency Gating)**: Every new package added to `package.json` must be audited to verify it uses an OSI-approved permissive license.
3. **Rule 3 (Clean-Room Functional Specification)**: If an algorithm or architectural concept from a copyleft project is studied, the JarSol implementation must be developed strictly from public, unencumbered mathematical standards (such as NIST FIPS specs or RFCs).
4. **Rule 4 (Attribution Preservation)**: Upstream copyright headers and license texts from MIT/Apache-2.0 projects are preserved in full compliance with their respective notices.

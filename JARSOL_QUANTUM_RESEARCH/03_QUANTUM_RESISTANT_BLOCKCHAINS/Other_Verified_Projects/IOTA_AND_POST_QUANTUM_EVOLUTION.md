# IOTA POST-QUANTUM HISTORY & THE OTS LESSON

## 🌐 The Original IOTA Promise (2015–2020)

IOTA originally launched using the **Winternitz One-Time Signature (WOTS)** scheme on its Directed Acyclic Graph (Tangle), marketing itself as "quantum-proof by design":

```text
User creates Address ──> Sends 1st TX (WOTS signs) ──> 50% Private Key Revealed!
                                                   │
                                                   ▼
                         Sending 2nd TX from same address:
                         Private Key completely compromised! Funds stolen!
```

---

## 🛑 The Critical UX & Security Failure of WOTS

1. **Address Reuse Catastrophe**:
   - Because WOTS is a one-time signature scheme, spending funds from an address revealed half of the private key.
   - If a user accidentally received funds into a previously spent address and attempted to spend again, automated bot eavesdroppers swept the entire balance within seconds.
   - Millions of dollars were lost due to user confusion over disposable address management.
2. **The Chrysalis Hard-Fork (2021)**:
   - In 2021, the IOTA Foundation abandoned WOTS completely and migrated to **classical Ed25519 signatures**, prioritizing usability, high throughput, and reusable addresses over premature quantum resistance.

---

## 🛡️ Critical Lesson for JarSol

- **Never force stateful or one-time signatures onto everyday users.**
- Stateless signatures (NIST FIPS 204 ML-DSA) eliminate the one-time signature trap entirely: addresses can sign infinite transactions with zero key leakage.
- Dual hybrid envelopes (Ed25519 + ML-DSA) preserve the seamless reusable address model users expect.

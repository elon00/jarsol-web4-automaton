# Required CI and deployment policy

Quality/build runs on Linux and Windows with Node 24 and locked installs. The required jobs are quality, live Solana Devnet/Testnet verification, dependency/security checks, trusted full-history credential scanning and three-language CodeQL. The always-running Final Reality Gate rejects missing, failed, cancelled and skipped required jobs.

Pages is a reusable deployment workflow called only after that gate succeeds on main. It has no independent push/manual deployment trigger. A passing static build alone cannot authorize publication.

Live deployment verification checks the configured genesis before account reads, uses bounded requests and finalized reads, and rejects unavailable/malformed data. The current reference mint policy is legacy SPL Token, initialized, nine decimals, raw supply 1000000000000000000, with mint and freeze authorities revoked. Fresh Testnet verification additionally checks ATA and Metaplex metadata. These are selected observations from one provider, not a complete audit or economic acceptance.

An RPC outage, missing deployment or policy mismatch is a failed/unavailable required gate. Local registry contents cannot replace live evidence. The CLI returns nonzero and redacts provider details. No wallet, new deployment, token transfer or authority revocation is performed by verification.

The security job audits development and runtime dependencies. Credential scanning uses the immutable external hub policy at 6c0e18f684685606845a9aaeba0b8eb08da69dce, separately checked out from the target. CodeQL analyzes TypeScript/JavaScript, Python tooling and Actions; high/critical findings or incomplete SARIF block the gate.

A green run is evidence for its exact revision and commands. Independent security review, provider availability, UI journeys, performance/recovery and customer acceptance remain separate open requirements. No 10/10 or production certification is implied.

The Token-2022 manual workflow is a read-only preflight. It validates positive uint64 supply and the Testnet genesis, then returns BLOCKED (exit 2). It loads no signer, installs no remote shell script and submits no transaction. Re-enabling minting requires a separately reviewed, integrity-pinned toolchain and transaction manifest with operator authorization. This workflow is not evidence of a completed Token-2022 deployment.

The auxiliary autonomous workflow runs explicit locked-install, test, quantum-test and build commands. It cannot silently omit a gate because a script is absent. Its technology report is diagnostic evidence, not production certification.

The Tailwind 4 migration requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+). The revised dependency audit removed known high/critical findings at the reviewed lockfile; remaining low/moderate advisories require disposition and future audits may change that result.

The backend limits each direct-client IP to 120 requests per minute before authentication, body parsing, static serving or route handlers. Forwarded IP headers are untrusted. This is a single-process protection, not a distributed denial-of-service guarantee; a proxy or multi-instance deployment needs a reviewed trust configuration and shared rate-limit store.

Cooperating registry writers use an exclusive local lock and atomic JSON replacement, preserving unrelated cluster records. An interrupted writer can leave a lock: inspect the owning process and preserve deployment receipts before recovery. Local locks do not coordinate independent hosts. The fresh Testnet script retains mint authority; its registry records that fact rather than claiming revocation. It therefore does not satisfy the fixed-supply reference verifier. No authority changes are performed automatically to make a check pass.

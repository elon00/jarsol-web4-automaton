# Legacy Devnet retirement and migration plan

Status: guidance prepared at the owner's request on 2026-10-22. No retirement transaction, authority change, redemption, transfer or replacement deployment has been executed. This plan does not authorize a production launch.

## Existing tokens and observed state

| Scope | Existing mint | Observed finalized state |
|---|---|---|
| Legacy Devnet | `224P34UfTWzQvi7VfDyY3rP4ayKKMuYR2KYXfpxUzxdn` | Nine decimals; raw supply `2003764205206896640`; mint authority null; freeze authority `3q3cTxEPjtUpEJpPAnQodrTWSW7gH4NNebvg5kwd1Di7` |
| Testnet reference candidate | `AeZcfycXZvgjt1Rkyee8w34tApSrLnzL7nJoH2P6EQxG` | Nine decimals; raw supply `1000000000000000000`; mint and freeze authorities null |

These are dated observations from public RPCs after matching each cluster's genesis, at Devnet slot 513937731 and Testnet slot 455553399. Recheck before making a decision. The legacy Devnet mint does not satisfy the current fixed-supply/no-authority reference policy. Repository registry claims are not substitutes for current observations.

The Testnet candidate additionally passed read-only ATA/metadata verification at finalized slot 455553660. That establishes selected testnet state, not security certification, customer acceptance or a mainnet deployment. Testnet assets have no established redemption promise or commercial value from this plan.

## Immediate safeguards

1. Keep the legacy Devnet release blocked and label it as a legacy reference in any launch communication. Do not advertise it as meeting the fixed-supply/no-authority policy.
2. Preserve its mint address, registry history and observation receipts for traceability. Do not delete history to hide the discrepancy.
3. Keep the required Devnet gate failed until an explicitly reviewed retirement/cutover change replaces its requirements with verified retirement safeguards. Do not skip it merely to obtain a green run.
4. Keep wallet keys and seed phrases outside chat and the repository. The Token-2022 workflow remains a blocked read-only preflight.

## Cutover review before execution

1. Establish who controls the legacy freeze authority and whether any accounts are frozen. Verify ownership locally; a public address alone does not establish control. Do not request private keys from users.
2. Capture a finalized, dated holder/account snapshot with cluster genesis, slot, mint, owner, raw amount and account state. Reconcile the sum with current mint supply and investigate discrepancies. Protect any off-chain personal information separately.
3. Decide the user-facing migration policy: an informational move to a separate demo cluster, or a separately specified redemption program. Devnet and Testnet are distinct networks; balances cannot simply be transferred between them. This plan promises no 1:1 conversion, reimbursement or automatic airdrop.
4. Review the candidate's tokenomics, metadata, licensing/provenance, user journeys, costs, operational ownership and independent security findings. A new production token requires its own specification and approval.
5. Prepare a transaction manifest only for explicitly approved on-chain actions. Check genesis, signer authority, exact addresses, amounts, fee budget and simulation. Revoking freeze authority is irreversible and does not automatically resolve already frozen accounts. No automated authority revocation is included here.
6. Dry-run the application cutover without signing: show the selected cluster and mint, reject wrong-network wallets, show unavailable balances honestly, and confirm that legacy links cannot route users into new-token transactions.
7. Obtain approval for the concrete cutover and any irreversible actions. Execute only the approved manifest using an owner-controlled signer, retain receipts and verify finalized postconditions independently.

## Acceptance and recovery

Retirement can be recorded as complete only after approved communications, the legacy disposition, applicable holder treatment, application configuration and finalized receipts are verified. The candidate still requires all applicable CI, operational and product acceptance checks.

Before any transaction, rollback means restoring the reviewed application configuration and stopping the cutover. After authority revocation or transfers, an application rollback cannot reverse chain state. Keep the interface in read-only/unavailable mode while investigating discrepancies; do not manufacture compensating transactions.

## Safe verification commands

From this repository, `npm ci --ignore-scripts` installs the lockfile and `npm test` runs behavioral checks. `npm run verify:devnet`, `npm run verify:testnet` and `npm run verify:testnet:fresh` perform read-only live observations and return nonzero on unavailability or policy mismatch. The legacy Devnet verification currently fails by design because the observed token does not satisfy the policy. Never run deployment scripts as a way to repair a verification result.

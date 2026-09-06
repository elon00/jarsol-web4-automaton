# Mainnet Preflight

## Hard stop conditions
Do not deploy if any item below is unresolved.

- [ ] Current CI is green
- [ ] Production dependency audit passes policy
- [ ] Independent code review completed
- [ ] Wallet/keypair handling reviewed
- [ ] No secrets in Git history or current repository
- [ ] Token parameters independently checked
- [ ] Metadata URI independently checked
- [ ] Network-specific deployment configuration reviewed
- [ ] User-facing disclosures prepared
- [ ] Explicit human approval recorded

## Final rule
Passing testnet verification does **not** automatically authorize Mainnet deployment.

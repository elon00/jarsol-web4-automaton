/**
 * JarSol Quantum-Ready Architecture
 * Test Suite: Policy Engine Deterministic Guardrails
 * Path: quantum/06_TESTS/policy-engine.test.ts
 */

import { globalPolicyEngine, AgentTradeProposal } from '../../src/services/PolicyEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runPolicyEngineTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL POLICY ENGINE TESTS');
  console.log('=====================================================================\n');

  // Test 1: Valid trade intent passes cleanly
  console.log('[TEST 1] Valid Devnet Trade Intent:');
  const validProposal: AgentTradeProposal = {
    proposalId: 'prop-valid-001',
    sourceAgent: 'JarvisQuantumAgent',
    network: 'devnet',
    tokenIn: 'SOL',
    tokenOut: 'JARSOL',
    amountInSol: 0.25,
    maxSlippageBps: 50, // 0.5%
    rationale: 'Rebalancing portfolio towards target SPL allocation',
    timestamp: new Date().toISOString(),
  };
  const res1 = globalPolicyEngine.evaluate(validProposal);
  assert(res1.passed === true, 'Valid proposal approved by policy engine');
  assert(res1.violations.length === 0, 'Zero policy violations for compliant intent');
  assert(res1.humanAuthorizationRequired === true, 'Human authorization invariant holds');

  // Test 2: Amount limit enforcement (> 0.5 SOL rejected)
  console.log('\n[TEST 2] Trade Amount Cap Enforcement:');
  const excessiveAmountProposal: AgentTradeProposal = {
    ...validProposal,
    proposalId: 'prop-excess-002',
    amountInSol: 2.5, // Exceeds 0.5 SOL limit
  };
  const res2 = globalPolicyEngine.evaluate(excessiveAmountProposal);
  assert(res2.passed === false, 'Excessive amount proposal strictly rejected');
  assert(res2.violations.some(v => v.includes('RULE_MAX_AMOUNT')), 'RULE_MAX_AMOUNT violation logged');

  // Test 3: Token allowlist enforcement
  console.log('\n[TEST 3] Token Allowlist Enforcement:');
  const rogueTokenProposal: AgentTradeProposal = {
    ...validProposal,
    proposalId: 'prop-rogue-003',
    tokenOut: 'UNAUDITED_MEMECOIN_XYZ',
  };
  const res3 = globalPolicyEngine.evaluate(rogueTokenProposal);
  assert(res3.passed === false, 'Rogue unapproved token proposal strictly rejected');
  assert(res3.violations.some(v => v.includes('RULE_TOKEN_ALLOWLIST')), 'RULE_TOKEN_ALLOWLIST violation logged');

  // Test 4: Mainnet isolation enforcement
  console.log('\n[TEST 4] Mainnet Fail-Closed Isolation:');
  const mainnetProposal: AgentTradeProposal = {
    ...validProposal,
    proposalId: 'prop-mainnet-004',
    network: 'mainnet-beta',
  };
  const res4 = globalPolicyEngine.evaluate(mainnetProposal);
  assert(res4.passed === false, 'Mainnet autonomous execution strictly blocked');
  assert(res4.violations.some(v => v.includes('RULE_NETWORK_ISOLATION')), 'RULE_NETWORK_ISOLATION violation logged');

  // Test 5: Invariant check (human signature can never be bypassed)
  console.log('\n[TEST 5] Human Authorization Invariant:');
  assert(res1.humanAuthorizationRequired === true, 'Human authorization invariant is true on approved intents');
  assert(res2.humanAuthorizationRequired === true, 'Human authorization invariant is true on rejected intents');

  console.log('\n=====================================================================');
  console.log('🏆 ALL POLICY ENGINE TESTS PASSED CLEANLY (5/5)');
  console.log('=====================================================================\n');
}

runPolicyEngineTests().catch(err => {
  console.error(err);
  process.exit(1);
});

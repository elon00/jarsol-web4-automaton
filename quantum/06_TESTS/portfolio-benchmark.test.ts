/**
 * JarSol Quantum-Ready Architecture
 * Test Suite: Portfolio Benchmark & QUBO Optimization Test
 * Path: quantum/06_TESTS/portfolio-benchmark.test.ts
 */

import { runPortfolioBenchmark } from '../04_QUANTUM_PORTFOLIO/benchmark-runner';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runPortfolioTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL PORTFOLIO BENCHMARK TESTS');
  console.log('=====================================================================\n');

  const bench = runPortfolioBenchmark();

  // 1. Asset Basket Verification
  console.log('[TEST 1] Asset Basket Integrity:');
  assert(bench.assetBasket.length === 5, 'Portfolio asset basket contains exactly 5 tokens (SOL, JARSOL, USDC, JUP, RAY)');
  assert(bench.assetBasket.includes('JARSOL'), '$JARSOL token is included in the optimization universe');

  // 2. Classical Markowitz Validation
  console.log('\n[TEST 2] Classical Markowitz Solver Validity:');
  const classWeights = Object.values(bench.classical.weights);
  const classSum = classWeights.reduce((acc, v) => acc + v, 0);
  assert(Math.abs(classSum - 1.0) < 0.01, `Classical weights sum to 1.0 on simplex (actual: ${classSum.toFixed(4)})`);
  assert(bench.classical.sharpeRatio > 0, `Classical Sharpe ratio is positive (actual: ${bench.classical.sharpeRatio})`);
  assert(bench.classical.solveTimeMs < 1000, `Classical solve time under 1 second (${bench.classical.solveTimeMs} ms)`);

  // 3. QUBO Annealing Validation
  console.log('\n[TEST 3] QUBO Simulated Annealing Solver Validity:');
  const quboWeights = Object.values(bench.quboAnnealing.weights);
  const quboSum = quboWeights.reduce((acc, v) => acc + v, 0);
  assert(Math.abs(quboSum - 1.0) < 0.01, `QUBO weights normalize to 1.0 on discrete budget (actual: ${quboSum.toFixed(4)})`);
  assert(bench.quboAnnealing.numQubitsEmulated === 15, 'QUBO matrix correctly maps to 15 emulated binary variables');
  assert(bench.quboAnnealing.sharpeRatio > 0, `QUBO Sharpe ratio is positive (actual: ${bench.quboAnnealing.sharpeRatio})`);

  // 4. Comparative Analysis Sanity
  console.log('\n[TEST 4] Reality & Anti-Hype Assertion:');
  assert(
    bench.analysis.notes.includes('Classical quadratic programming solves continuous simplex bounds faster'),
    'Benchmark report explicitly documents classical speed advantages on simplex bounds without false quantum supremacy claims'
  );

  console.log('\n=====================================================================');
  console.log('🏆 ALL PORTFOLIO BENCHMARK TESTS PASSED (4/4)');
  console.log('=====================================================================\n');
}

runPortfolioTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

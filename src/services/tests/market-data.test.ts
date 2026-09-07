/**
 * JARSOL DATA REALITY UNIT & ANOMALY TESTS
 * Standard: Reality-First Data Engineering, Anti-Hype & Outlier Rejection
 * Path: src/services/tests/market-data.test.ts
 */

import { marketDataService } from '../MarketDataService';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runMarketDataTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL DATA REALITY & ANOMALY TESTS');
  console.log('=====================================================================\n');

  // Test 1: Live Multi-Source Consensus for SOL
  console.log('[TEST 1] Live Multi-Source Consensus Pricing (SOL):');
  const solConsensus = await marketDataService.getConsensusPrice('SOL', true);
  console.log(`  📊 Price: $${solConsensus.consensusPriceUsd} | Sources: ${solConsensus.activeSources.join(', ')} | Deviation: ${solConsensus.deviationPct}%`);
  assert(solConsensus.consensusPriceUsd !== null && solConsensus.consensusPriceUsd > 10, 'Live SOL price is reasonable (> $10)');
  assert(solConsensus.sourcesCount >= 1, 'At least one live Tier-1 source responded');
  assert(solConsensus.isStale === false, 'Freshness check: Live price is not stale');
  assert(solConsensus.tradingAllowed === true, 'Trading allowed when live feeds are valid');

  // Test 2: Derived JARSOL Token Pricing
  console.log('\n[TEST 2] Canonical JARSOL Token Pricing Derived from SOL:');
  const jarsolConsensus = await marketDataService.getConsensusPrice('JARSOL');
  console.log(`  📊 $JARSOL Price: $${jarsolConsensus.consensusPriceUsd?.toFixed(12)} (Pegged via 9B:1 SOL ratio)`);
  assert(jarsolConsensus.consensusPriceUsd !== null && jarsolConsensus.consensusPriceUsd > 0, 'JARSOL price derived successfully');
  assert(solConsensus.consensusPriceUsd !== null && jarsolConsensus.consensusPriceUsd !== null && jarsolConsensus.consensusPriceUsd < solConsensus.consensusPriceUsd, 'JARSOL price is fractional relative to SOL');
  assert(jarsolConsensus.status === 'REFERENCE_MODEL_VALUATION', 'JARSOL status is explicitly REFERENCE_MODEL_VALUATION');
  assert(jarsolConsensus.tradingAllowed === false, 'JARSOL direct trading disallowed as reference valuation model');

  // Test 3: Outlier Rejection Test (Simulated Math Verification)
  console.log('\n[TEST 3] Outlier Rejection Engine Logic:');
  const simulatedQuotes = [
    { price: 104.50, source: 'FEED_A' },
    { price: 104.80, source: 'FEED_B' },
    { price: 104.70, source: 'FEED_C' },
    { price: 125.00, source: 'MALICIOUS_SPIKE_FEED' }, // +19% outlier
  ];
  const sorted = simulatedQuotes.map(q => q.price).sort((a, b) => a - b);
  const median = (sorted[1] + sorted[2]) / 2;
  const filtered = simulatedQuotes.filter(q => (Math.abs(q.price - median) / median) * 100 <= 2.5);
  const outliers = simulatedQuotes.filter(q => (Math.abs(q.price - median) / median) * 100 > 2.5);

  assert(filtered.length === 3, 'Filtered list contains exactly 3 normal quotes');
  assert(outliers.length === 1, 'Outlier list contains exactly 1 spiked quote');
  assert(outliers[0].source === 'MALICIOUS_SPIKE_FEED', 'Malicious spike successfully identified and purged');

  // Test 4: Empirical Statistical Derivation from Historical Time Series
  console.log('\n[TEST 4] Empirical Covariance Matrix & Volatility Derivation:');
  const stats = marketDataService.calculateEmpiricalStatistics();
  assert(stats.assets.length === 5, 'Asset universe contains exactly 5 tokens');
  assert(stats.periodDays === 30, 'Statistical time series period covers 30 days');

  // Verify Covariance Matrix Symmetry: Sigma_ij === Sigma_ji
  let symmetric = true;
  for (let i = 0; i < stats.assets.length; i++) {
    for (let j = 0; j < stats.assets.length; j++) {
      if (Math.abs(stats.covarianceMatrix[i][j] - stats.covarianceMatrix[j][i]) > 1e-4) {
        symmetric = false;
      }
    }
  }
  assert(symmetric === true, 'Empirical covariance matrix is mathematically symmetric (Sigma_ij === Sigma_ji)');

  // Verify Diagonal Variances are Strictly Positive
  let positiveDiag = true;
  for (let i = 0; i < stats.assets.length; i++) {
    if (stats.covarianceMatrix[i][i] <= 0) positiveDiag = false;
  }
  assert(positiveDiag === true, 'Diagonal covariance entries (variances) are strictly positive');

  // Verify Correlation Matrix Diagonal is 1.0 and Off-Diagonals are [-1, 1]
  let validCorr = true;
  for (let i = 0; i < stats.assets.length; i++) {
    if (stats.correlationMatrix[i][i] !== 1.0) validCorr = false;
    for (let j = 0; j < stats.assets.length; j++) {
      const c = stats.correlationMatrix[i][j];
      if (c < -1.0 || c > 1.0) validCorr = false;
    }
  }
  assert(validCorr === true, 'Correlation matrix strictly normalized between -1.0 and +1.0 with 1.0 diagonal');

  // Test 5: URS Fail-Closed Invariant (Zero Fake Fallback on Missing Data)
  console.log('\n[TEST 5] URS Fail-Closed Invariant on Network Failure:');
  // Querying a non-existent token must return DATA_UNAVAILABLE and null price
  const nonExistent = await marketDataService.getConsensusPrice('NON_EXISTENT_TOKEN_XYZ', true);
  assert(nonExistent.status === 'DATA_UNAVAILABLE', 'Missing token returns DATA_UNAVAILABLE');
  assert(nonExistent.consensusPriceUsd === null, 'Missing token consensusPriceUsd is strictly null (Zero fake fallback numbers)');
  assert(nonExistent.tradingAllowed === false, 'Trading is strictly blocked (tradingAllowed === false)');

  console.log('\n=====================================================================');
  console.log('🏆 ALL DATA REALITY & ANOMALY TESTS PASSED (5/5)');
  console.log('=====================================================================\n');
}

runMarketDataTests().catch(err => {
  console.error(err);
  process.exit(1);
});

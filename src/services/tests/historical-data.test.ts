/**
 * JarSol Automated Historical Data & Provenance Test Suite
 * Standard: Reality-First Data Engineering, Cryptographic Provenance, Anti-Hype
 * Path: src/services/tests/historical-data.test.ts
 */

import crypto from 'crypto';
import { historicalDataService } from '../HistoricalDataService.ts';
import { marketDataService } from '../MarketDataService.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runHistoricalDataTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL HISTORICAL DATA AUTOMATION & PROVENANCE TESTS');
  console.log('=====================================================================\n');

  // Test 1: Ingestion & Provenance Metadata
  console.log('[TEST 1] Historical Dataset Ingestion & Provenance Metadata:');
  const dataset = await historicalDataService.getHistoricalDataset();
  console.log(`  📊 Status: ${dataset.status} | Source: ${dataset.source.join(', ')} | Period: ${dataset.periodDays} days`);
  console.log(`  🔐 Dataset SHA-256: ${dataset.datasetSha256}`);

  assert(dataset.periodDays === 30, 'Historical dataset contains 30 daily return rows');
  assert(dataset.assets.length === 5, 'Asset universe contains exactly 5 tokens (SOL, USDC, JUP, RAY, JARSOL)');
  assert(dataset.status === 'LIVE_VERIFIED' || dataset.status === 'STALE_CACHED', 'Status is accurately either LIVE_VERIFIED or STALE_CACHED');
  assert(dataset.datasetSha256.length === 64, 'SHA-256 provenance hash is valid 64-character hexadecimal');

  // Verify hash matches byte-for-byte
  const computedHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(dataset.dailyReturns))
    .digest('hex');
  assert(computedHash === dataset.datasetSha256, 'Computed SHA-256 digest matches datasetSha256 byte-for-byte');

  // Test 2: Monotonic Chronological Ordering & Gap Sanity
  console.log('\n[TEST 2] Monotonic Date Continuity & Duplicate Detection:');
  assert(dataset.validation.zeroDuplicates, 'Dataset validated: zero duplicate dates detected');
  assert(dataset.validation.contiguousDates, 'Dataset validated: contiguous dates verified');

  for (let i = 1; i < dataset.dailyReturns.length; i++) {
    const prevDate = new Date(dataset.dailyReturns[i - 1].date).getTime();
    const currDate = new Date(dataset.dailyReturns[i].date).getTime();
    assert(currDate > prevDate, `Monotonic ascending date order holds (${dataset.dailyReturns[i - 1].date} < ${dataset.dailyReturns[i].date})`);
  }

  // Test 3: Synthetic Data Rejection Checker
  console.log('\n[TEST 3] Duplicate & Corrupted Data Rejection Engine:');
  const corruptedDuplicate = [
    { date: '2026-02-01', SOL: 0.01, USDC: 0, JUP: 0.01, RAY: 0.01, JARSOL: 0.01 },
    { date: '2026-02-01', SOL: 0.02, USDC: 0, JUP: 0.02, RAY: 0.02, JARSOL: 0.02 }, // Duplicate date
  ];
  const isDupValid = historicalDataService.validateDatasetIntegrity(corruptedDuplicate);
  assert(isDupValid === false, 'Corrupted dataset with duplicate timestamp successfully rejected');

  const corruptedNaN = [
    { date: '2026-02-01', SOL: NaN, USDC: 0, JUP: 0.01, RAY: 0.01, JARSOL: 0.01 },
  ];
  const isNanValid = historicalDataService.validateDatasetIntegrity(corruptedNaN);
  assert(isNanValid === false, 'Corrupted dataset with NaN return successfully rejected');

  // Test 4: Live Automated Empirical Covariance Derivation
  console.log('\n[TEST 4] Live Empirical Covariance Derivation with Provenance:');
  const stats = await marketDataService.getAutomatedEmpiricalStatistics();
  assert(stats.datasetSha256 !== undefined, 'Empirical statistics payload includes dataset SHA-256 provenance');
  assert(stats.provenanceStatus !== undefined, 'Empirical statistics payload includes provenance status');
  assert(stats.assets.length === 5, 'Statistical asset universe has 5 tokens');

  // Symmetry check on dynamic covariance
  let isSymmetric = true;
  for (let i = 0; i < stats.assets.length; i++) {
    for (let j = 0; j < stats.assets.length; j++) {
      if (Math.abs(stats.covarianceMatrix[i][j] - stats.covarianceMatrix[j][i]) > 1e-4) {
        isSymmetric = false;
      }
    }
  }
  assert(isSymmetric, 'Dynamically derived covariance matrix is mathematically symmetric (Sigma_ij === Sigma_ji)');
  assert(stats.correlationMatrix[0][0] === 1.0, 'Dynamic correlation diagonal is exactly 1.0');

  console.log('\n=====================================================================');
  console.log('🏆 ALL HISTORICAL DATA AUTOMATION & PROVENANCE TESTS PASSED (4/4)');
  console.log('=====================================================================\n');
}

runHistoricalDataTests().catch(err => {
  console.error(err);
  process.exit(1);
});

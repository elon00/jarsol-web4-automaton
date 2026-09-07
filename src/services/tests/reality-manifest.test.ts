/**
 * JarSol Reality Verification Engine
 * Test Suite: Reality Manifest Integrity & Truth Invariant Test
 * Path: src/services/tests/reality-manifest.test.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANIFEST_PATH = path.join(__dirname, '../../../REALITY_MANIFEST.json');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✅ ${msg}`);
}

async function runRealityManifestTests() {
  console.log('=====================================================================');
  console.log('🧪 RUNNING JARSOL REALITY MANIFEST AUDIT TESTS');
  console.log('=====================================================================\n');

  // Test 1: File Existence & JSON Parsing
  console.log('[TEST 1] Manifest File & Schema Integrity:');
  assert(fs.existsSync(MANIFEST_PATH), 'REALITY_MANIFEST.json exists at root directory');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert(manifest.name === 'JARSOL_REALITY_MANIFEST', 'Manifest name is JARSOL_REALITY_MANIFEST');
  assert(Array.isArray(manifest.features), 'Manifest contains features array');
  assert(manifest.features.length >= 25, `Manifest contains at least 25 subsystems (found: ${manifest.features.length})`);

  // Test 2: Mandatory Key Verification
  console.log('\n[TEST 2] Mandatory Field Audit Across All Subsystems:');
  const requiredKeys = ['id', 'name', 'category', 'real_inputs', 'algorithm', 'reproducibility', 'production_allowed', 'notes'];
  let allKeysPresent = true;
  for (const f of manifest.features) {
    for (const key of requiredKeys) {
      if (!(key in f)) {
        console.error(`Missing key "${key}" in feature: ${f.id}`);
        allKeysPresent = false;
      }
    }
  }
  assert(allKeysPresent, `All ${manifest.features.length} subsystems contain all ${requiredKeys.length} mandatory truth keys`);

  // Test 3: Category Taxonomy & Production Allowed Invariant
  console.log('\n[TEST 3] Strict Truth Taxonomy & Fail-Closed Invariant:');
  const validCategories = ['REAL', 'EXPERIMENTAL', 'SIMULATION', 'ROADMAP'];
  const counts: Record<string, number> = { REAL: 0, EXPERIMENTAL: 0, SIMULATION: 0, ROADMAP: 0 };
  let invariantPassed = true;

  for (const f of manifest.features) {
    if (!validCategories.includes(f.category)) {
      console.error(`Invalid category "${f.category}" in feature: ${f.id}`);
      invariantPassed = false;
    }
    counts[f.category] = (counts[f.category] || 0) + 1;

    // Strict Invariant: ONLY "REAL" features can have production_allowed: true
    if (f.category === 'REAL') {
      if (f.production_allowed !== true) {
        console.error(`Feature ${f.id} marked REAL must have production_allowed: true`);
        invariantPassed = false;
      }
    } else {
      if (f.production_allowed === true) {
        console.error(`VIOLATION: Non-REAL feature ${f.id} (${f.category}) has production_allowed: true!`);
        invariantPassed = false;
      }
    }
  }

  assert(invariantPassed, 'Fail-Closed Invariant: ONLY REAL subsystems have production_allowed: true');
  console.log(`  📊 Taxonomy Breakdown: ${counts.REAL} REAL | ${counts.EXPERIMENTAL} EXPERIMENTAL | ${counts.SIMULATION} SIMULATION | ${counts.ROADMAP} ROADMAP`);
  assert(counts.REAL >= 14, `At least 14 subsystems verified as REAL (actual: ${counts.REAL})`);
  assert(counts.EXPERIMENTAL >= 4, `At least 4 subsystems classified as EXPERIMENTAL (actual: ${counts.EXPERIMENTAL})`);
  assert(counts.SIMULATION >= 3, `At least 3 subsystems classified as SIMULATION (actual: ${counts.SIMULATION})`);
  assert(counts.ROADMAP >= 4, `At least 4 subsystems classified as ROADMAP (actual: ${counts.ROADMAP})`);

  console.log('\n=====================================================================');
  console.log('🏆 ALL REALITY MANIFEST AUDIT TESTS PASSED CLEANLY (3/3)');
  console.log('=====================================================================\n');
}

runRealityManifestTests().catch(err => {
  console.error(err);
  process.exit(1);
});

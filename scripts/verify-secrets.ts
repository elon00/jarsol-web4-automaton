import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

async function verifySecrets() {
  console.log('=====================================================================');
  console.log('🔒 JARSOL // REPOSITORY SECURITY & SECRET LEAK AUDIT');
  console.log('=====================================================================');

  let failureCount = 0;

  // 1. Check Git Tracked Files for Leaked Secret Files
  console.log('\n[CHECK 1] Scanning Git Tracked Files for Secret Artifacts...');
  try {
    const trackedFiles = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf-8' })
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const forbiddenPatterns = [
      /id\.json$/i,
      /\.key$/i,
      /secret/i,
      /\.env$/i,
      /\.env\.local$/i,
      /private.*key/i,
      /wallet.*secret/i
    ];

    const violations: string[] = [];
    for (const file of trackedFiles) {
      if (file === 'scripts/verify-secrets.ts' || file === 'SECURITY.md') continue;
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(file)) {
          violations.push(file);
          break;
        }
      }
    }

    if (violations.length > 0) {
      console.error('❌ FAILED: Found forbidden secret-pattern files tracked in Git:');
      violations.forEach(v => console.error(`   - ${v}`));
      failureCount++;
    } else {
      console.log(`✅ Passed: Scanned ${trackedFiles.length} tracked files. Zero secret files tracked.`);
    }
  } catch (err: any) {
    console.error('❌ Error executing git ls-files:', err.message);
    failureCount++;
  }

  // 2. Check .gitignore has Essential Secret Rules
  console.log('\n[CHECK 2] Validating .gitignore Rules for Wallet Keypairs...');
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.error('❌ FAILED: .gitignore file not found at project root.');
    failureCount++;
  } else {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const requiredRules = ['id.json', '.env', '*.key', 'secrets/'];
    const missingRules = requiredRules.filter(r => !gitignoreContent.includes(r));
    if (missingRules.length > 0) {
      console.error(`❌ FAILED: .gitignore missing critical rules: ${missingRules.join(', ')}`);
      failureCount++;
    } else {
      console.log('✅ Passed: .gitignore contains mandatory keypair & secret protection rules.');
    }
  }

  // 3. Test Mainnet Fail-Closed Safety Gate
  console.log('\n[CHECK 3] Verifying Fail-Closed Mainnet Gate...');
  const mainnetDeployScript = path.join(ROOT_DIR, 'scripts', 'deploy-mainnet.ts');
  if (!fs.existsSync(mainnetDeployScript)) {
    console.error('❌ FAILED: deploy-mainnet.ts not found.');
    failureCount++;
  } else {
    const scriptContent = fs.readFileSync(mainnetDeployScript, 'utf-8');
    const hasNetworkCheck = scriptContent.includes("process.env.SOLANA_NETWORK !== 'mainnet-beta'");
    const hasApprovalCheck = scriptContent.includes("process.env.MAINNET_DEPLOYMENT_APPROVED !== 'true'");
    if (!hasNetworkCheck || !hasApprovalCheck) {
      console.error('❌ FAILED: deploy-mainnet.ts lacks mandatory fail-closed environment guards.');
      failureCount++;
    } else {
      console.log('✅ Passed: Mainnet deployment script contains strict fail-closed safety guards.');
    }
  }

  console.log('\n=====================================================================');
  if (failureCount === 0) {
    console.log('🏆 ALL SECRET & SECURITY GATES PASSED (ZERO LEAKS DETECTED)');
    console.log('=====================================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ SECURITY GATE FAILED: ${failureCount} issue(s) detected.`);
    console.error('=====================================================================\n');
    process.exit(1);
  }
}

verifySecrets().catch(err => {
  console.error('FATAL Security check error:', err);
  process.exit(1);
});

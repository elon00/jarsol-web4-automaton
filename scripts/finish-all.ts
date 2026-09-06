import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

interface GateResult {
  gateNumber: number;
  name: string;
  command: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  error?: string;
}

const results: GateResult[] = [];

function runGate(gateNumber: number, name: string, command: string): boolean {
  console.log(`\n=====================================================================`);
  console.log(`▶ GATE [${gateNumber}/9]: ${name}`);
  console.log(`💻 Command: ${command}`);
  console.log(`=====================================================================`);

  const startTime = Date.now();
  try {
    execSync(command, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    const durationMs = Date.now() - startTime;
    console.log(`✅ [GATE ${gateNumber} PASSED] (${(durationMs / 1000).toFixed(2)}s)`);
    results.push({ gateNumber, name, command, status: 'PASS', durationMs });
    return true;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error(`❌ [GATE ${gateNumber} FAILED] (${(durationMs / 1000).toFixed(2)}s)`);
    results.push({ gateNumber, name, command, status: 'FAIL', durationMs, error: error.message });
    return false;
  }
}

async function finishAll() {
  console.log('#####################################################################');
  console.log('⚡ JARSOL // CONSOLIDATED REALITY-FIRST ONE-CLICK MASTER PIPELINE');
  console.log('#####################################################################');
  console.log(`Started At: ${new Date().toISOString()}`);
  console.log(`Root Directory: ${ROOT_DIR}\n`);

  const gates = [
    { num: 1, name: 'Locked Dependency Verification', cmd: 'npm ci --dry-run' },
    { num: 2, name: 'Production Dependency Security Audit (0 High / 0 Critical)', cmd: 'npm audit --omit=dev --audit-level=high' },
    { num: 3, name: 'Strict TypeScript Typecheck', cmd: 'npx tsc --noEmit' },
    { num: 4, name: 'Vite Production Build', cmd: 'npm run build' },
    { num: 5, name: 'Secrets, Leak Scanner & Mainnet Fail-Closed Safety Audit', cmd: 'npx tsx scripts/verify-secrets.ts' },
    { num: 6, name: 'Solana Devnet On-Chain Verification', cmd: 'npm run verify:devnet' },
    { num: 7, name: 'Solana Testnet Canonical Verification', cmd: 'npm run verify:testnet' },
    { num: 8, name: 'Solana Testnet Safe Fresh Template Verification', cmd: 'npm run verify:testnet:fresh' },
    { num: 9, name: 'Documentation & Competition Package Reality Check', cmd: 'node -e "if (!fs.existsSync(\'docs/COMPETITION_READINESS.md\') || !fs.existsSync(\'SECURITY.md\')) process.exit(1);"' }
  ];

  let anyFailed = false;
  for (const gate of gates) {
    const ok = runGate(gate.num, gate.name, gate.cmd);
    if (!ok) {
      anyFailed = true;
      break; // Fail-closed
    }
  }

  console.log('\n=====================================================================');
  console.log('📊 CONSOLIDATED PIPELINE AUDIT REPORT');
  console.log('=====================================================================');

  for (const r of results) {
    const symbol = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} Gate ${r.gateNumber}: ${r.name.padEnd(50)} [${r.status}] (${(r.durationMs / 1000).toFixed(2)}s)`);
  }

  console.log('\n=====================================================================');
  if (!anyFailed && results.length === gates.length) {
    console.log('🏆 FINAL VERDICT: 🟢 READY (COMPETITION & DEMO CERTIFIED)');
    console.log('   - 0 Critical / 0 High production dependencies');
    console.log('   - 0 TypeScript / 0 Build compilation errors');
    console.log('   - 100% On-Chain verified Devnet & Testnet state');
    console.log('   - 0 Leaked secrets or keypairs');
    console.log('   - 🔒 Mainnet remains 100% fail-closed (No SOL spent)');
    console.log('=====================================================================\n');
    process.exit(0);
  } else {
    console.error('🛑 FINAL VERDICT: 🔴 BLOCKED — Pipeline failed closed at non-compliant gate.');
    console.error('=====================================================================\n');
    process.exit(1);
  }
}

finishAll().catch(err => {
  console.error('Fatal Pipeline Execution Error:', err);
  process.exit(1);
});

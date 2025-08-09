// ES module test runner that auto-discovers and runs all *.test.js files in the tests directory.
// Tests should export a function runTests() returning { name, passed, failed, failures }.
// This runner invokes each and prints a unified summary.

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
  const testsDir = path.resolve(process.cwd(), 'tests');
  let files = await readdir(testsDir);
  files = files.filter(f => f.endsWith('.test.js'));
  files.sort((a, b) => a.localeCompare(b, 'en'));

  if (files.length === 0) {
    console.log('No test files found.');
    return;
  }

  const perFile = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const f of files) {
    const full = path.resolve(testsDir, f);
    const mod = await import(pathToFileURL(full).href);
    const fn = typeof mod.runTests === 'function' ? mod.runTests : (typeof mod.default === 'function' ? mod.default : null);
    if (!fn) {
      perFile.push({ file: f, name: f, passed: 0, failed: 1, failures: [`${f}: runTests() not found`] });
      totalFailed += 1;
      continue;
    }
    let result;
    try {
      result = await fn();
    } catch (e) {
      perFile.push({ file: f, name: f, passed: 0, failed: 1, failures: [String(e && e.message ? e.message : e)] });
      totalFailed += 1;
      continue;
    }
    const name = result && result.name ? result.name : f;
    const passed = Number(result && result.passed || 0);
    const failed = Number(result && result.failed || 0);
    const failures = Array.isArray(result && result.failures) ? result.failures : [];
    totalPassed += passed;
    totalFailed += failed;
    perFile.push({ file: f, name, passed, failed, failures });
  }

  // Output summary
  console.log('Test Summary:');
  for (const r of perFile) {
    const status = r.failed === 0 ? 'OK' : 'FAIL';
    console.log(`- ${r.name}: ${r.passed} passed, ${r.failed} failed => ${status}`);
    if (r.failed > 0 && r.failures.length) {
      for (const msg of r.failures) console.log(`   • ${msg}`);
    }
  }
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed across ${files.length} files.`);

  if (totalFailed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Test runner encountered an error before running tests:', err);
  process.exit(1);
});

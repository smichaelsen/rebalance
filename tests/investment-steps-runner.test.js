import { runInvestmentSteps } from '../js/modules/calculator/modules/investment-steps-runner.js';

function assertEqual(actual, expected, message) {
  const same = Object.is(actual, expected) || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (!same) throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
}

function assertApprox(actual, expected, eps, message) {
  if (!(typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) <= eps)) {
    throw new Error(`${message} - Expected approx: ${expected} ±${eps}, Actual: ${actual}`);
  }
}

function sumInvestments(investments) {
  return investments.reduce((acc, i) => acc + i.amount, 0);
}

function sumCurrent(categories) {
  return categories.reduce((acc, c) => acc + Number(c.currentValue || 0), 0);
}

export function runTests() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  // Case 1: amount 5.3, step 1 -> only 5 allocated (0.3 left unallocated)
  try {
    const cats = [
      { name: 'A', targetAllocation: '60', currentValue: 100 },
      { name: 'B', targetAllocation: '40', currentValue: 50 }
    ];
    const beforeSum = sumCurrent(cats);
    const inv = runInvestmentSteps(5.3, 1, cats);
    const total = sumInvestments(inv);
    assertEqual(total, 5, '5.3 with step 1 allocates 5 in total');
    const afterSum = sumCurrent(cats);
    assertEqual(afterSum - beforeSum, 5, 'Categories total increased by allocated amount (5)');
    passed++;
  } catch (e) {
    failed++; failures.push(e.message);
  }

  // Case 2: amount 1.1, step 0.25 -> only 1.0 allocated (0.1 left unallocated)
  try {
    const cats = [
      { name: 'X', targetAllocation: '50', currentValue: 0 },
      { name: 'Y', targetAllocation: '50', currentValue: 0 }
    ];
    const beforeSum = sumCurrent(cats);
    const inv = runInvestmentSteps(1.1, 0.25, cats);
    const total = sumInvestments(inv);
    assertApprox(total, 1.0, 1e-9, '1.1 with step 0.25 allocates 1.0 in total');
    const afterSum = sumCurrent(cats);
    assertApprox(afterSum - beforeSum, 1.0, 1e-9, 'Categories total increased by allocated amount (1.0)');
    passed++;
  } catch (e) {
    failed++; failures.push(e.message);
  }

  // Case 3: invalid amount -> empty investments
  try {
    const cats = [ { name: 'A', targetAllocation: '100', currentValue: 0 } ];
    const inv = runInvestmentSteps(NaN, 1, cats);
    assertEqual(Array.isArray(inv), true, 'returns an array for invalid amount');
    assertEqual(inv.length, 0, 'invalid amount results in empty investments');
    passed++;
  } catch (e) {
    failed++; failures.push(e.message);
  }

  // Case 4: invalid step -> empty investments
  try {
    const cats = [ { name: 'A', targetAllocation: '100', currentValue: 0 } ];
    const inv = runInvestmentSteps(10, 0, cats);
    assertEqual(inv.length, 0, 'non-positive step results in empty investments');
    passed++;
  } catch (e) {
    failed++; failures.push(e.message);
  }

  // Case 5: empty categories -> empty investments
  try {
    const inv = runInvestmentSteps(10, 1, []);
    assertEqual(inv.length, 0, 'empty categories result in empty investments');
    passed++;
  } catch (e) {
    failed++; failures.push(e.message);
  }

  return { name: 'investment-steps-runner', passed, failed, failures };
}

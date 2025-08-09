import { determineStepSize } from '../js/modules/calculator/modules/step-size-determinator.js';

function assertEqual(actual, expected, message) {
  if (Number.isNaN(expected) || Number.isNaN(actual)) {
    throw new Error(`${message} - NaN encountered`);
  }
  const same = Object.is(actual, expected) || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (!same) {
    throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
  }
}

export function runTests() {
  const cases = [
    // Provided examples
    { amt: 50, round: false, expected: 0.5, desc: 'example 1: 50, false -> 0.5' },
    { amt: 75, round: true, expected: 1, desc: 'example 2: 75, true -> 1' },

    // Non-positive amounts
    { amt: 0, round: true, expected: 1, desc: 'zero amount, round true -> 1' },
    { amt: 0, round: false, expected: 0.01, desc: 'zero amount, round false -> 0.01' },
    { amt: -100, round: true, expected: 1, desc: 'negative amount, round true -> 1' },
    { amt: -5, round: false, expected: 0.01, desc: 'negative amount, round false -> 0.01' },

    // Small amounts
    { amt: 0.001, round: false, expected: 0.01, desc: 'very small amount, false -> min cent' },
    { amt: 0.4, round: true, expected: 1, desc: 'small amount, true -> min 1' },

    // Large amounts
    { amt: 12345.67, round: false, expected: 123.46, desc: 'large amount, false -> ceil to cents' },
    { amt: 12345.67, round: true, expected: 124, desc: 'large amount, true -> ceil to int' },

    // Type normalization
    { amt: Number.POSITIVE_INFINITY, round: false, expected: 0.01, desc: 'infinite -> treated as 0' },
    { amt: NaN, round: true, expected: 1, desc: 'NaN -> treated as 0' }
  ];

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const t of cases) {
    try {
      const actual = determineStepSize(t.amt, t.round);
      assertEqual(actual, t.expected, t.desc);
      passed++;
    } catch (e) {
      failed++;
      failures.push(e.message);
    }
  }

  return { name: 'step-size-determinator', passed, failed, failures };
}

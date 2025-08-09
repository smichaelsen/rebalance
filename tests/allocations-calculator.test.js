import { calculateAllocations } from '../js/modules/calculator/modules/allocations-calculator.js';

function assertApprox100(sum, desc) {
  if (typeof sum !== 'number' || !Number.isFinite(sum)) {
    throw new Error(`${desc} - Sum is not a finite number: ${sum}`);
  }
  if (!(sum > 99.9 && sum < 100.1)) {
    throw new Error(`${desc} - Sum not within (99.9, 100.1): ${sum}`);
  }
}

function assertEqual(actual, expected, message) {
  const same = Object.is(actual, expected) || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (!same) throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
}

function sumPercentages(allocations) {
  return allocations.reduce((acc, a) => acc + a.percentage, 0);
}

export function runTests() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const cases = [
    {
      categories: [
        { name: 'A', targetAllocation: '50', currentValue: '100' },
        { name: 'B', targetAllocation: '50', currentValue: '200' }
      ],
      desc: 'simple two categories with string values'
    },
    {
      categories: [
        { name: 'Tech', targetAllocation: '40', currentValue: '1234.56' },
        { name: 'Bonds', targetAllocation: '30', currentValue: '789.44' },
        { name: 'Cash', targetAllocation: '30', currentValue: '10' }
      ],
      desc: 'three categories with decimals'
    },
    {
      categories: [
        { name: 'X', targetAllocation: '70', currentValue: '0.01' },
        { name: 'Y', targetAllocation: '30', currentValue: '0.02' },
        { name: 'Z', targetAllocation: '10', currentValue: '0.03' }
      ],
      desc: 'tiny fractional amounts'
    },
    {
      categories: [
        { name: 'Pos', targetAllocation: '80', currentValue: '1000' },
        { name: 'Zero', targetAllocation: '10', currentValue: '0' },
        { name: 'Neg', targetAllocation: '10', currentValue: '-50' },
        { name: 'NaNish', targetAllocation: '0', currentValue: 'not-a-number' }
      ],
      desc: 'handles zero/negative/NaN as 0 but still sums to ~100 over positives only'
    }
  ];

  for (const t of cases) {
    try {
      const allocations = calculateAllocations(t.categories);
      const sum = sumPercentages(allocations);
      assertApprox100(sum, t.desc);
      passed++;
    } catch (e) {
      failed++;
      failures.push(e.message);
    }
  }

  // Additional explicit zero-total behavior: all percentages should be 0 and sum 0
  try {
    const zeroCats = [
      { name: 'A', targetAllocation: '50', currentValue: '0' },
      { name: 'B', targetAllocation: '50', currentValue: '-10' }
    ];
    const allocations = calculateAllocations(zeroCats);
    const sum = sumPercentages(allocations);
    assertEqual(sum, 0, 'zero-total categories -> sum 0');
    for (const a of allocations) assertEqual(a.percentage, 0, 'zero-total category percentage');
    passed++;
  } catch (e) {
    failed++;
    failures.push(e.message);
  }

  return { name: 'allocations-calculator', passed, failed, failures };
}

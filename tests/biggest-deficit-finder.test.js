import { findBiggestDeficit } from '../js/modules/calculator/modules/biggest-deficit-finder.js';

function assertEqual(actual, expected, message) {
  const same = Object.is(actual, expected) || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (!same) throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
}

export function runTests() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const cases = [
    {
      desc: 'basic: picks category with largest positive deficit',
      categories: [
        { name: 'A', targetAllocation: 50, currentValue: 100 }, // 33.33% -> deficit ~16.67
        { name: 'B', targetAllocation: 50, currentValue: 200 }  // 66.67% -> deficit ~-16.67
      ],
      expectedName: 'A'
    },
    {
      desc: 'tie-breaker #1: larger targetAllocation wins when deficits equal',
      categories: [
        { name: 'A', targetAllocation: 30, currentValue: 10 }, // 10% -> deficit 20
        { name: 'B', targetAllocation: 40, currentValue: 20 }, // 20% -> deficit 20 (tie)
        { name: 'C', targetAllocation: 30, currentValue: 70 }  // 70% -> deficit -40
      ],
      expectedName: 'B'
    },
    {
      desc: 'tie-breaker #2: alphabetical by name when deficits and targets equal',
      categories: [
        { name: 'Beta', targetAllocation: 30, currentValue: 10 },   // 10% -> deficit 20
        { name: 'Alpha', targetAllocation: 30, currentValue: 10 },  // 10% -> deficit 20 (tie)
        { name: 'Zed', targetAllocation: 40, currentValue: 80 }     // 80% -> deficit -40
      ],
      expectedName: 'Alpha'
    },
    {
      desc: 'all deficits negative: pick the least negative (largest) deficit',
      categories: [
        { name: 'OverA', targetAllocation: 10, currentValue: 70 }, // 70% -> deficit -60
        { name: 'OverB', targetAllocation: 20, currentValue: 30 }  // 30% -> deficit -10 (best)
      ],
      expectedName: 'OverB'
    },
    {
      desc: 'handles empty array -> undefined',
      categories: [],
      expectedName: undefined
    },
    {
      desc: 'handles non-array input -> undefined',
      categories: /** @type any */ (null),
      expectedName: undefined
    },
    {
      desc: 'safeTarget: negative target coerced to 0; larger (less negative) deficit wins',
      categories: [
        { name: 'NegTarget', targetAllocation: -10, currentValue: 50 }, // 50% -> target 0 -> deficit -50
        { name: 'SmallTarget', targetAllocation: 10, currentValue: 50 } // 50% -> deficit -40 (best)
      ],
      expectedName: 'SmallTarget'
    },
    {
      desc: 'safeTarget: >100 clamped to 100 leads to largest deficit',
      categories: [
        { name: 'Clamp100', targetAllocation: 150, currentValue: 10 }, // 100% target, ~25% current -> deficit ~75
        { name: 'Medium', targetAllocation: 80, currentValue: 30 },    // ~75% current -> deficit ~5
        { name: 'BigCurrent', targetAllocation: 20, currentValue: 60 } // ~50% current -> deficit -30
      ],
      expectedName: 'Clamp100'
    },
    {
      desc: 'safeTarget: NaN target treated as 0; ties on deficit/target resolved by alphabetical name with non-strings',
      categories: [
        { name: undefined, targetAllocation: Number.NaN, currentValue: 10 }, // 10% -> target 0 -> deficit -10
        { name: 42, targetAllocation: 0, currentValue: 10 },                // 10% -> target 0 -> deficit -10 (tie)
        { name: 'Other', targetAllocation: 100, currentValue: 80 }          // 80% -> deficit 20 (actually best)
      ],
      expectedName: 'Other'
    },
    {
      desc: 'zero/negative/NaN current values -> 0%: largest target wins; tie by name',
      categories: [
        { name: 'Zulu', targetAllocation: 20, currentValue: 0 },
        { name: 'Alpha', targetAllocation: 20, currentValue: -5 },
        { name: 'Mike', targetAllocation: 10, currentValue: 'NaN' }
      ],
      // All current -> 0%, deficits equal to targets. Largest target is 20; tie between Alpha and Zulu -> alphabetical -> Alpha
      expectedName: 'Alpha'
    }
  ];

  for (const t of cases) {
    try {
      const result = findBiggestDeficit(t.categories);
      const actualName = result ? result.name : undefined;
      assertEqual(actualName, t.expectedName, t.desc);
      passed++;
    } catch (e) {
      failed++;
      failures.push(e.message);
    }
  }

  return { name: 'biggest-deficit-finder', passed, failed, failures };
}

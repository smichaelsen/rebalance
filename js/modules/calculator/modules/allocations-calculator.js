/**
 * @typedef {import('../../../types.js').Category} Category
 * @typedef {import('../../../types.js').Allocation} Allocation
 */

/**
 * @param {Category[]} categories
 * @returns {Allocation[]}
 */
export function calculateAllocations(categories) {
    // Sanitize current values: coerce to number, use 0 for non-finite or negative values
    const values = categories.map((c) => {
        const n = Number(c.currentValue);
        return Number.isFinite(n) && n > 0 ? n : 0;
    });

    const sum = values.reduce((acc, v) => acc + v, 0);

    if (sum <= 0) {
        // No positive current values -> all 0%
        return categories.map((category) => ({ category, percentage: 0 }));
    }

    // Compute percentages based on sanitized values
    return categories.map((category, idx) => ({
        category,
        percentage: (values[idx] / sum) * 100,
    }));
}
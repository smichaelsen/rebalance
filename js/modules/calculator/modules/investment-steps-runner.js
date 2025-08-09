import { findBiggestDeficit } from './biggest-deficit-finder.js';

/**
 * @typedef {import('../../types.js').Investment} Investment
 * @typedef {import('../../types.js').Category} Category
 */

/**
 * Distributes amountToInvest across categories in steps of stepSize.
 * For each step, selects a category via findBiggestDeficit, creates or reuses
 * an Investment object for that category, and updates the category.currentValue.
 *
 * @param {number} amountToInvest
 * @param {number} stepSize
 * @param {Category[]} categories
 * @return {Investment[]}
 */
export function runInvestmentSteps(amountToInvest, stepSize, categories) {
    /** @type {Investment[]} */
    const investments = [];

    const amt = Number(amountToInvest);
    const step = Number(stepSize);
    const cats = Array.isArray(categories) ? categories : [];

    if (!Number.isFinite(amt) || amt <= 0) return investments;
    if (!Number.isFinite(step) || step <= 0) return investments;
    if (cats.length === 0) return investments;

    // Determine decimal precision from step size to keep arithmetic stable
    const decimals = (() => {
        const s = String(step);
        const idx = s.indexOf('.');
        return idx >= 0 ? (s.length - idx - 1) : 0;
    })();
    const factor = Math.pow(10, decimals);

    const roundToStepDecimals = (v) => Math.round(v * factor) / factor;
    const add = (a, b) => Math.round((a * factor + b * factor)) / factor;

    let remaining = amt;

    // Safety cap to prevent infinite loops due to rounding issues
    const maxIterations = Math.ceil(amt / step) + 5;
    let iterations = 0;

    while (remaining >= stepSize && iterations < maxIterations) {
        iterations++;
        const chunkRaw = remaining < step ? remaining : step;
        const chunk = roundToStepDecimals(chunkRaw);
        if (!(chunk > 0)) break;

        const category = findBiggestDeficit(cats);
        if (!category) break;

        // Reuse existing investment entry or create a new one
        let inv = investments.find((i) => i.category === category);
        if (!inv) {
            inv = { category, amount: 0 };
            investments.push(inv);
        }
        inv.amount = add(inv.amount, chunk);

        // Update the category's current value without rounding
        const currNum = Number(category.currentValue);
        const currSafe = Number.isFinite(currNum) ? currNum : 0;
        category.currentValue = currSafe + chunk;

        remaining = remaining - chunk;
    }

    return investments;
}
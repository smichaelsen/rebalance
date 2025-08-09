/**
 * Determine an appropriate step size for distributing investments.
 * Rules:
 * - If roundInvestedAmount is true: step must be a whole number (> 0).
 * - If false: step must be a multiple of 0.01 (> 0).
 * - Ensure it takes 100 steps or less to reach amountToInvest.
 *
 * @param {number} amountToInvest - Total amount of money to invest.
 * @param {boolean} roundInvestedAmount - Whether to round invested amounts in the result.
 * @return {number}
 */
export function determineStepSize(amountToInvest, roundInvestedAmount) {
    const amt = typeof amountToInvest === 'number' && isFinite(amountToInvest) ? amountToInvest : 0;

    // Minimal allowed step per mode
    const minStep = roundInvestedAmount ? 1 : 0.01;

    // Non-positive amount: return minimal step allowed
    if (amt <= 0) {
        return minStep;
    }

    // Base step so that 100 steps cover the amount
    const base = amt / 100;

    if (roundInvestedAmount) {
        // Round up to nearest integer, ensure >= 1
        const stepInt = Math.ceil(base);
        return Math.max(stepInt, 1);
    }

    // For cent granularity: round up to nearest 0.01, handle floating precision
    const cents = Math.ceil(base * 100); // number of cents
    const step = cents / 100;
    // Ensure at least 0.01
    const safeStep = step >= 0.01 ? step : 0.01;
    // Normalize to two decimals
    return Number(safeStep.toFixed(2));
}
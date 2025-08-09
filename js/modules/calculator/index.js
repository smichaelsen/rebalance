import { determineStepSize } from './modules/step-size-determinator.js';
import { calculateAllocations } from './modules/allocations-calculator.js';
import { runInvestmentSteps } from './modules/investment-steps-runner.js';

/**
 * @typedef {import('../../types.js').Allocation} Allocation
 * @typedef {import('../../types.js').Investment} Investment
 * @typedef {import('../../types.js').Category} Category
 * @typedef {import('../../types.js').CalculationResult} CalculationResult
 */

/**
 * @param {number} amountToInvest - Total amount of money to invest.
 * @param {boolean} roundInvestedAmount - Whether to round invested amounts in the result.
 * @param {Category[]} categories - List of categories to rebalance.
 * @return {CalculationResult}
 */
export default function calculate(amountToInvest, roundInvestedAmount, categories) {
    const stepSize = determineStepSize(amountToInvest, roundInvestedAmount);
    const targetAllocations = categories.map((category) => { return {category, percentage: category.targetAllocation} });
    const initialAllocations = calculateAllocations(categories);
    const investments = runInvestmentSteps(amountToInvest, stepSize, categories);
    const achievedAllocations = calculateAllocations(categories);
    return {
        targetAllocations,
        initialAllocations,
        achievedAllocations,
        investments,
        categories,
    }
}
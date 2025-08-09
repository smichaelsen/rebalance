/**
 * @typedef {Object} Allocation
 * @property {Category} category
 * @property {number} percentage
 */

/**
 * @typedef {Object} Category
 * @property {string} name - Asset name.
 * @property {number} targetAllocation - Target allocation percentage for this asset (0-100).
 * @property {number} currentValue - Current value invested in this asset.
 * @property {string|null} [isin] - Optional ISIN identifier for the asset.
 */

/**
 * @typedef {Object} CalculationResult
 * @property {Allocation[]} targetAllocations
 * @property {Allocation[]} initialAllocations
 * @property {Allocation[]} achievedAllocations
 * @property {Investment[]} investments
 * @property {Category[]} categories
 */

/**
 * @typedef {Object} InputFormSubmitDetail
 * @property {number} amountToInvest
 * @property {boolean} roundInvestedAmount
 * @property {Category[]} categories
 */

/**
 * @typedef {Object} Investment
 * @property {Category} category
 * @property {number} amount
 */

export {}; // ensure this file is treated as an ES module

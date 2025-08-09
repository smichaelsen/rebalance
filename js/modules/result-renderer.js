/**
 * @typedef {import('../types.js').Allocation} Allocation
 * @typedef {import('../types.js').Investment} Investment
 * @typedef {import('../types.js').Category} Category
 * @typedef {import('../types.js').CalculationResult} CalculationResult
 */

/**
 * Format a number as percentage with 1 decimal place.
 * @param {number} n
 */
function fmtPercent(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '0.0%';
    return `${num.toFixed(1)}%`;
}

/**
 * Format a number as a value with two decimals and thousand separators.
 * @param {number} n
 */
function fmtValue(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Safely get the allocation percentage for a given category from a list of allocations.
 * @param {Allocation[]} allocations
 * @param {Category} category
 * @returns {number}
 */
function getAllocationPercentage(allocations, category) {
    if (!Array.isArray(allocations)) return 0;
    const a = allocations.find((al) => al.category === category) ||
        allocations.find((al) => al.category?.name === category?.name);
    return Number(a?.percentage) || 0;
}

/**
 * Safely get the investment amount for a given category from a list of investments.
 * @param {Investment[]} investments
 * @param {Category} category
 * @returns {number}
 */
function getInvestmentAmount(investments, category) {
    if (!Array.isArray(investments)) return 0;
    const inv = investments.find((i) => i.category === category) ||
        investments.find((i) => i.category?.name === category?.name);
    return Number(inv?.amount) || 0;
}

/**
 * Renders the calculation result as a Bootstrap table inside #resultsContainer.
 * Columns: Asset, Target, Before, Added, New Value, Achieved.
 * Footer: Total for Added and New Value.
 * Rows with Added > 0 receive class "font-weight-bold".
 *
 * @param {CalculationResult} result
 */
export default function renderResult(result) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    // Basic validation
    if (!result || !Array.isArray(result.categories) || result.categories.length === 0) {
        container.innerHTML = '<div class="alert alert-secondary">No results to display.</div>';
        return;
    }

    const { categories, targetAllocations, initialAllocations, achievedAllocations, investments } = result;

    let totalAdded = 0;
    let totalNewValue = 0;

    // Build table
    const table = document.createElement('table');
    table.className = 'table table-sm table-striped mb-0';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Asset</th>
            <th>Target</th>
            <th>Before</th>
            <th>Added</th>
            <th>New Value</th>
            <th>Achieved</th>
        </tr>`;

    const tbody = document.createElement('tbody');

    for (const category of categories) {
        const target = getAllocationPercentage(targetAllocations, category);
        const before = getAllocationPercentage(initialAllocations, category);
        const added = getInvestmentAmount(investments, category);
        const newValue = (Number(category?.currentValue) || 0);
        const achieved = getAllocationPercentage(achievedAllocations, category);

        totalAdded += added;
        totalNewValue += newValue;

        const tr = document.createElement('tr');
        if (added > 0) tr.classList.add('font-weight-bold');

        tr.innerHTML = `
            <td>${escapeHtml(category?.name ?? '')}</td>
            <td class="text-end">${fmtPercent(target)}</td>
            <td class="text-end">${fmtPercent(before)}</td>
            <td class="text-end">${fmtValue(added)}</td>
            <td class="text-end">${fmtValue(newValue)}</td>
            <td class="text-end">${fmtPercent(achieved)}</td>
        `;
        tbody.appendChild(tr);
    }

    const tfoot = document.createElement('tfoot');
    const footTr = document.createElement('tr');
    footTr.innerHTML = `
        <th>Total</th>
        <th></th>
        <th></th>
        <th class="text-end">${fmtValue(totalAdded)}</th>
        <th class="text-end">${fmtValue(totalNewValue)}</th>
        <th></th>
    `;
    tfoot.appendChild(footTr);

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);

    // Replace container content
    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * Minimal HTML escape to avoid issues if names contain angle brackets.
 * @param {string} s
 */
function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

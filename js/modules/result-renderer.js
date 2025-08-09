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
 * Format a number as a value with two decimals and thousands separators.
 * @param {number} n
 */
function fmtValue(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Escape HTML special characters to avoid XSS when injecting into innerHTML.
 * @param {string} s
 */
function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

    const tableTmpl = /** @type {HTMLTemplateElement|null} */ (document.getElementById('result-table-template'));
    const rowTmpl = /** @type {HTMLTemplateElement|null} */ (document.getElementById('result-row-template'));
    const noResTmpl = /** @type {HTMLTemplateElement|null} */ (document.getElementById('no-results-template'));

    // Basic validation
    if (!result || !Array.isArray(result.categories) || result.categories.length === 0) {
        container.innerHTML = '';
        if (noResTmpl?.content) {
            container.appendChild(noResTmpl.content.cloneNode(true));
        } else {
            // Fallback to plain text (no markup) if template is missing
            container.textContent = 'No results to display.';
        }
        return;
    }

    if (!tableTmpl || !rowTmpl) {
        // Use template-based alert; fallback to plain text if also missing
        container.textContent = 'Result templates are missing.';
        return;
    }

    const { categories, targetAllocations, initialAllocations, achievedAllocations, investments } = result;

    let totalAdded = 0;
    let totalNewValue = 0;

    // Build table from template
    const tableFragment = tableTmpl.content.cloneNode(true);
    /** @type {HTMLTableElement|null} */
    const table = (tableFragment instanceof DocumentFragment)
        ? /** @type {HTMLTableElement} */ (tableFragment.querySelector('table'))
        : /** @type {HTMLTableElement} */ (tableFragment);

    const tbody = table?.querySelector('tbody');
    const tfoot = table?.querySelector('tfoot');

    if (!table || !tbody || !tfoot) {
        container.textContent = 'Invalid result table template.';
        return;
    }

    for (const category of categories) {
        const target = getAllocationPercentage(targetAllocations, category);
        const before = getAllocationPercentage(initialAllocations, category);
        const added = getInvestmentAmount(investments, category);
        const newValue = (Number(category?.currentValue) || 0);
        const achieved = getAllocationPercentage(achievedAllocations, category);

        totalAdded += added;
        totalNewValue += newValue;

        const rowFrag = rowTmpl.content.cloneNode(true);
        /** @type {HTMLTableRowElement|null} */
        const tr = /** @type {HTMLTableRowElement} */ (rowFrag.querySelector('tr'));
        if (!tr) continue;
        if (added > 0) tr.classList.add('font-weight-bold');

        const setText = (selector, text) => {
            const el = tr.querySelector(selector);
            if (el) el.textContent = text;
        };

        // Name and optional ISIN (ISIN shown below name, small and muted)
        {
            const nameEl = tr.querySelector('[data-field="name"]');
            if (nameEl) {
                const name = String(category?.name ?? '');
                const isinRaw = /** @type {string|undefined} */ (category?.isin);
                const isin = typeof isinRaw === 'string' ? isinRaw.trim() : '';
                if (isin) {
                    nameEl.innerHTML = `${escapeHtml(name)} <span class="small text-muted" style="font-weight: normal">${escapeHtml(isin)}</span>`;
                } else {
                    nameEl.textContent = name;
                }
            }
        }

        setText('[data-field="target"]', fmtPercent(target));
        setText('[data-field="before"]', fmtPercent(before));
        setText('[data-field="added"]', fmtValue(added));
        setText('[data-field="newValue"]', fmtValue(newValue));
        setText('[data-field="achieved"]', fmtPercent(achieved));

        tbody.appendChild(tr);
    }

    // Fill totals in tfoot
    const totalAddedCell = tfoot.querySelector('[data-total="added"]');
    const totalNewValueCell = tfoot.querySelector('[data-total="newValue"]');
    if (totalAddedCell) totalAddedCell.textContent = fmtValue(totalAdded);
    if (totalNewValueCell) totalNewValueCell.textContent = fmtValue(totalNewValue);

    // Replace container content
    container.innerHTML = '';
    container.appendChild(table);
}

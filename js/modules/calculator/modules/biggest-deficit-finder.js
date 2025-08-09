import { calculateAllocations } from "./allocations-calculator.js";

/**
 * @typedef {import('../../types.js').Category} Category
 */

/**
 * Find the category with the biggest deficit in percentage points.
 * Tie-breakers:
 * 1) Larger targetAllocation preferred
 * 2) Alphabetical by name
 *
 * @param {Category[]} categories
 * @return {Category|undefined}
 */
export function findBiggestDeficit(categories) {
    const cats = Array.isArray(categories) ? categories : [];
    if (cats.length === 0) return undefined;

    const allocations = calculateAllocations(cats);
    // Map category reference -> current percentage
    const percByCat = new Map(allocations.map((a) => [a.category, a.percentage]));

    /**
     * Coerce target to a safe number in [0, 100]
     */
    const safeTarget = (t) => {
        const n = Number(t);
        if (!Number.isFinite(n) || n < 0) return 0;
        if (n > 100) return 100; // clamp just in case
        return n;
    };

    let best = undefined;
    let bestDef = -Infinity; // deficit = target - current
    let bestTarget = -Infinity;

    for (const c of cats) {
        const current = Number(percByCat.get(c)) || 0;
        const target = safeTarget(c.targetAllocation);
        const deficit = target - current; // can be negative if over-allocated

        if (
            deficit > bestDef ||
            (deficit === bestDef && (target > bestTarget || (target === bestTarget && String(c.name).localeCompare(String(best?.name ?? "")) < 0)))
        ) {
            best = c;
            bestDef = deficit;
            bestTarget = target;
        }
    }

    return best;
}

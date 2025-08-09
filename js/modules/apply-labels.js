import { label } from "./labels.js";

export function applyLabels(root) {
    // set textContent for elements with data-label
    root.querySelectorAll('[data-label]').forEach((el) => {
        const key = el.getAttribute('data-label');
        el.textContent = label(key);
    });
    // set placeholder for elements with data-label-placeholder
    root.querySelectorAll('[data-label-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-label-placeholder');
        el.setAttribute('placeholder', label(key));
    });
    // set title for elements with data-label-title
    root.querySelectorAll('[data-label-title]').forEach((el) => {
        const key = el.getAttribute('data-label-title');
        el.setAttribute('title', label(key));
    });
}
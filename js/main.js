import './components/reb-language-select.js';

import initializeInputForm from "./modules/input-form.js";
import renderResult from "./modules/result-renderer.js";
import calculate from "./modules/calculator/index.js";
import { applyLabels } from "./modules/apply-labels.js";
import { label, setLanguage } from "./modules/labels.js";

/**
 * @typedef {import('./types.js').Category} Category
 * @typedef {import('./types.js').InputFormSubmitDetail} InputFormSubmitDetail
 */

// Apply labels to the main document and to all templates so their content is localized when cloned
applyLabels(document);

document.querySelectorAll('template').forEach((tpl) => {
    // tpl.content is a DocumentFragment
    applyLabels(tpl.content);
});

/** @type {(event: CustomEvent<InputFormSubmitDetail>) => void} */
const onInputFormValid = (event) => {
    const calculationResult = calculate(
        event.detail.amountToInvest,
        event.detail.roundInvestedAmount,
        event.detail.categories,
    );
    renderResult(calculationResult);
};

document.addEventListener('input-form:valid', onInputFormValid);
document.addEventListener('input-form:invalid', () => { renderResult({}) });
initializeInputForm();

const languageSelect = document.createElement('reb-language-select');
languageSelect.setAttribute('label', label('select_language'));
languageSelect.setAttribute('options', JSON.stringify([
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
]));
document.querySelector('[data-tools]').appendChild(languageSelect);
document.addEventListener('reb-langauge-select:change', (event) => {
    setLanguage(event.detail.value);
    applyLabels(document);
    languageSelect.setAttribute('label', label('select_language'));
    document.querySelectorAll('template').forEach((tpl) => {
        applyLabels(tpl.content);
    });
});
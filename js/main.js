import initializeInputForm from "./modules/input-form.js";
import renderResult from "./modules/result-renderer.js";
import calculate from "./modules/calculator/index.js";

/**
 * @typedef {import('./types.js').Category} Category
 * @typedef {import('./types.js').InputFormSubmitDetail} InputFormSubmitDetail
 */

initializeInputForm();

/** @type {(event: CustomEvent<InputFormSubmitDetail>) => void} */
const onInputFormSubmit = (event) => {
    const calculationResult = calculate(
        event.detail.amountToInvest,
        event.detail.roundInvestedAmount,
        event.detail.categories,
    );
    renderResult(calculationResult);
};

document.addEventListener('input-form:submit', onInputFormSubmit);

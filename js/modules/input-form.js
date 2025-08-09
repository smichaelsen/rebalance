let saveTimeout;

function initialize() {
    setupEventListeners();
    loadFormDataFromLocalStorage();
    updateTotalAllocation();
}

function setupEventListeners() {
    // Add category button
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);

    // Form submission
    document.getElementById('rebalancingForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = collectFormData();
        event.target.dispatchEvent(new CustomEvent('input-form:submit', { detail: formData, bubbles: true }));
    });

    // Listen for changes to update total allocation
    document.addEventListener('input', (event) => {
        if (event.target.classList.contains('category-target')) {
            updateTotalAllocation();
        }
    });

    // Delegate event for remove buttons and move buttons (including future ones)
    document.getElementById('categoriesContainer').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-category')) {
            removeCategory(event);
        } else if (event.target.classList.contains('move-up')) {
            moveUp(event);
        } else if (event.target.classList.contains('move-down')) {
            moveDown(event);
        }
    });

    // Listen for blur events on form inputs to save data to localStorage
    document.getElementById('rebalancingForm').addEventListener('focusout', (event) => {
        if (event.target.tagName === 'INPUT') {
            saveFormDataToLocalStorage();
        }
    });
}

function addCategory() {
    const container = document.getElementById('categoriesContainer');

    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item mb-3 p-3 border rounded';
    categoryItem.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-2">
                    <input type="text" class="form-control category-name" placeholder="Asset name .." required>
                </div>
                <div class="col-md-4 mb-2">
                    <input type="text" class="form-control category-isin" placeholder="ISIN (optional) ..">
                </div>
                <div class="col-md-2 mb-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary move-up" title="Move Up">↑</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary move-down" title="Move Down">↓</button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label">Target Allocation (%)</label>
                    <input type="number" class="form-control category-target" step="0.1" min="0" max="100" required>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label">Current Value</label>
                    <input type="number" class="form-control category-current" step="0.01" min="0" required value="0">
                </div>
                <div class="col-md-2 mb-2">
                    <button type="button" class="btn btn-sm btn-danger remove-category">Remove</button>
                </div>
            </div>
        `;

    container.appendChild(categoryItem);
    updateTotalAllocation();

    // focus on the new category name input
    const categoryNameInput = categoryItem.querySelector('.category-name');
    categoryNameInput.focus();
}

function removeCategory(event) {
    const categoryItem = event.target.closest('.category-item');
    const container = document.getElementById('categoriesContainer');

    // Don't remove if it's the last category
    if (container.querySelectorAll('.category-item').length > 1) {
        categoryItem.remove();
        updateTotalAllocation();

        // Save form data after removing a category
        saveFormDataToLocalStorage();
    } else {
        alert('You must have at least one category');
    }
}

function moveUp(event) {
    const categoryItem = event.target.closest('.category-item');
    const previousItem = categoryItem.previousElementSibling;

    if (previousItem) {
        // Swap with the previous item
        categoryItem.parentNode.insertBefore(categoryItem, previousItem);

        // Save the new order to localStorage
        saveFormDataToLocalStorage();
    }
}

function moveDown(event) {
    const categoryItem = event.target.closest('.category-item');
    const nextItem = categoryItem.nextElementSibling;

    if (nextItem) {
        // Swap with the next item
        categoryItem.parentNode.insertBefore(nextItem, categoryItem);

        // Save the new order to localStorage
        saveFormDataToLocalStorage();
    }
}

function updateTotalAllocation() {
    const targetInputs = document.querySelectorAll('.category-target');
    let total = 0;

    targetInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += value;
    });

    const totalElement = document.getElementById('totalAllocation');
    totalElement.textContent = total.toFixed(1);

    // Visual feedback
    if (Math.abs(total - 100) < 0.1) {
        totalElement.parentElement.classList.remove('alert-danger');
        totalElement.parentElement.classList.add('alert-success');
    } else {
        totalElement.parentElement.classList.remove('alert-success');
        totalElement.parentElement.classList.add('alert-danger');
    }

    // Save form data when total allocation is updated
    // We don't want to save on every input event, so we use a debounce
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveFormDataToLocalStorage();
    }, 500); // Wait 500 ms after the last update before saving
}

function collectFormData() {
    // Get amount to invest
    const amountToInvest = document.getElementById('amountToInvest').value;

    // Get round invested amount checkbox state
    const roundInvestedAmount = document.getElementById('roundInvestedAmount').checked;

    // Get categories data
    const categories = [];
    document.querySelectorAll('.category-item').forEach(item => {
        categories.push({
            name: item.querySelector('.category-name').value,
            targetAllocation: item.querySelector('.category-target').value,
            currentValue: item.querySelector('.category-current').value,
            isin: item.querySelector('.category-isin').value || null
        });
    });

    return {
        amountToInvest,
        roundInvestedAmount,
        categories
    };
}

function saveFormDataToLocalStorage() {
    const formData = collectFormData();
    localStorage.setItem('rebalancingFormData', JSON.stringify(formData));
}

function loadFormDataFromLocalStorage() {
    const savedData = localStorage.getItem('rebalancingFormData');
    if (!savedData) {
        return;
    }

    try {
        const formData = JSON.parse(savedData);

        // Set amount to invest
        if (formData.amountToInvest) {
            document.getElementById('amountToInvest').value = formData.amountToInvest;
        }

        // Set round invested amount checkbox
        if (formData.roundInvestedAmount !== undefined) {
            document.getElementById('roundInvestedAmount').checked = formData.roundInvestedAmount;
        }

        // Set categories data
        if (formData.categories && formData.categories.length > 0) {
            // Clear existing categories first
            const container = document.getElementById('categoriesContainer');
            container.innerHTML = '';

            // Add saved categories
            formData.categories.forEach(category => {
                addCategory();
                const categoryItems = container.querySelectorAll('.category-item');
                const lastCategory = categoryItems[categoryItems.length - 1];

                if (category.name) {
                    lastCategory.querySelector('.category-name').value = category.name;
                }
                if (category.targetAllocation) {
                    lastCategory.querySelector('.category-target').value = category.targetAllocation;
                }
                if (category.currentValue) {
                    lastCategory.querySelector('.category-current').value = category.currentValue;
                }
                if (category.isin) {
                    lastCategory.querySelector('.category-isin').value = category.isin;
                }
            });
        }
    } catch (error) {
        console.error('Error loading form data from localStorage:', error);
    }
}

export default initialize;
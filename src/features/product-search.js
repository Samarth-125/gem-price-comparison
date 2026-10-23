// The features namespace holds app behavior, rather than UI templates.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

// Connects the search box, autocomplete options, keyboard, and category filter.
window.GemApp.features.initProductSearch = function ({
    input,
    button,
    suggestions,
    categoryFilter,
    getProducts,
    onSelectProduct,
    onNoResults
}) {
const normalizeText = window.GemApp.utils.normalizeText;
const autocomplete = window.GemApp.components.autocomplete;
  // Store current dropdown options and selection state.
let matchingSuggestions = [];
let activeIndex = -1;
let selectedProductId = null;

  // Hide the dropdown and clear its keyboard highlight.
function hideSuggestions() {
    autocomplete.hide(suggestions, input);
    activeIndex = -1;
}

// Find products matching the input and selected category, then show up to 8.
function updateSuggestions() {
    const searchText = normalizeText(input.value);
    const filteredProducts = getProducts().filter((product) => {
        // If the search box is empty, show category matches only when a category
        // has been selected.
        if (!searchText) {
            return Boolean(categoryFilter.value);
        }
      // Search the product name, brand, and model as one lowercase string.
        const searchableText = normalizeText(
            `${product.name} ${product.brand || ""} ${product.model || ""}`
        );
        return searchableText.includes(searchText);
    });
    matchingSuggestions = filteredProducts.slice(0, 8);
    activeIndex = -1;
    // Render the options and update the input's accessibility state.
    autocomplete.render(suggestions, matchingSuggestions, selectProduct);
    input.setAttribute(
        "aria-expanded",
        String(matchingSuggestions.length > 0)
    );
    }

  // Select a suggestion and ask the renderer to show its comparison.
function selectProduct(product) {
    input.value = product.name;
    selectedProductId = product.productId;
    hideSuggestions();
    onSelectProduct(product.productId);
}
  // Search for the typed name when the button or Enter key is used.
function search() {
    // If a suggestion is already selected, use its product ID.
    if (selectedProductId) {
        onSelectProduct(selectedProductId);
        hideSuggestions();
        return;
    }
    const searchText = normalizeText(input.value);
    // Do nothing when the search box is empty.
    if (!searchText) {
        return;
    }

    // Compare lowercase text so capitalization does not affect matching.
    const product = getProducts().find((item) =>
        normalizeText(item.name).includes(searchText)
    );

    if (product) {
        selectedProductId = product.productId;
        onSelectProduct(product.productId);
        hideSuggestions();
    } else {
      // Ask the renderer to display the no-results state.
        onNoResults(input.value.trim(), categoryFilter.value);
        hideSuggestions();
    }
    }
  // Refresh suggestions whenever the user types or edits the search text.
    input.addEventListener("input", () => {
        selectedProductId = null;
        updateSuggestions();
    });

  // Support keyboard navigation and selection in the suggestion dropdown.
input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && !suggestions.hidden) {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, matchingSuggestions.length - 1);
        autocomplete.setActive(suggestions, activeIndex);
    }

    if (event.key === "ArrowUp" && !suggestions.hidden) {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        autocomplete.setActive(suggestions, activeIndex);
    }

    if (event.key === "Enter") {
        event.preventDefault();
      // Select the highlighted suggestion, or search the typed text.
        if (activeIndex >= 0 && matchingSuggestions[activeIndex]) {
            selectProduct(matchingSuggestions[activeIndex]);
        } else {
            search();
        }
    }

    // Escape closes the suggestions without selecting a product.
    if (event.key === "Escape") {
        hideSuggestions();
    }
    });

// Run a search when the Search button is clicked.
button.addEventListener("click", search);

  // Refresh suggestions when the user changes the category.
    categoryFilter.addEventListener("change", () => {
    selectedProductId = null;
    if (input.value.trim() || categoryFilter.value) {
        updateSuggestions();
    } else {
        hideSuggestions();
    }
    });

  // Close the dropdown when the user clicks outside the search area.
document.addEventListener("click", (event) => {
    if (
        !event.target.closest(".autocomplete") &&
        event.target !== button
    ) {
        hideSuggestions();
    }
    });

  // Give the renderer access to the current selection and a reset function.
return {
    // Returns the product ID currently selected from search.
    getSelectedProductId() {
        return selectedProductId;
    },

    // Clears the search field and closes the suggestions.
    clear() {
        input.value = "";
        selectedProductId = null;
        hideSuggestions();
    }
};
};
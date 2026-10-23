// Handles search input, autocomplete, keyboard selection, and category changes.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

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

  let matchingSuggestions = [];
  let activeIndex = -1;
  let selectedProductId = null;

  function hideSuggestions() {
    autocomplete.hide(suggestions, input);
    activeIndex = -1;
  }

  function updateSuggestions() {
    const searchText = normalizeText(input.value);
    const filteredProducts = getProducts().filter((product) => {
      if (!searchText) {
        return Boolean(categoryFilter.value);
      }

      const searchableText = normalizeText(
        `${product.name} ${product.brand || ""} ${product.model || ""}`
      );

      return searchableText.includes(searchText);
    });

    matchingSuggestions = filteredProducts.slice(0, 8);
    activeIndex = -1;

    autocomplete.render(suggestions, matchingSuggestions, selectProduct);
    input.setAttribute(
      "aria-expanded",
      String(matchingSuggestions.length > 0)
    );
  }

  function selectProduct(product) {
    input.value = product.name;
    selectedProductId = product.productId;
    hideSuggestions();
    onSelectProduct(product.productId);
  }

  function search() {
    if (selectedProductId) {
      onSelectProduct(selectedProductId);
      hideSuggestions();
      return;
    }

    const searchText = normalizeText(input.value);

    if (!searchText) {
      return;
    }

    const product = getProducts().find((item) =>
      normalizeText(item.name).includes(searchText)
    );

    if (product) {
      selectedProductId = product.productId;
      onSelectProduct(product.productId);
      hideSuggestions();
    } else {
      onNoResults(input.value.trim(), categoryFilter.value);
      hideSuggestions();
    }
  }

  input.addEventListener("input", () => {
    selectedProductId = null;
    updateSuggestions();
  });

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

      if (activeIndex >= 0 && matchingSuggestions[activeIndex]) {
        selectProduct(matchingSuggestions[activeIndex]);
      } else {
        search();
      }
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  button.addEventListener("click", search);

  categoryFilter.addEventListener("change", () => {
    selectedProductId = null;

    if (input.value.trim() || categoryFilter.value) {
      updateSuggestions();
    } else {
      hideSuggestions();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".autocomplete") &&
      event.target !== button
    ) {
      hideSuggestions();
    }
  });

  return {
    getSelectedProductId() {
      return selectedProductId;
    },

    clear() {
      input.value = "";
      selectedProductId = null;
      hideSuggestions();
    }
  };
};
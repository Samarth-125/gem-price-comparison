// Starts the renderer and connects the page controls to app features.
const productInput = document.getElementById("product-input");
const searchButton = document.getElementById("search-button");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");

const emptyState = window.GemApp.components.emptyState;
const categoryTools = window.GemApp.features.categoryFilter;
const productTools = window.GemApp.features;

let marketplaceCatalog = null;
let uniqueProducts = [];
let productSearch = null;

function showProductResults(productId) {
  results.innerHTML = productTools.renderProductComparison(
    marketplaceCatalog,
    productId,
    sortFilter.value
  );
}

async function startApp() {
  try {
    if (!window.marketplaceData?.getAll) {
      throw new Error("The marketplace data bridge is missing from preload.js.");
    }

    marketplaceCatalog = await window.marketplaceData.getAll();

    const validData = ["amazon", "flipkart", "jiomart"].every((name) =>
      Array.isArray(marketplaceCatalog[name])
    );

    if (!validData) {
      throw new Error("Each marketplace JSON file must contain a product array.");
    }

    uniqueProducts = categoryTools.getUniqueProducts(marketplaceCatalog);
    categoryTools.populate(categoryFilter, uniqueProducts);

    productSearch = productTools.initProductSearch({
      input: productInput,
      button: searchButton,
      suggestions,
      categoryFilter,
      getProducts() {
        return categoryTools.filter(uniqueProducts, categoryFilter.value);
      },
      onSelectProduct: showProductResults,
      onNoResults(searchText, category) {
        results.innerHTML = emptyState.noResults(searchText, category);
      }
    });

    sortFilter.addEventListener("change", () => {
      const selectedProductId = productSearch.getSelectedProductId();

      if (selectedProductId) {
        showProductResults(selectedProductId);
      }
    });

    results.addEventListener("click", (event) => {
      if (event.target.id !== "clear-search-button") {
        return;
      }

      productSearch.clear();
      categoryFilter.value = "";
      sortFilter.value = "default";
      results.innerHTML = emptyState.ready();
      productInput.focus();
    });

    results.innerHTML = emptyState.ready();
  } catch (error) {
    console.error("Marketplace data load error:", error);
    results.innerHTML = emptyState.message(
      "Product data could not be loaded. Check the three JSON files in data/ and the preload.js setup.",
      true
    );
  }
}

startApp();

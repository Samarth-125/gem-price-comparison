// Keep renderer variables inside a private scope so they don't clash
// with names exposed by preload.js or other script files.
(function () {
  // Get the page elements that this file needs to control.
  const productInput = document.getElementById("product-input");
  const searchButton = document.getElementById("search-button");
  const suggestions = document.getElementById("suggestions");
  const results = document.getElementById("results");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");

  // Get the UI components and features defined in the other src files.
  const emptyState = window.GemApp.components.emptyState;
  const categoryTools = window.GemApp.features.categoryFilter;
  const productTools = window.GemApp.features;

  // Store loaded products locally.
  // Do not name this "marketplaceData": preload already exposes that name.
  let marketplaceCatalog = null;
  let uniqueProducts = [];
  let productSearch = null;

  // Display the selected product's marketplace prices.
  function showProductResults(productId) {
    results.innerHTML = productTools.renderProductComparison(
      marketplaceCatalog,
      productId,
      sortFilter.value
    );
  }

  // Load product data and connect the search, filter, and sort controls.
  async function startApp() {
    try {
      // This function is exposed to the page by preload.js.
      if (!window.marketplaceData?.getAll) {
        throw new Error(
          "The marketplace data bridge is missing from preload.js."
        );
      }

      // Read Amazon, Flipkart, and JioMart products through the preload bridge.
      marketplaceCatalog = await window.marketplaceData.getAll();

      // Confirm that each marketplace returned a product array.
      const validData = ["amazon", "flipkart", "jiomart"].every((name) =>
        Array.isArray(marketplaceCatalog[name])
      );

      if (!validData) {
        throw new Error(
          "Each marketplace JSON file must contain a product array."
        );
      }

      // Create one list of unique products and fill the category dropdown.
      uniqueProducts =
        categoryTools.getUniqueProducts(marketplaceCatalog);

      categoryTools.populate(categoryFilter, uniqueProducts);

      // Connect autocomplete, search, and category filtering.
      productSearch = productTools.initProductSearch({
        input: productInput,
        button: searchButton,
        suggestions,
        categoryFilter,

        // Return products that match the currently selected category.
        getProducts() {
          return categoryTools.filter(
            uniqueProducts,
            categoryFilter.value
          );
        },

        // Show the marketplace price comparison for the chosen product.
        onSelectProduct: showProductResults,

        // Show a helpful message when search finds no matching product.
        onNoResults(searchText, category) {
          results.innerHTML = emptyState.noResults(searchText, category);
        }
      });

      // Refresh the displayed cards when the sort order changes.
      sortFilter.addEventListener("change", () => {
        const selectedProductId =
          productSearch.getSelectedProductId();

        if (selectedProductId) {
          showProductResults(selectedProductId);
        }
      });

      // Reset the search and filters when the no-results button is clicked.
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

      // Show the initial message after setup is complete.
      results.innerHTML = emptyState.ready();
    } catch (error) {
      // Log details in DevTools and show a readable message in the app.
      console.error("Marketplace data load error:", error);

      results.innerHTML = emptyState.message(
        "Product data could not be loaded. Check the three JSON files in data/ and the preload.js setup.",
        true
      );
    }
  }

  // Start the app after this renderer file has loaded.
  startApp();
})();
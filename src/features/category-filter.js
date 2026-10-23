// The features namespace holds app behavior, rather than UI templates.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

// Functions for combining products and using the category dropdown.
window.GemApp.features.categoryFilter = {
  // Combines products from all marketplaces and removes duplicate product IDs.
  getUniqueProducts(data) {
    const allProducts = [
      ...data.amazon,
      ...data.flipkart,
      ...data.jiomart
    ];

    const uniqueProducts = new Map();

    allProducts.forEach((product) => {
      // Keep the first listing found for each product ID.
      if (!uniqueProducts.has(product.productId)) {
        uniqueProducts.set(product.productId, product);
      }
    });

    return [...uniqueProducts.values()];
  },

  // Fills the category dropdown with categories from the product data.
  populate(select, products) {
    const categories = [
      ...new Set(products.map((product) => product.category).filter(Boolean))
    ].sort();

    // Clear existing options before adding the current categories.
    select.replaceChildren();

    // Add the option that displays products from every category.
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All categories";
    select.append(allOption);

    // Add one dropdown option for each category.
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.append(option);
    });
  },

  // Returns products in the selected category, or all products if none is selected.
  filter(products, selectedCategory) {
    return products.filter((product) => {
      return !selectedCategory || product.category === selectedCategory;
    });
  }
};
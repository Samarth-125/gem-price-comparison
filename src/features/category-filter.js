// Fills the category dropdown and filters the unique product list.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

window.GemApp.features.categoryFilter = {
  getUniqueProducts(data) {
    const allProducts = [
      ...data.amazon,
      ...data.flipkart,
      ...data.jiomart
    ];

    const uniqueProducts = new Map();

    allProducts.forEach((product) => {
      if (!uniqueProducts.has(product.productId)) {
        uniqueProducts.set(product.productId, product);
      }
    });

    return [...uniqueProducts.values()];
  },

  populate(select, products) {
    const categories = [
      ...new Set(products.map((product) => product.category).filter(Boolean))
    ].sort();

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All categories";
    select.append(allOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.append(option);
    });
  },

  filter(products, selectedCategory) {
    return products.filter((product) => {
      return !selectedCategory || product.category === selectedCategory;
    });
  }
};
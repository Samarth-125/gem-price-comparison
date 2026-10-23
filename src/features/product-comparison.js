// Builds the comparison result for a selected product.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

window.GemApp.features.renderProductComparison = function (
  data,
  productId,
  sortOrder
) {
  const { escapeHtml, formatPrice, isAvailable } = window.GemApp.utils;
  const emptyState = window.GemApp.components.emptyState;

  const marketplaces = [
    { name: "Amazon", products: data.amazon },
    { name: "Flipkart", products: data.flipkart },
    { name: "JioMart", products: data.jiomart }
  ];

  let listings = marketplaces
    .map((marketplace) => {
      const product = marketplace.products.find(
        (item) => item.productId === productId
      );

      return product ? { marketplace: marketplace.name, ...product } : null;
    })
    .filter(Boolean);

  if (listings.length === 0) {
    return emptyState.message("No marketplace listings were found for this product.");
  }

  const availableListings = listings.filter(isAvailable);

  if (availableListings.length === 0) {
    return emptyState.message("This product has no in-stock marketplace listings.");
  }

  const lowestPrice = Math.min(
    ...availableListings.map((product) => product.price)
  );

  const lowestListing = availableListings.find(
    (product) => product.price === lowestPrice
  );

  const mainProduct = listings[0];

  listings = window.GemApp.features.priceSort(listings, sortOrder);

  const cards = listings
    .map((product) =>
      window.GemApp.components.priceCard(product, lowestPrice)
    )
    .join("");

  return `
    <div class="result-header">
      <div>
        <h2 class="result-heading">${escapeHtml(mainProduct.name)}</h2>
        <p class="result-details">
          Brand: ${escapeHtml(mainProduct.brand || "—")} ·
          Model: ${escapeHtml(mainProduct.model || "—")} ·
          Category: ${escapeHtml(mainProduct.category || "—")}
        </p>
      </div>
      <span class="result-label">DEMO PRICES</span>
    </div>

    <div class="lowest-summary">
      <span class="lowest-summary-label">
        Lowest price · ${escapeHtml(lowestListing.marketplace)}
      </span>
      <span class="lowest-summary-value">
        ${escapeHtml(formatPrice(lowestListing))}
      </span>
    </div>

    <div class="price-list">${cards}</div>
  `;
};
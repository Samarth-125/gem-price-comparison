// The features namespace holds app behavior, rather than UI templates.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

// Finds a product's marketplace listings and creates the comparison results.
window.GemApp.features.renderProductComparison = function (
  data,
  productId,
  sortOrder
) {
  const { escapeHtml, formatPrice, isAvailable } = window.GemApp.utils;
  const emptyState = window.GemApp.components.emptyState;

  // Pair each marketplace name with its product list.
  const marketplaces = [
    { name: "Amazon", products: data.amazon },
    { name: "Flipkart", products: data.flipkart },
    { name: "JioMart", products: data.jiomart }
  ];

  // Find this product ID in each marketplace's data.
  let listings = marketplaces
    .map((marketplace) => {
      const product = marketplace.products.find(
        (item) => item.productId === productId
      );

      // Add the marketplace name to the listing for display.
      return product ? { marketplace: marketplace.name, ...product } : null;
    })
    .filter(Boolean);

  // Show a message if none of the marketplaces has this product.
  if (listings.length === 0) {
    return emptyState.message(
      "No marketplace listings were found for this product."
    );
  }

  // Keep only listings that are in stock and have a valid price.
  const availableListings = listings.filter(isAvailable);

  // Show a message if every listing is unavailable.
  if (availableListings.length === 0) {
    return emptyState.message(
      "This product has no in-stock marketplace listings."
    );
  }

  // Find the lowest valid price and its marketplace.
  const lowestPrice = Math.min(
    ...availableListings.map((product) => product.price)
  );

  const lowestListing = availableListings.find(
    (product) => product.price === lowestPrice
  );

  // Keep the first listing's product details for the results heading.
  const mainProduct = listings[0];

  // Apply the selected sort order to the marketplace cards.
  listings = window.GemApp.features.priceSort(listings, sortOrder);

  // Create one price card for each marketplace listing.
  const cards = listings
    .map((product) =>
      window.GemApp.components.priceCard(product, lowestPrice)
    )
    .join("");

  // Return the full comparison section.
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
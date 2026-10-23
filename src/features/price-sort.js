// The features namespace holds app behavior, rather than UI templates.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

// Sorts marketplace listings according to the selected price order.
window.GemApp.features.priceSort = function (listings, sortOrder) {
  // Keep the original marketplace order when Default order is selected.
  if (sortOrder === "default") {
    return listings;
  }

  // Sort a copy so the original product data is not changed.
  return [...listings].sort((a, b) => {
    const aAvailable = window.GemApp.utils.isAvailable(a);
    const bAvailable = window.GemApp.utils.isAvailable(b);

    // Put available prices before out-of-stock or invalid listings.
    if (aAvailable !== bAvailable) {
      return aAvailable ? -1 : 1;
    }

    // Keep unavailable listings together at the end.
    if (!aAvailable) {
      return 0;
    }

    // Sort valid prices from low to high or high to low.
    return sortOrder === "low-to-high"
      ? a.price - b.price
      : b.price - a.price;
  });
};
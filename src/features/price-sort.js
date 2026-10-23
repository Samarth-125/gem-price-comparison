// Sorts available marketplace prices and keeps unavailable listings last.
window.GemApp = window.GemApp || {};
window.GemApp.features = window.GemApp.features || {};

window.GemApp.features.priceSort = function (listings, sortOrder) {
  if (sortOrder === "default") {
    return listings;
  }

  return [...listings].sort((a, b) => {
    const aAvailable = window.GemApp.utils.isAvailable(a);
    const bAvailable = window.GemApp.utils.isAvailable(b);

    if (aAvailable !== bAvailable) {
      return aAvailable ? -1 : 1;
    }

    if (!aAvailable) {
      return 0;
    }

    return sortOrder === "low-to-high"
      ? a.price - b.price
      : b.price - a.price;
  });
};
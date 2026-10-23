// The utils namespace holds small helper functions used by multiple files.
window.GemApp = window.GemApp || {};
window.GemApp.utils = window.GemApp.utils || {};

// Formats a product price using Indian currency formatting.
window.GemApp.utils.formatPrice = function (product) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.currency || "INR",
    maximumFractionDigits: 0
  }).format(product.price);
};

// Returns true only for an in-stock product with a valid numeric price.
window.GemApp.utils.isAvailable = function (product) {
  return (
    product.inStock === true &&
    typeof product.price === "number" &&
    Number.isFinite(product.price)
  );
};
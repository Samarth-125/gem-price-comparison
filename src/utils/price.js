// Shared price helpers.
window.GemApp = window.GemApp || {};
window.GemApp.utils = window.GemApp.utils || {};

window.GemApp.utils.formatPrice = function (product) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.currency || "INR",
    maximumFractionDigits: 0
  }).format(product.price);
};

window.GemApp.utils.isAvailable = function (product) {
  return (
    product.inStock === true &&
    typeof product.price === "number" &&
    Number.isFinite(product.price)
  );
};
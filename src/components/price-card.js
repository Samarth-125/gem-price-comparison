// Creates the price card for one marketplace listing.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

window.GemApp.components.priceCard = function (product, lowestPrice) {
  const { escapeHtml } = window.GemApp.utils;
  const available = window.GemApp.utils.isAvailable(product);

  const priceText = available
    ? window.GemApp.utils.formatPrice(product)
    : "Out of stock";

  let comparison = "Price unavailable";

  if (available && product.price === lowestPrice) {
    comparison = "Lowest listed price";
  } else if (available) {
    comparison = `${window.GemApp.utils.formatPrice({
      price: product.price - lowestPrice,
      currency: product.currency || "INR"
    })} above the lowest price`;
  }

  let link = "";

  if (product.productUrl) {
    try {
      const url = new URL(product.productUrl);

      if (url.protocol === "https:" || url.protocol === "http:") {
        link = `
          <a href="${escapeHtml(url.href)}"
             target="_blank"
             rel="noreferrer">
            View marketplace listing
          </a>
        `;
      }
    } catch (error) {
      console.warn("Invalid product URL:", product.productUrl);
    }
  }

  const lowestClass =
    available && product.price === lowestPrice ? "lowest" : "";

  return `
    <article class="price-card ${lowestClass}">
      <div>
        <div class="marketplace">${escapeHtml(product.marketplace)}</div>
        <div class="comparison">${escapeHtml(comparison)}</div>
        ${link}
      </div>
      <div class="price">${escapeHtml(priceText)}</div>
    </article>
  `;
};
// The components namespace holds UI pieces shared by the app.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

// Builds the card showing one marketplace's price and product link.
window.GemApp.components.priceCard = function (product, lowestPrice) {
  const { escapeHtml } = window.GemApp.utils;

  // Check whether the listing is in stock and has a valid price.
  const available = window.GemApp.utils.isAvailable(product);

  // Show the formatted price or an out-of-stock message.
  const priceText = available
    ? window.GemApp.utils.formatPrice(product)
    : "Out of stock";

  // Describe this marketplace price compared with the lowest price.
  let comparison = "Price unavailable";

  if (available && product.price === lowestPrice) {
    comparison = "Lowest listed price";
  } else if (available) {
    comparison = `${window.GemApp.utils.formatPrice({
      price: product.price - lowestPrice,
      currency: product.currency || "INR"
    })} above the lowest price`;
  }

  // Add a link only when the product URL is a valid web address.
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
      // Keep the card visible even if the product URL is invalid.
      console.warn("Invalid product URL:", product.productUrl);
    }
  }

  // Add a CSS class when this listing has the lowest price.
  const lowestClass =
    available && product.price === lowestPrice ? "lowest" : "";

  // Return the card markup for the comparison results.
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
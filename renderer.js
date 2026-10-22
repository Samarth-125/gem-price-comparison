const productInput = document.getElementById("product-input");
const searchButton = document.getElementById("search-button");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");
const categoryFilter = document.getElementById("category-filter");

let loadedMarketplaceData = null;
let matchingSuggestions = [];
let activeSuggestionIndex = -1;
let selectedProductId = null;

function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return replacements[character];
  });
}

function formatPrice(product) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.currency || "INR",
    maximumFractionDigits: 0
  }).format(product.price);
}

function showMessage(message, isError = false) {
  results.innerHTML = `
    <p class="message ${isError ? "error" : ""}">${escapeHtml(message)}</p>
  `;
}

function getUniqueProducts() {
  if (!loadedMarketplaceData) {
    return [];
  }

  const allProducts = [
    ...loadedMarketplaceData.amazon,
    ...loadedMarketplaceData.flipkart,
    ...loadedMarketplaceData.jiomart
  ];

  const uniqueProducts = new Map();

  allProducts.forEach((product) => {
    if (!uniqueProducts.has(product.productId)) {
      uniqueProducts.set(product.productId, product);
    }
  });

  return [...uniqueProducts.values()];
}

function getFilteredProducts() {
  const selectedCategory = categoryFilter.value;

  return getUniqueProducts().filter((product) => {
    return !selectedCategory || product.category === selectedCategory;
  });
}

function hideSuggestions() {
  suggestions.hidden = true;
  productInput.setAttribute("aria-expanded", "false");
  activeSuggestionIndex = -1;
}

function selectSuggestion(product) {
  productInput.value = product.name;
  selectedProductId = product.productId;
  hideSuggestions();
  showProductResults(product.productId);
}

function updateActiveSuggestion() {
  const options = suggestions.querySelectorAll(".suggestion-option");

  options.forEach((option, index) => {
    const isActive = index === activeSuggestionIndex;

    option.classList.toggle("active", isActive);
    option.setAttribute("aria-selected", String(isActive));
  });

  if (activeSuggestionIndex >= 0 && options[activeSuggestionIndex]) {
    options[activeSuggestionIndex].scrollIntoView({ block: "nearest" });
  }
}

function showSuggestions() {
  if (!loadedMarketplaceData) {
    hideSuggestions();
    return;
  }

  const searchText = normalizeText(productInput.value);
  const selectedCategory = categoryFilter.value;

  if (!searchText && !selectedCategory) {
    hideSuggestions();
    return;
  }

  matchingSuggestions = getFilteredProducts()
    .filter((product) => {
      if (!searchText) {
        return true;
      }

      const searchableText = normalizeText(
        `${product.name} ${product.brand || ""} ${product.model || ""}`
      );

      return searchableText.includes(searchText);
    })
    .slice(0, 8);

  suggestions.replaceChildren();
  activeSuggestionIndex = -1;

  if (matchingSuggestions.length === 0) {
    hideSuggestions();
    return;
  }

  matchingSuggestions.forEach((product, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "suggestion-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");

    const name = document.createElement("span");
    name.className = "suggestion-name";
    name.textContent = product.name;

    const details = document.createElement("span");
    details.className = "suggestion-details";
    details.textContent =
      `${product.brand || "Brand not listed"} · ${product.model || "Model not listed"}`;

    option.append(name, details);

    option.addEventListener("click", () => {
      selectSuggestion(matchingSuggestions[index]);
    });

    suggestions.append(option);
  });

  suggestions.hidden = false;
  productInput.setAttribute("aria-expanded", "true");
}

function loadCategories() {
  const categories = [
    ...new Set(
      getUniqueProducts()
        .map((product) => product.category)
        .filter(Boolean)
    )
  ].sort();

  categoryFilter.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  categoryFilter.append(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

async function loadMarketplaceData() {
  try {
    if (!window.marketplaceData?.getAll) {
      throw new Error("marketplaceData.getAll() is not available in preload.js.");
    }

    loadedMarketplaceData = await window.marketplaceData.getAll();

    const requiredMarketplaces = ["amazon", "flipkart", "jiomart"];
    const hasValidData = requiredMarketplaces.every((marketplace) =>
      Array.isArray(loadedMarketplaceData[marketplace])
    );

    if (!hasValidData) {
      throw new Error("Amazon, Flipkart, and JioMart data must each be a JSON array.");
    }

    loadCategories();

    results.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">⌕</div>
        <h2>Ready when you are</h2>
        <p>Search for a product to see its marketplace prices.</p>
      </div>
    `;
  } catch (error) {
    console.error("Marketplace data load error:", error);
    showMessage(
      "Product data could not be loaded. Check the three JSON files in the data folder and the preload.js setup.",
      true
    );
  }
}

function showProductResults(productId) {
  if (!loadedMarketplaceData) {
    showMessage("Product data is still loading. Please try again shortly.");
    return;
  }

  const marketplaces = [
    { name: "Amazon", products: loadedMarketplaceData.amazon },
    { name: "Flipkart", products: loadedMarketplaceData.flipkart },
    { name: "JioMart", products: loadedMarketplaceData.jiomart }
  ];

  const listings = marketplaces
    .map((marketplace) => {
      const product = marketplace.products.find(
        (item) => item.productId === productId
      );

      return product ? { marketplace: marketplace.name, ...product } : null;
    })
    .filter(Boolean);

  if (listings.length === 0) {
    showMessage("No marketplace listings were found for this product.");
    return;
  }

  const availableListings = listings.filter(
    (product) =>
      product.inStock === true &&
      typeof product.price === "number" &&
      Number.isFinite(product.price)
  );

  if (availableListings.length === 0) {
    showMessage("This product has no in-stock marketplace listings.");
    return;
  }

  const lowestPrice = Math.min(
    ...availableListings.map((product) => product.price)
  );

  const lowestListing = availableListings.find(
    (product) => product.price === lowestPrice
  );

  const mainProduct = listings[0];

  const cards = listings
    .map((product) => {
      const isAvailable =
        product.inStock === true &&
        typeof product.price === "number" &&
        Number.isFinite(product.price);

      const priceText = isAvailable ? formatPrice(product) : "Out of stock";

      let comparison = "Price unavailable";

      if (isAvailable && product.price === lowestPrice) {
        comparison = "Lowest listed price";
      } else if (isAvailable) {
        const difference = product.price - lowestPrice;
        comparison = `${formatPrice({
          price: difference,
          currency: product.currency || "INR"
        })} above the lowest price`;
      }

      let link = "";

      if (product.productUrl) {
        try {
          const url = new URL(product.productUrl);

          if (url.protocol === "https:" || url.protocol === "http:") {
            link = `<a href="${escapeHtml(url.href)}" target="_blank" rel="noreferrer">View marketplace listing</a>`;
          }
        } catch (error) {
          console.warn("Invalid product URL:", product.productUrl);
        }
      }

      const lowestClass =
        isAvailable && product.price === lowestPrice ? "lowest" : "";

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
    })
    .join("");

  results.innerHTML = `
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
}

function searchProducts() {
  if (!loadedMarketplaceData) {
    showMessage("Product data is still loading. Please try again shortly.");
    return;
  }

  if (selectedProductId) {
    showProductResults(selectedProductId);
    hideSuggestions();
    return;
  }

  const searchText = normalizeText(productInput.value);

  if (!searchText) {
    showMessage("Enter a product name to search.");
    return;
  }

  const matchingProduct = getFilteredProducts().find((product) =>
    normalizeText(product.name).includes(searchText)
  );

  if (!matchingProduct) {
    showMessage(`No product found for "${productInput.value.trim()}".`);
    hideSuggestions();
    return;
  }

  showProductResults(matchingProduct.productId);
  hideSuggestions();
}

productInput.addEventListener("input", () => {
  selectedProductId = null;
  showSuggestions();
});

productInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" && !suggestions.hidden) {
    event.preventDefault();
    activeSuggestionIndex = Math.min(
      activeSuggestionIndex + 1,
      matchingSuggestions.length - 1
    );
    updateActiveSuggestion();
  }

  if (event.key === "ArrowUp" && !suggestions.hidden) {
    event.preventDefault();
    activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
    updateActiveSuggestion();
  }

  if (event.key === "Enter") {
    event.preventDefault();

    if (
      !suggestions.hidden &&
      activeSuggestionIndex >= 0 &&
      matchingSuggestions[activeSuggestionIndex]
    ) {
      selectSuggestion(matchingSuggestions[activeSuggestionIndex]);
    } else {
      searchProducts();
    }
  }

  if (event.key === "Escape") {
    hideSuggestions();
  }
});

searchButton.addEventListener("click", searchProducts);

categoryFilter.addEventListener("change", () => {
  selectedProductId = null;

  if (productInput.value.trim() || categoryFilter.value) {
    showSuggestions();
  } else {
    hideSuggestions();
  }
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".autocomplete") &&
    event.target !== searchButton
  ) {
    hideSuggestions();
  }
});

loadMarketplaceData();
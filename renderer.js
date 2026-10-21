const productInput = document.getElementById("product-input");
const searchButton = document.getElementById("search-button");
const suggestions = document.getElementById("suggestions");
const results = document.getElementById("results");

let loadedMarketplaceData = null;
let matchingSuggestions = [];
let activeSuggestionIndex = -1;
let selectedProductId = null;

function normalizeText(text) {
  return text
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

function showMessage(message) {
  results.textContent = message;
}

function getUniqueProducts() {
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

  if (!searchText) {
    hideSuggestions();
    return;
  }

  matchingSuggestions = getUniqueProducts()
    .filter((product) => {
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
      `${product.brand || "Brand unknown"} · ${product.model || "Model unknown"}`;

    option.append(name, details);

    option.addEventListener("click", () => {
      selectSuggestion(matchingSuggestions[index]);
    });

    suggestions.append(option);
  });

  suggestions.hidden = false;
  productInput.setAttribute("aria-expanded", "true");
}

async function loadMarketplaceData() {
  try {
    loadedMarketplaceData = await window.marketplaceData.getAll();

    const files = Object.values(loadedMarketplaceData);
    const allFilesAreArrays = files.every(Array.isArray);

    if (!allFilesAreArrays) {
      throw new Error("Each JSON file must contain an array of products.");
    }

    showMessage("Product ka naam likhna shuru karein.");
  } catch (error) {
    console.error("Marketplace data load error:", error);
    showMessage(
      "Data load nahi hua. Check karein ki data folder mein teen valid JSON files hain."
    );
  }
}

function showProductResults(productId) {
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
    showMessage("Is product ki marketplace listing nahi mili.");
    return;
  }

  const mainProduct = listings[0];

  const availableListings = listings.filter(
    (product) =>
      product.inStock === true &&
      typeof product.price === "number" &&
      Number.isFinite(product.price)
  );

  if (availableListings.length === 0) {
    showMessage("Is product ki koi in-stock listing nahi mili.");
    return;
  }

  const lowestPrice = Math.min(
    ...availableListings.map((product) => product.price)
  );

  const cards = listings
    .map((product) => {
      const isAvailable =
        product.inStock === true &&
        typeof product.price === "number" &&
        Number.isFinite(product.price);

      const priceText = isAvailable ? formatPrice(product) : "Out of stock";

      let comparison = "Price available nahi hai";

      if (isAvailable && product.price === lowestPrice) {
        comparison = "Lowest listed price";
      } else if (isAvailable) {
        comparison = `${formatPrice({
          price: product.price - lowestPrice,
          currency: product.currency
        })} lowest price se zyada`;
      }

      const link = product.productUrl
        ? `<a href="${escapeHtml(product.productUrl)}" target="_blank" rel="noreferrer">Marketplace par dekhein</a>`
        : "";

      const lowestClass =
        isAvailable && product.price === lowestPrice ? "lowest" : "";

      return `
        <article class="price-card ${lowestClass}">
          <div>
            <div class="marketplace">${escapeHtml(product.marketplace)}</div>
            <div class="comparison">${comparison}</div>
            ${link}
          </div>
          <div class="price">${priceText}</div>
        </article>
      `;
    })
    .join("");

  results.innerHTML = `
    <h2 class="result-heading">${escapeHtml(mainProduct.name)}</h2>
    <p class="result-note">
      Brand: ${escapeHtml(mainProduct.brand || "—")} ·
      Model: ${escapeHtml(mainProduct.model || "—")} ·
      Category: ${escapeHtml(mainProduct.category || "—")}
    </p>
    <p class="result-note">Demo data — live prices nahi hain.</p>
    <div class="price-list">${cards}</div>
  `;
}

function searchProducts() {
  if (!loadedMarketplaceData) {
    showMessage("Product data abhi load ho raha hai. Thodi der baad try karein.");
    return;
  }

  if (selectedProductId) {
    showProductResults(selectedProductId);
    hideSuggestions();
    return;
  }

  const searchText = normalizeText(productInput.value);

  if (!searchText) {
    showMessage("Pehle product ka naam likhein.");
    return;
  }

  const matchingProduct = getUniqueProducts().find((product) =>
    normalizeText(product.name).includes(searchText)
  );

  if (!matchingProduct) {
    showMessage(`"${productInput.value.trim()}" ke liye product nahi mila.`);
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

document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".autocomplete") &&
    event.target !== searchButton
  ) {
    hideSuggestions();
  }
});

loadMarketplaceData();
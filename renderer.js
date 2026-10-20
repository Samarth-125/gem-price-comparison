const productInput = document.getElementById("product-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");

let loadedMarketplaceData = null;

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

async function loadMarketplaceData() {
  try {
    loadedMarketplaceData = await window.marketplaceData.getAll();

    const files = Object.values(loadedMarketplaceData);
    const allFilesAreArrays = files.every(Array.isArray);

    if (!allFilesAreArrays) {
      throw new Error("JSON files must each contain an array of products.");
    }

    showMessage("Product ka naam likh kar Search dabayein.");
  } catch (error) {
    console.error("Marketplace data load error:", error);
    showMessage(
      "Data load nahi hua. Check karein ki data folder mein teen valid JSON files hain."
    );
  }
}

function searchProducts() {
  if (!loadedMarketplaceData) {
    showMessage("Product data abhi load ho raha hai. Thodi der baad try karein.");
    return;
  }

  const searchText = productInput.value.trim().toLowerCase();

  if (!searchText) {
    showMessage("Pehle product ka naam likhein.");
    return;
  }

  const allProducts = [
    ...loadedMarketplaceData.amazon,
    ...loadedMarketplaceData.flipkart,
    ...loadedMarketplaceData.jiomart
  ];

  const matchingProduct = allProducts.find((product) =>
    product.name.toLowerCase().includes(searchText)
  );

  if (!matchingProduct) {
    showMessage(`"${searchText}" ke liye product nahi mila.`);
    return;
  }

  const productId = matchingProduct.productId;

  const marketplaces = [
    { marketplace: "Amazon", products: loadedMarketplaceData.amazon },
    { marketplace: "Flipkart", products: loadedMarketplaceData.flipkart },
    { marketplace: "JioMart", products: loadedMarketplaceData.jiomart }
  ];

  const listings = marketplaces
    .map((marketplace) => {
      const product = marketplace.products.find(
        (item) => item.productId === productId
      );

      if (!product) {
        return null;
      }

      return {
        marketplace: marketplace.marketplace,
        ...product
      };
    })
    .filter(Boolean);

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

      const priceText = isAvailable
        ? formatPrice(product)
        : "Out of stock";

      let comparison = "Price available nahi hai";

      if (isAvailable && product.price === lowestPrice) {
        comparison = "Lowest listed price";
      } else if (isAvailable) {
        const difference = product.price - lowestPrice;

        comparison = `${formatPrice({
          price: difference,
          currency: product.currency
        })} lowest price se zyada`;
      }

      const link = product.productUrl
        ? `<a href="${product.productUrl}" target="_blank" rel="noreferrer">Marketplace par dekhein</a>`
        : "";

      const lowestClass =
        isAvailable && product.price === lowestPrice ? "lowest" : "";

      return `
        <article class="price-card ${lowestClass}">
          <div>
            <div class="marketplace">${product.marketplace}</div>
            <div class="comparison">${comparison}</div>
            ${link}
          </div>
          <div class="price">${priceText}</div>
        </article>
      `;
    })
    .join("");

  results.innerHTML = `
    <h2 class="result-heading">${matchingProduct.name}</h2>
    <p class="result-note">
      Brand: ${matchingProduct.brand} ·
      Model: ${matchingProduct.model} ·
      Category: ${matchingProduct.category}
    </p>
    <p class="result-note">Demo data — live prices nahi hain.</p>
    <div class="price-list">${cards}</div>
  `;
}

searchButton.addEventListener("click", searchProducts);

productInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchProducts();
  }
});

loadMarketplaceData();
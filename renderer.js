const products = [
  {
    name: "office chair",
    prices: [
      { marketplace: "GeM", price: 5200 },
      { marketplace: "Amazon", price: 5499 },
      { marketplace: "Flipkart", price: 4999 },
      { marketplace: "JioMart", price: 5350 }
    ]
  },
  {
    name: "wireless mouse",
    prices: [
      { marketplace: "GeM", price: 850 },
      { marketplace: "Amazon", price: 799 },
      { marketplace: "Flipkart", price: 899 },
      { marketplace: "JioMart", price: 825 }
    ]
  },
  {
    name: "keyboard",
    prices: [
      { marketplace: "GeM", price: 1200 },
      { marketplace: "Amazon", price: 1149 },
      { marketplace: "Flipkart", price: 1299 },
      { marketplace: "JioMart", price: 1180 }
    ]
  }
];

const productInput = document.getElementById("product-input");
const searchButton = document.getElementById("search-button");
const results = document.getElementById("results");

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function showResults() {
  const searchText = productInput.value.trim().toLowerCase();

  if (searchText === "") {
    results.innerHTML = '<p class="empty-message">Pehle product ka naam likhein.</p>';
    return;
  }

  const product = products.find((item) => item.name.includes(searchText));

  if (!product) {
    results.innerHTML = `
      <p class="no-result">
        "${searchText}" ke liye demo list mein product nahi mila. "office chair",
        "wireless mouse", ya "keyboard" try karein.
      </p>
    `;
    return;
  }

  const gemPrice = product.prices.find((item) => item.marketplace === "GeM").price;
  const lowestPrice = Math.min(...product.prices.map((item) => item.price));

  const priceCards = product.prices
    .map((item) => {
      let comparison = "GeM reference price";

      if (item.marketplace !== "GeM") {
        const difference = item.price - gemPrice;

        if (difference > 0) {
          comparison = `${formatPrice(difference)} GeM se zyada`;
        } else if (difference < 0) {
          comparison = `${formatPrice(Math.abs(difference))} GeM se kam`;
        } else {
          comparison = "GeM ke barabar";
        }
      }

      const lowestClass = item.price === lowestPrice ? "lowest" : "";

      return `
        <article class="price-card ${lowestClass}">
          <div>
            <div class="marketplace">${item.marketplace}</div>
            <div class="comparison">${comparison}</div>
          </div>
          <div class="price">
            ${formatPrice(item.price)}
            ${item.price === lowestPrice ? " · Lowest" : ""}
          </div>
        </article>
      `;
    })
    .join("");

  results.innerHTML = `
    <h2 class="result-heading">${product.name}</h2>
    <p class="result-note">Neeche diye gaye saare prices demo data hain.</p>
    <div class="price-list">${priceCards}</div>
  `;
}

searchButton.addEventListener("click", showResults);

productInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    showResults();
  }
});
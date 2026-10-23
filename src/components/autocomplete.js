// Builds and updates the autocomplete suggestion list.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

window.GemApp.components.autocomplete = {
  render(container, products, onSelect) {
    container.replaceChildren();

    products.forEach((product) => {
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
        `${product.brand || "Brand not listed"} · ` +
        `${product.model || "Model not listed"}`;

      option.append(name, details);
      option.addEventListener("click", () => onSelect(product));
      container.append(option);
    });

    container.hidden = products.length === 0;
  },

  hide(container, input) {
    container.hidden = true;
    input.setAttribute("aria-expanded", "false");
  },

  setActive(container, activeIndex) {
    const options = container.querySelectorAll(".suggestion-option");

    options.forEach((option, index) => {
      const active = index === activeIndex;
      option.classList.toggle("active", active);
      option.setAttribute("aria-selected", String(active));
    });

    if (activeIndex >= 0 && options[activeIndex]) {
      options[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }
};
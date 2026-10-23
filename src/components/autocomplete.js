// The components namespace holds UI pieces shared by the app.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

// Functions for creating and controlling the autocomplete dropdown.
window.GemApp.components.autocomplete = {
// Creates one suggestion button for each matching product.
render(container, products, onSelect) {
    // Remove suggestions from the previous search.
    container.replaceChildren();

    products.forEach((product) => {
    // Create a button so the suggestion can be clicked.
    const option = document.createElement("button");
    option.type = "button";
    option.className = "suggestion-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");

    // Show the product name on the first line.
    const name = document.createElement("span");
    name.className = "suggestion-name";
    name.textContent = product.name;

    // Show the brand and model below the product name.
    const details = document.createElement("span");
    details.className = "suggestion-details";
    details.textContent = `${product.brand || "Brand not listed"} · ` + `${product.model || "Model not listed"}`;
    option.append(name, details);

    // Tell the search feature which product the user selected.
    option.addEventListener("click", () => onSelect(product));

    // Add this suggestion to the dropdown.
    container.append(option);
    });

    // Hide the dropdown if there are no matching products.
    container.hidden = products.length === 0;
    },

  // Hides the suggestions and updates the input's accessibility state.
hide(container, input) {
    container.hidden = true;
    input.setAttribute("aria-expanded", "false");
},

    // Highlights the suggestion selected with the keyboard.
    setActive(container, activeIndex) {
    const options = container.querySelectorAll(".suggestion-option");

    options.forEach((option, index) => {
        const isActive = index === activeIndex;
        option.classList.toggle("active", isActive);
        option.setAttribute("aria-selected", String(isActive));
    });

    // Scroll the active option into view when navigating a long list.
    if (activeIndex >= 0 && options[activeIndex]) {
        options[activeIndex].scrollIntoView({ block: "nearest" });
    }
    }
};
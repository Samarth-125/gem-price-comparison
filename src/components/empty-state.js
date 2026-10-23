// HTML templates for the app's empty and error states.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

window.GemApp.components.emptyState = {
  ready() {
    return `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">⌕</div>
        <h2>Ready when you are</h2>
        <p>Search for a product to see its marketplace prices.</p>
      </div>
    `;
  },

  noResults(searchText, category) {
    const escapeHtml = window.GemApp.utils.escapeHtml;
    const categoryMessage = category
      ? ` in ${escapeHtml(category)}`
      : "";

    return `
      <div class="empty-state no-results">
        <div class="empty-icon" aria-hidden="true">?</div>
        <h2>No products found</h2>
        <p>
          No products match “${escapeHtml(searchText)}”${categoryMessage}.
          Try another search or category.
        </p>
        <button
          id="clear-search-button"
          class="clear-search-button"
          type="button"
        >
          Clear search and filters
        </button>
      </div>
    `;
  },

  message(message, isError = false) {
    const escapeHtml = window.GemApp.utils.escapeHtml;

    return `
      <p class="message ${isError ? "error" : ""}">
        ${escapeHtml(message)}
      </p>
    `;
  }
};
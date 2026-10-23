// The components namespace holds UI pieces shared by the app.
window.GemApp = window.GemApp || {};
window.GemApp.components = window.GemApp.components || {};

// HTML templates for the ready, no-results, and message states.
window.GemApp.components.emptyState = {
// Shows the initial message before the user searches.
ready() {
    return `
    <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">⌕</div>
            <h2>Ready when you are</h2>
        <p>Search for a product to see its marketplace prices.</p>
    </div>`;
},

// Shows a message and a button when a search finds no product.
noResults(searchText, category) {
    const escapeHtml = window.GemApp.utils.escapeHtml;

    // Include the category in the message only if one is selected.
    const categoryMessage = category ? ` in ${escapeHtml(category)}` : "";

    return ` <div class="empty-state no-results">
        <div class="empty-icon" aria-hidden="true">?</div>
        <h2>No products found</h2>
        <p>
            No products match “${escapeHtml(searchText)}”${categoryMessage}.
            Try another search or category.
        </p>
        <button id="clear-search-button" class="clear-search-button" type="button">
            Clear search and filters
        </button>
    </div>`;
},

// Creates a simple message, optionally styled as an error.
message(message, isError = false) {
    const escapeHtml = window.GemApp.utils.escapeHtml;
    return `<p class="message ${isError ? "error" : ""}">
        ${escapeHtml(message)}
    </p>`;
}
};
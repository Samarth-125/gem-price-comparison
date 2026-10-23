// The utils namespace holds small helper functions used by multiple files.
window.GemApp = window.GemApp || {};
window.GemApp.utils = window.GemApp.utils || {};

// Converts text to a comparable format for case-insensitive search.
window.GemApp.utils.normalizeText = function (text) {
    return String(text ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
};

// Escapes special characters before inserting text into HTML.
window.GemApp.utils.escapeHtml = function (text) {
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
};
// Shared text helpers used by search and UI components.
window.GemApp = window.GemApp || {};
window.GemApp.utils = window.GemApp.utils || {};

window.GemApp.utils.normalizeText = function (text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

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
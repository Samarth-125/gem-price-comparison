// Electron APIs used to create a safe bridge for the page.
const { contextBridge, ipcRenderer } = require("electron");

// Exposes only the data-loading function to the renderer.
contextBridge.exposeInMainWorld("marketplaceData", {
  // Requests the three marketplace datasets from main.js.
  getAll: () => ipcRenderer.invoke("get-marketplace-data")
});
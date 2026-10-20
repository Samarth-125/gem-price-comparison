// Preload file future mein Main aur Renderer ke beech safe bridge ke liye use hoga.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("marketplaceData", {
  getAll: () => ipcRenderer.invoke("get-marketplace-data")
});
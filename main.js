// Electron APIs: app/window lifecycle, renderer communication, and external links.
const { app, BrowserWindow, ipcMain, shell } = require("electron");

// Node.js utilities for reading files and building safe file paths.
const fs = require("fs/promises");
const path = require("path");

// Reads one marketplace JSON file from the project's data folder.
async function readJsonFile(fileName) {
  const filePath = path.join(__dirname, "data", fileName);
  const fileContent = await fs.readFile(filePath, "utf8");

  return JSON.parse(fileContent);
}

// Handles the request sent by preload.js and returns all three datasets.
ipcMain.handle("get-marketplace-data", async () => {
  const [amazon, flipkart, jiomart] = await Promise.all([
    readJsonFile("amazon.json"),
    readJsonFile("flipkart.json"),
    readJsonFile("jiomart.json")
  ]);

  return { amazon, flipkart, jiomart };
});

// Creates the app window and configures its renderer security settings.
function createWindow() {
  const window = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Opens marketplace links in the user's normal browser, not a new app window.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  // Loads the app's HTML screen into the Electron window.
  window.loadFile(path.join(__dirname, "index.html"));
}

// Starts the first window after Electron has finished initializing.
app.whenReady().then(() => {
  createWindow();

  // On macOS, clicking the app icon reopens a window if all windows were closed.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quits the app on Windows and Linux when its last window closes.
// macOS apps usually remain open until the user quits them explicitly.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
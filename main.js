const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("fs/promises");
const path = require("path");

async function readJsonFile(fileName) {
  const filePath = path.join(__dirname, "data", fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContent);
}

ipcMain.handle("get-marketplace-data", async () => {
  const [amazon, flipkart, jiomart] = await Promise.all([
    readJsonFile("amazon.json"),
    readJsonFile("flipkart.json"),
    readJsonFile("jiomart.json")
  ]);

  return { amazon, flipkart, jiomart };
});

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

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  window.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
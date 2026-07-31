import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logo = path.join(__dirname, "../src/image/logo.png");
const stickyNotes = path.join(__dirname, "../src/image/stickyNotes.png");
const preloadPath = path.join(__dirname, "preload.cjs");
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 500,
    icon:logo,
    webPreferences: {
      preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
      webSecurity: false,
    },
  });

  Menu.setApplicationMenu(null);
  // mainWindow.webContents.openDevTools()
  mainWindow.loadURL("http://localhost:5173/");
}

ipcMain.on("open-note-window", () => {
  const child = new BrowserWindow({
    width: 450,
    height: 450,
    // parent: mainWindow,
    icon:stickyNotes,
    // resizable: false,
    webPreferences: {
      preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
      webSecurity: false,
    },
  });

  // child.webContents.openDevTools()
  child.loadURL("http://localhost:5173/sticky");
});

app.whenReady().then(createWindow);
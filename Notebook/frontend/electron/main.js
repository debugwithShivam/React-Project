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
    width: 800,
    height: 650,
    icon: logo,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  ipcMain.on("note-create", () => {
    mainWindow.webContents.send("note-create");
  });

  Menu.setApplicationMenu(null);
  mainWindow.webContents.openDevTools()
  mainWindow.loadURL("http://localhost:5173/");
}

ipcMain.on("open-note-window", () => {
  const child = new BrowserWindow({
    width: 450,
    height: 450,
    // parent: mainWindow,
    icon: stickyNotes,
    // resizable: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
  // child.webContents.openDevTools()
  child.loadURL("http://localhost:5173/CreateNotes");
});

ipcMain.on("UpdateNotes", (event,id) => {
  const updateNote = new BrowserWindow({
    width: 450,
    height: 450,
    // parent: mainWindow,
    icon: stickyNotes,
    // resizable: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
  // updateNote.webContents.openDevTools()
  updateNote.loadURL(`http://localhost:5173/UpdateNotes/${id}`);
});

ipcMain.on("ViewNotes", (event,id) => {
  const updateNote = new BrowserWindow({
     width: 450,
    height: 450,
    icon: stickyNotes,
    alwaysOnTop: true,        
    frame: false,  
    movable:true,
    transparent:true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
   updateNote.setAlwaysOnTop(true, "screen-saver");
  // updateNote.webContents.openDevTools()
  updateNote.loadURL(`http://localhost:5173/viewNotes/${id}`);
});
ipcMain.on("CustomMusicPlayer", (event,id) => {
  const CustomMusicPlayer = new BrowserWindow({
     width: 300,
    height: 300,
    icon: stickyNotes,
    alwaysOnTop: true,        
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
   CustomMusicPlayer.setAlwaysOnTop(true, "screen-saver");
  // updateNote.webContents.openDevTools()
  CustomMusicPlayer.loadURL(`http://localhost:5173/CustomMusicPlayer`);
});

ipcMain.on("closeNoteWindow", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

app.whenReady().then(createWindow);
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

app.setAppUserModelId("com.notebook.app")

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logo = path.join(__dirname, "assets/logo.ico");
const stickyNotes = path.join(__dirname, "assets/stickyNotes.png");
const preloadPath = path.join(__dirname, "preload.cjs");
let mainWindow;

const isDev = !app.isPackaged;

function loadPage(window, route = "") {
  if (isDev) {
    const url = route
      ? `http://localhost:5173/#/${route}`
      : `http://localhost:5173/#/`;
    window.loadURL(url);
  } else {
    window.loadFile(
      path.join(__dirname, "../dist/index.html"),
      {
        hash: route ? `/${route}` : "/",
      }
    );
  }
}

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
  loadPage(mainWindow);
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
  loadPage(child, "CreateNotes");
});

ipcMain.on("UpdateNotes", (event, id) => {
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

  loadPage(updateNote, `UpdateNotes/${id}`);
});

ipcMain.on("ViewNotes", (event, id) => {
  const updateNote = new BrowserWindow({
    width: 450,
    height: 450,
    icon: stickyNotes,
    alwaysOnTop: true,
    frame: false,
    movable: true,
    transparent: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
  updateNote.setAlwaysOnTop(true, "screen-saver");
  // updateNote.webContents.openDevTools()
  loadPage(updateNote, `ViewNotes/${id}`);
});

ipcMain.on("CustomMusicPlayer", (event, id) => {
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
  loadPage(CustomMusicPlayer, "CustomMusicPlayer");;
});

ipcMain.on("closeNoteWindow", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

ipcMain.on("open-todo-window", () => {
  const todoWindow = new BrowserWindow({
    width: 320,
    height: 400,

    frame: false,
    transparent: true,
    backgroundColor: "#00000000",

    resizable: false,
    movable: true,
    hasShadow: false,

    alwaysOnTop: true,

    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  todoWindow.setAlwaysOnTop(true, "screen-saver");
  loadPage(todoWindow, "TodoPage");
});
ipcMain.on("closeTodoWindow", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});


app.whenReady().then(createWindow);
import { app, BrowserWindow ,Menu} from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logo = path.join(__dirname, "../src/image/logo.png");

console.log(logo);

function createWindow() {
const win = new BrowserWindow({
  width: 700,
  height: 500,
  minWidth: 500,
  minHeight: 450,
  resizable: true,
  icon: logo,
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    webSecurity:false
  },
});


    Menu.setApplicationMenu(null)
    win.loadURL("http://localhost:5173/");
    win.webContents.openDevTools()
}

app.whenReady().then(createWindow);
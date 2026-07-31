const {contextBridge,exposeInMainWorld,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld("electron", {
  openNoteWindow: () => ipcRenderer.send("open-note-window"),
});



console.log("Preload loaded");
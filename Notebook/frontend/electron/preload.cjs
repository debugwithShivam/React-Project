const {contextBridge,exposeInMainWorld,ipcRenderer} = require('electron');


contextBridge.exposeInMainWorld("electron", {
  openNoteWindow: () => ipcRenderer.send("open-note-window"),
  openTodoWindow: () => ipcRenderer.send("open-todo-window"),
  closeTodoWindow: () => ipcRenderer.send("closeTodoWindow"),
  openCustomMusicPlayer: () => ipcRenderer.send("CustomMusicPlayer"),
  noteCreated:()=>ipcRenderer.send("note-create"),
  onNoteCreated:(callback)=>ipcRenderer.on("note-create",callback),
  UpdateNotes:(id)=>ipcRenderer.send('UpdateNotes',id),
  ViewNotes:(id)=>ipcRenderer.send('ViewNotes',id),
  ViewPost:(id)=>ipcRenderer.send('ViewPost',id),
  closeNoteWindow: () => ipcRenderer.send("closeNoteWindow"),
  musicStarted: () => ipcRenderer.send("music-started"),
  onMusicStop:(callback)=>ipcRenderer.on("music-stop",callback),
});



console.log("Preload loaded");
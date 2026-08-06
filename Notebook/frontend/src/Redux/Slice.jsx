import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bold: false,
  isAuthenticated:null,
  italic: false,
  underline: false,
  strike: false,
  mode: "note",
  language: "html",
  run: false,
  fullScreen: false,
  close: false,
  srcDoc: "",
  htmlCode: "<!-- Write HTML -->",
  cssCode: "/* Write CSS */",
  jsCode: 'console.log("Hello")',
  textArea: "",
  toggleMusicAddForm:false
};

const noteBookSlice = createSlice({
  name: "NotesBook",
  initialState,
  reducers: {
    ToggleBolde: (state) => {
      state.bold = !state.bold;
    },

    ToggleItalic: (state) => {
      state.italic = !state.italic;
    },

    ToggleUnderline: (state) => {
      state.underline = !state.underline;
    },

    ToggleStrike: (state) => {
      state.strike = !state.strike;
    },

    SetMode: (state, action) => {
      state.mode = action.payload;
    },

    SetLanguage: (state, action) => {
      state.language = action.payload;
    },

    ToggleRun: (state) => {
      state.run = !state.run;
    },

    ToggleFullScreen: (state) => {
      state.fullScreen = !state.fullScreen;
    },

    ToggleClose: (state) => {
      state.close = !state.close;
    },

    SetSrcDoc: (state, action) => {
      state.srcDoc = action.payload;
    },

    ResetFormatting: (state) => {
      state.bold = false;
      state.italic = false;
      state.underline = false;
      state.strike = false;
    },
    setHtmlCode: (state, action) => {
      state.htmlCode = action.payload;
    },
    setCssCode: (state, action) => {
      state.cssCode = action.payload;
    },
    setJsCode: (state, action) => {
      state.jsCode = action.payload;
    },
    setTextArea: (state, action) => {
      state.textArea = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
      ToggleMusicAddForm: (state) => {
      state.toggleMusicAddForm = !state.toggleMusicAddForm;
    },
  },
});

export const {
  ToggleBolde,
  ToggleItalic,
  ToggleUnderline,
  ToggleStrike,
  ResetFormatting,

  SetMode,
  SetLanguage,
  ToggleRun,
  ToggleFullScreen,
  ToggleClose,
  SetSrcDoc,
  setHtmlCode,
  setCssCode,
  setJsCode,
  setTextArea,
  setIsAuthenticated,
  ToggleMusicAddForm,
} = noteBookSlice.actions;

export default noteBookSlice.reducer;

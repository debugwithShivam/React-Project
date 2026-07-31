import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  mode: "note",
  language: "html",
  run: false,
  fullScreen: false,
  close: false,
  srcDoc: "",
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
} = noteBookSlice.actions;

export default noteBookSlice.reducer;

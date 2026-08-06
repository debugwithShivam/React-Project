import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import {
  ToggleBolde,
  ToggleItalic,
  ToggleUnderline,
  ToggleStrike,
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
} from "../../Redux/Slice";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Play,
  Send,
  Code2,
  FileCode2,
  Braces,
  FileJson2,
  NotebookPen,
  Maximize2,
  Minimize2,
  StickyNote,
} from "lucide-react";

export default function CreateNotes() {
  const [showMenu, setShowMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [titleShow, setTitleShow] = useState(false);

  const runCode = () => {
    dispatch(
      SetSrcDoc(`
     <!DOCTYPE html>
     <html>
    <head>
    <style>
    ${cssCode}
    </style>
    </head>
    <body>
    ${htmlCode}
    <script>
    ${jsCode}
    <\/script>
    </body>
    </html>
    `),
    );
  };

  const getCode = () => {
    switch (language) {
      case "html":
        return htmlCode;
      case "css":
        return cssCode;
      case "javascript":
        return jsCode;
      default:
        return "";
    }
  };

  const setCode = (value) => {
    switch (language) {
      case "html":
        dispatch(setHtmlCode(value || ""));
        break;
      case "css":
        dispatch(setCssCode(value || ""));
        break;
      case "javascript":
        dispatch(setJsCode(value || ""));
        break;
    }
  };

  const dispatch = useDispatch();
  const note = useSelector((state) => state.state);
  const { mode, language, run, fullScreen, close, srcDoc, htmlCode, cssCode, jsCode, textArea } = note;

  const queryClient = useQueryClient();
  const insertProduct = useMutation({
    mutationFn: (data) =>
      axios.post("http://localhost:5000/authRouter/insertNotes", data, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["insertNotes"],
      });
      window.electron.noteCreated();
    },
  });

  const languageMeta = {
    html: { label: "HTML", icon: <FileCode2 size={15} /> },
    css: { label: "CSS", icon: <Braces size={15} /> },
    javascript: { label: "JavaScript", icon: <FileJson2 size={15} /> },
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      <div className="flex flex-1 relative">
        <div className={`border-r border-white/10 ${fullScreen ? "w-3" : "w-screen"}`}>
          {mode == "note" && (
            <textarea
              value={textArea}
              onChange={(e) => dispatch(setTextArea(e.target.value))}
              placeholder="Write your note..."
              className={`
                h-full
                w-screen
                resize-none
                p-4
                outline-none
                text-[15px]
                leading-7
                text-white
                bg-transparent
                placeholder:text-zinc-600
                selection:bg-indigo-500/30
                caret-amber-400
                ${note.bold ? "font-bold" : "font-normal"}
                ${note.italic ? "italic" : "not-italic"}
                ${note.underline ? "underline decoration-amber-400/70 underline-offset-4" : "no-underline"}
                ${note.strike ? "line-through" : ""}
              `}
            />
          )}
          {mode === "code" && (
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={getCode()}
              onChange={(value) => setCode(value || "")}
            />
          )}
        </div>

        {mode === "code" && run && (
          <div className={`flex flex-col bg-zinc-900 ${fullScreen ? "w-screen" : "w-1/2"}`}>
            <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/95 px-3 py-2 text-zinc-300">
              <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-400">
                <Code2 size={14} />
                Preview
              </div>
              <button
                onClick={() => dispatch(ToggleFullScreen())}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                {fullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
            <iframe
              title="preview"
              srcDoc={srcDoc}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {titleShow && (
        <div className="absolute bottom-[76px] left-1/2 z-40 w-[92%] max-w-lg -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <div className="flex flex-1 w-full items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-amber-400/50 focus-within:ring-1 focus-within:ring-amber-400/40">
              <StickyNote size={16} className="text-zinc-500" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Add Title"
                className="w-full bg-transparent py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const hasCode =
                  htmlCode.trim() !== "<!-- Write HTML -->" ||
                  cssCode.trim() !== "/* Write CSS */" ||
                  jsCode.trim() !== 'console.log("Hello")';

                const hasText = textArea.trim() !== "";

                let type = "text";

                if (hasText && hasCode) {
                  type = "Both";
                } else if (hasCode) {
                  type = "code";
                } else {
                  type = "text";
                }

                const data = {
                  title,
                  type,
                  textArea,
                  htmlCode,
                  cssCode,
                  jsCode,
                };

                insertProduct.mutate(data);

                dispatch(setTextArea(""));
                dispatch(setHtmlCode("<!-- Write HTML -->"));
                dispatch(setCssCode("/* Write CSS */"));
                dispatch(setJsCode('console.log("Hello")'));

                setTitle("");
              }}
              className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-transform duration-150 hover:scale-[1.03] active:scale-95 sm:w-auto"
            >
              <NotebookPen size={15} />
              Add Note
            </button>
          </form>
        </div>
      )}

      <div className="relative z-50 flex items-center justify-center gap-2 border-t border-white/10 bg-zinc-900/90 p-3 backdrop-blur-xl sm:gap-3">
        <button
          onClick={() => dispatch(ToggleBolde())}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10 ${note.bold ? "bg-amber-400/15 text-amber-400" : "text-zinc-300"
            }`}
        >
          <Bold size={16} />
        </button>

        <button
          onClick={() => dispatch(ToggleItalic())}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10 ${note.italic ? "bg-amber-400/15 text-amber-400" : "text-zinc-300"
            }`}
        >
          <Italic size={16} />
        </button>

        <button
          onClick={() => dispatch(ToggleUnderline())}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10 ${note.underline ? "bg-amber-400/15 text-amber-400" : "text-zinc-300"
            }`}
        >
          <Underline size={16} />
        </button>

        {mode == "code" ? (
          <button
            onClick={() => {
              runCode();
              dispatch(ToggleFullScreen());
              if (!run) {
                dispatch(ToggleRun());
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-900/30 transition-transform duration-150 hover:scale-[1.04] active:scale-95"
          >
            <Play size={14} fill="currentColor" />
            Run
          </button>
        ) : (
          <button
            onClick={() => dispatch(ToggleStrike())}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10 ${note.strike ? "bg-amber-400/15 text-amber-400" : "text-zinc-300"
              }`}
          >
            <Strikethrough size={16} />
          </button>
        )}

        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 hover:bg-white/10 ${showMenu ? "bg-white/10 text-white" : "text-zinc-300"
            }`}
        >
          <Code2 size={16} />
        </button>

        {showMenu && (
          <div className="absolute bottom-16 left-1/2 z-50 w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {Object.entries(languageMeta).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => {
                  dispatch(SetMode("code"));
                  dispatch(SetLanguage(key));
                  setShowMenu(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-white/10 ${mode === "code" && language === key ? "text-amber-400" : "text-zinc-200"
                  }`}
              >
                {meta.icon}
                {meta.label}
              </button>
            ))}

            <div className="my-1 h-px bg-white/10" />

            <button
              onClick={() => {
                dispatch(SetMode("note"));

                if (run) {
                  dispatch(ToggleRun());
                }
                setShowMenu(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-white/10 ${mode === "note" ? "text-amber-400" : "text-zinc-200"
                }`}
            >
              <StickyNote size={15} />
              TextArea
            </button>
          </div>
        )}

        <button
          onClick={() => setTitleShow((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-900/30 transition-transform duration-150 hover:scale-[1.04] active:scale-95"
        >
          <Send size={14} />
          Send
        </button>
      </div>
    </div>
  );
}

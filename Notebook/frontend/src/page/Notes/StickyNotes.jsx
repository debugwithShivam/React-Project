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
} from "../../Redux/Slice";
import { useState } from "react";

export default function StickyNotes() {
  const [showMenu, setShowMenu] = useState(false);

  const [htmlCode, setHtmlCode] = useState(`<!-- Write HTML -->`);
  const [cssCode, setCssCode] = useState(`/* Write CSS */`);
  const [jsCode, setJsCode] = useState(`console.log("Hello")`);

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
        setHtmlCode(value);
        break;
      case "css":
        setCssCode(value);
        break;
      case "javascript":
        setJsCode(value);
        break;
    }
  };

  const dispatch = useDispatch();
  const note = useSelector((state) => state.state);
  const { mode, language, run, fullScreen, close, srcDoc } = note;

  return (
    <div className="flex h-screen flex-col bg-black/80">
      <div className="flex flex-1">
        <div
          className={`
border-r border-zinc-700

${fullScreen ? "hidden" : run ? "w-1/2" : "w-full"}
`}
        >
          {mode == "note" && (
            <textarea
              placeholder="Write your note..."
              className={`
            h-full
            resize-none
            p-3
            outline-none
            text-white
            bg-transparent
            
            ${note.bold ? "font-bold" : "font-normal"}
            
            ${note.italic ? "italic" : "not-italic"}
            
            ${note.underline ? "underline" : "no-underline"}
            
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
          <>
            <div
              className={`
bg-white

${fullScreen ? "w-full" : "w-1/2"}
`}
            >
              <div className="bg-black text-white p-1 flex gap-5">
                <h1
                  className="cursor-default"
                  onClick={() => {
                    dispatch(Toggleclose());

                    if (fullScreen) {
                      dispatch(ToggleFullScreen());
                    }
                  }}
                >
                  close
                </h1>
                <h1
                  onClick={() => dispatch(ToggleFullScreen())}
                  className="cursor-default"
                >
                  &lt;&gt;
                </h1>
                <h1 className="cursor-default">RUN JS</h1>
              </div>
              <iframe
                title="preview"
                srcDoc={srcDoc}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 border-t border-white bg-zinc-800 p-3 text-white">
        <button
          className={`${note.bold ? "text-yellow-400" : ""} font-bold`}
          onClick={() => dispatch(ToggleBolde())}
        >
          B
        </button>

        <button
          className={`${note.italic ? "text-yellow-400" : ""} italic`}
          onClick={() => dispatch(ToggleItalic())}
        >
          I
        </button>

        <button
          className={`${note.underline ? "text-yellow-400" : ""} underline`}
          onClick={() => dispatch(ToggleUnderline())}
        >
          U
        </button>

        {mode == "code" ? (
          <button
            className="bg-yellow-500 p-1 rounded-full w-15"
            onClick={() => {
              runCode();

              if (!run) {
                dispatch(ToggleRun());
              }
            }}
          >
            Run
          </button>
        ) : (
          <button
            className={`${note.strike ? "text-yellow-400" : ""} line-through`}
            onClick={() => dispatch(ToggleStrike())}
          >
            ab
          </button>
        )}

        <button onClick={() => setShowMenu((prev) => !prev)}>&lt;&gt;</button>
        {showMenu && (
          <div className="absolute w-full bottom-16 bg-zinc-900 rounded-lg p-2 flex flex-col  justify-start">
            <button
              onClick={() => {
                dispatch(SetMode("code"));
                dispatch(SetLanguage("html"));
                setShowMenu(false);
              }}
            >
              HTML
            </button>

            <button
              onClick={() => {
                dispatch(SetMode("code"));
                dispatch(SetLanguage("css"));
                setShowMenu(false);
              }}
            >
              CSS
            </button>

            <button
              onClick={() => {
                dispatch(SetMode("code"));
                dispatch(SetLanguage("javascript"));
                setShowMenu(false);
              }}
            >
              JavaScript
            </button>
            <button
              onClick={() => {
                dispatch(SetMode("note"));

                if (run) {
                  dispatch(ToggleRun());
                }
                setRun(false);
              }}
            >
              TextArea
            </button>
          </div>
        )}
        <button className="bg-yellow-500 p-1 rounded-full w-15">Send</button>
      </div>
    </div>
  );
}

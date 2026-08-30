import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom'
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import VITE_API_URL from '../../config/backend_API_URL';

export default function UpdateNotes() {
  const [showMenu, setShowMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [titleShow, setTitleShow] = useState(false);
  const [text, setText] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [language, setLanguage] = useState("");


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
        setHtmlCode(value || "");
        break;
      case "css":
        setCssCode(value || "");
        break;
      case "javascript":
        setJsCode(value || "");
        break;
    }
  };

  const dispatch = useDispatch();
  const note = useSelector((state) => state.state);
  const { mode, run, fullScreen, close, srcDoc } = note;

  const { id } = useParams()


  const queryClient = useQueryClient();

  async function getNotesData(id) {
    try {
      let response = await axios.get(`${VITE_API_URL}/authRouter/noteDataGetById/${id}`, { withCredentials: true })
      setText(response.data.data.content);
      setHtmlCode(response.data.data.html);
      setCssCode(response.data.data.css);
      setJsCode(response.data.data.javascript);
      return response.data.data
    } catch (error) {
      console.log(error)
    }
  }



  const { data, isLoading } = useQuery({
    queryKey: ['insertNotes', id],
    queryFn: () => getNotesData(id),
    enabled: !!id,
  })




  const UpdateNote = useMutation({
    mutationFn: (data) =>
      axios.patch(`${VITE_API_URL}/authRouter/updateNotes`, data, {
        withCredentials: true
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['insertNotes']
      })
      window.electron.noteCreated();
    }

  })
  if (isLoading) return <h1>Loading...</h1>


  return (
    <div className="flex h-screen flex-col bg-black/80">
      <div className="flex flex-1 relative">
        <div
          className={`
           border-r border-zinc-700 ${fullScreen ? "w-3" : "w-screen"}`}
        >
          {mode == "note" && (
            <textarea
              value={text}
              onChange={(e)=>setText(e.target.value)}
              placeholder="Write your note..."
              className={`
            h-full
            w-screen
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
            <div className={`bg-white ${fullScreen ? "w-screen" : "w-1/2"}`}>
              <div className="bg-black text-white p-1 flex gap-5">
                <h1
                  onClick={() => dispatch(ToggleFullScreen())}
                  className="cursor-default"
                >
                  &lt;&gt;
                </h1>
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

      <div className="flex items-center justify-center gap-6 border-t border-white bg-zinc-800 p-3 text-white z-50">
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
              dispatch(ToggleFullScreen());
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
          <div className="z-50 absolute w-full bottom-16 bg-zinc-900 rounded-lg p-2 flex flex-col  justify-start">
            <button
              onClick={() => {
                dispatch(SetMode("code"));
                setLanguage("html");
                setShowMenu(false);
              }}
            >
              HTML
            </button>

            <button
              onClick={() => {
                dispatch(SetMode("code"));
                setLanguage("css");
                setShowMenu(false);
              }}
            >
              CSS
            </button>

            <button
              onClick={() => {
                dispatch(SetMode("code"));
                setLanguage("javascript");
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
              }}
            >
              TextArea
            </button>
          </div>
        )}
        <button className="bg-blue-500 p-1 rounded-full w-15" onClick={() => {
          const data = {
            id,
            text,
            htmlCode,
            cssCode,
            jsCode,
          };

          UpdateNote.mutate(data);
        }} >Update</button>
      </div>
    </div>
  )
}

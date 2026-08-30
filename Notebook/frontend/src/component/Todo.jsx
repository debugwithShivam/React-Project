import React, { useState } from "react";
import { Search, BookOpen, Music2, Timer as TimerIcon, CheckSquare, Plus, Trash2, Check } from "lucide-react";

const YELLOW = "#f3c94e";

const bgStyle = {
  background:
    "radial-gradient(circle at 8% 8%, rgba(255,238,210,0.9) 0%, rgba(255,238,210,0) 32%)," +
    "radial-gradient(circle at 85% 78%, rgba(90,55,45,0.55) 0%, rgba(90,55,45,0) 45%)," +
    "linear-gradient(135deg,#f6e3c6 0%, #f0cdab 14%, #e4b2c1 30%, #cf9bce 44%, #a978c2 56%, #8a63a8 66%, #6f5083 76%, #5c4560 86%, #4a3a4f 100%)",
};

const glass = { background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)" };
const glassStrong = { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" };
const glassSoft = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.16)" };

export default function Todo() {
  const [todos, setTodos] = useState([

  ]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    const val = input.trim();
    if (!val) return;
    setTodos((t) => [...t, { id: Date.now(), text: val, done: false }]);
    setInput("");
  };

  const toggleTodo = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const deleteTodo = (id) => setTodos((t) => t.filter((x) => x.id !== id));

  const left = todos.filter((t) => !t.done).length;

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="max-w-[1440px] mx-auto px-12 py-7 pb-20">

        <div className="mt-3 mb-7 flex justify-between">X
          <div>
          <h1 className="text-[34px] font-bold text-white">Todo</h1>
          <p className="mt-1.5 text-[15px] " style={{ color: "rgba(84, 80, 80, 0.7)" }}>
            Small steps, done one by one.
          </p>
          </div>
          <div>
            <button className="rounded-3xl bg-white text-black font-semibold p-2" onClick={()=>window.electron.openTodoWindow()} >Todo Page</button>
          </div>
        </div>

        <div
          className="max-w-2xl mx-auto rounded-[26px] backdrop-blur-2xl px-8 py-8"
          style={{ ...glass, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
        >
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="What do you need to do?"
              className="flex-1 rounded-2xl px-5 py-4 text-[15px] outline-none text-white placeholder-white/40"
              style={glassSoft}
            />
            <button
              onClick={addTodo}
              className="flex items-center gap-2 px-6 rounded-2xl font-bold text-sm transition-transform active:scale-[0.97]"
              style={{
                background: `linear-gradient(160deg, #f7d576, ${YELLOW})`,
                color: "#3c2c05",
                boxShadow: "0 10px 26px rgba(230,180,50,0.35)",
              }}
            >
              <Plus size={17} /> Add
            </button>
          </div>

          <div className="flex flex-col gap-3  h-79 overflow-y-auto">
            {todos.length === 0 && (
              <div className="text-center text-sm py-10" style={{ color: "rgba(255,255,255,0.48)" }}>
                Nothing here. Add a task above to get moving.
              </div>
            )}
            {todos.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 rounded-2xl px-5 py-4"
                style={glassSoft}
              >
                <button
                  onClick={() => toggleTodo(t.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={
                    t.done
                      ? { background: YELLOW, border: `1.5px solid ${YELLOW}`, color: "#3c2c05" }
                      : { border: "1.5px solid rgba(255,255,255,0.35)" }
                  }
                >
                  {t.done && <Check size={14} strokeWidth={3} />}
                </button>
                <span
                  className="flex-1 text-[15px]"
                  style={{
                    color: t.done ? "rgba(255,255,255,0.48)" : "white",
                    textDecoration: t.done ? "line-through" : "none",
                  }}
                >
                  {t.text}
                </span>
                <button
                  onClick={() => deleteTodo(t.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ ...glassSoft, color: "rgba(255,255,255,0.5)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between mt-6 pt-5 text-[13.5px]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.48)" }}
          >
            <span>
              {left} task{left !== 1 ? "s" : ""} left
            </span>
            <button
              onClick={() => setTodos((t) => t.filter((x) => !x.done))}
              className="font-semibold"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Clear completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

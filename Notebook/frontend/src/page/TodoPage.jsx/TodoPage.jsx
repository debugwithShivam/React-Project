import React, { useState } from "react";
import { Trash, Check } from "lucide-react";
import useTodos from "../../hooks/useTodos";

export default function TodoPage() {
  const { todos, isLoading, isError, errorMessage, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [list, setList] = useState('');

  const handleClose = () => {
    window.electron?.closeTodoWindow?.();
  };

  function submit() {
    const value = list.trim();
    if (!value || addTodo.isPending) return;
    addTodo.mutate(value);
    setList("");
  }

  return (
    <div className="w-screen h-screen ">

      <div
        className="
          relative
          w-full
          h-full
          rounded-[28px]

          bg-black/60
          backdrop-blur-[30px]
          backdrop-saturate-150
          shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]

          p-5
          overflow-hidden
        "
      >

        {/* Drag area */}
        <div
          className="absolute top-0 left-0 right-0 h-16"
          style={{
            WebkitAppRegion: "drag",
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="
            absolute
            top-4
            right-4
            z-10

            w-10
            h-10

            rounded-full

            bg-black/15
            backdrop-blur-md

            border border-white/15

            text-white

            flex
            items-center
            justify-center

            font-bold

            hover:bg-black/25
            transition
          "
          style={{
            WebkitAppRegion: "no-drag",
          }}
        >
          ×
        </button>

        <h1 className="text-white text-2xl font-bold">
          Todo
        </h1>

        <div className="h-78 ">

          <div className="flex gap-3 pt-2">
            <input
              type="text"
              className="
                flex-1
                bg-transparent
                border-b
                border-white/20
                outline-none
                text-white
                placeholder-white/40
                py-2
                placeholder:pl-1
              "
              value={list}
              onChange={(e)=>setList(e.target.value)}
              onKeyDown={(e)=> e.key === "Enter" && submit()}
              placeholder="What needs to be done?"
              style={{
                WebkitAppRegion: "no-drag",
              }}
            />

            <button
              className="
                px-4
                py-2
                text-white
                hover:bg-white/20
                transition
                disabled:opacity-50
              "
              disabled={addTodo.isPending || !list.trim()}
              onClick={submit}
              style={{
                WebkitAppRegion: "no-drag",
              }}
            >
              Add
            </button>
          </div>

          {isError && <p className="pt-3 text-xs text-red-300">{errorMessage}</p>}

          <div className="m-1 h-61  overflow-y-auto">
            {isLoading && <p className="pl-2 pt-3 text-xs text-white/50">Loading your tasks...</p>}

            {!isLoading && todos.length === 0 && (
              <p className="pl-2 pt-3 text-xs text-white/50">No tasks yet. Add one above.</p>
            )}

            {todos.map((item)=>(
              <div key={item._id} className="items-center pl-2 pr-2 h-9 flex justify-between gap-3">
                <button
                  onClick={() => toggleTodo.mutate(item)}
                  aria-label={item.done ? "Mark as not done" : "Mark as done"}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  style={{ WebkitAppRegion: "no-drag" }}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      item.done ? "border-white/70 bg-white/80 text-black" : "border-white/35 text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span
                    className={`truncate text-sm ${
                      item.done ? "text-white/45 line-through" : "text-white"
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
                <button
                  onClick={() => deleteTodo.mutate(item._id)}
                  aria-label="Delete task"
                  className="shrink-0 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                  style={{ WebkitAppRegion: "no-drag" }}
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

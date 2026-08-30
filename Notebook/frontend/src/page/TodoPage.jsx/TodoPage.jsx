import React, { useState } from "react";
import {Trash} from 'lucide-react'

export default function TodoPage() {
  const [todo,setTodo]=useState([])
  const [list,setList] = useState('')
  const handleClose = () => {
    window.electron?.closeTodoWindow?.();
  };

  function createTodo(todo){
    setTodo((prev)=>{
      return [...prev,{todo:todo}]
    })
  }

   function deleteTodo(todoToDelete) {
    setTodo((prev) => prev.filter((item) => item.todo !== todoToDelete));
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
              "
              onClick={()=>{
                createTodo(list)
                setList("")
              }}
              style={{
                WebkitAppRegion: "no-drag",
              }}
            >
              Add
            </button>
          </div>

          <div className="m-1 h-61  overflow-y-auto">
            {todo.map((item,i)=>(
              <div className="items-center pl-2 pr-2 h-8 flex justify-between">
              <p  key={i}>{item.todo}</p>
              <button onClick={()=>deleteTodo(item.todo)} ><Trash/></button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
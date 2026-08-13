import React from 'react'
import { useDispatch } from 'react-redux'
import { setTimerPage } from '../../Redux/Slice'

export default function Header() {
    const dispatch = useDispatch()
  return (
    <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Timer</h1>
          <p className="mt-1 text-sm text-white/60">
            Stay focused, one session at a time.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-black/20 p-1 backdrop-blur-md">
          <button className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-neutral-900" 
          onClick={()=>{
            dispatch(setTimerPage("Focus"))
          }}
          >
            Focus
          </button>
          <button className="rounded-full px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white" 
          onClick={()=>{
            dispatch(setTimerPage("Alarm"))
          }}
          >
          Alarm
          </button>
          <button className="rounded-full px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white" 
          onClick={()=>{
            dispatch(setTimerPage("Stop Watch"))
          }}
          >
            Stop Watch
          </button>
          <button className="rounded-full px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white" 
          onClick={()=>{
            dispatch(setTimerPage("Timer"))
          }}
          >
            Timer
          </button>
        </div>
      </div>
  )
}

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTimerPage } from '../../Redux/Slice'

const TABS = ["Focus",  "Stop Watch", ]

export default function Header() {
  const dispatch = useDispatch()
  const activePage = useSelector((state) => state.timer?.timerPage) // adjust slice name if needed

  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">Timer</h1>
        <p className="mt-1 text-sm text-white/60">
          Stay focused, one session at a time.
        </p>
      </div>

      <div
        className="flex items-center gap-1 rounded-full bg-black/20 p-1 backdrop-blur-md"
        style={{ perspective: "600px" }}
      >
        {TABS.map((tab) => {
          const isActive = activePage === tab
          return (
            <button
              key={tab}
              onClick={() => dispatch(setTimerPage(tab))}
              className={`
                relative rounded-full px-4 py-1.5 text-sm font-medium
                transition-all duration-200 ease-out
                will-change-transform
                bg-white/12
                hover:-translate-y-0.5
                active:translate-y-0 active:scale-95
                ${
                  isActive
                    ? "bg-white/90 font-semibold text-neutral-900 shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                    : "text-white/70 hover:text-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.3)]"
                }
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: isActive
                  ? "translateZ(6px)"
                  : "translateZ(0px)",
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left - rect.width / 2
                const y = e.clientY - rect.top - rect.height / 2
                const rotateX = (-y / rect.height) * 12
                const rotateY = (x / rect.width) * 12
                e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isActive
                  ? "translateZ(6px)"
                  : "translateZ(0px)"
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>
    </div>
  )
}
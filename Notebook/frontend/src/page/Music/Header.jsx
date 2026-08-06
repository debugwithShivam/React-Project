import React, { useState } from 'react'
import { Search, Plus } from "lucide-react";
import { useDispatch } from 'react-redux';
import { ToggleMusicAddForm } from '../../Redux/Slice'

export default function Header() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch()

  return (
    <div className="max-w-5xl mx-auto px-10 pt-7 pb-16 z-50">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            textShadow: "0 2px 10px rgba(0,0,0,0.25)",
          }}
        >
          Music
        </h1>

        <div className='flex wrap gap-15  w-93'>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(255,255,255,0.22)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 999,
              padding: "9px 16px",
              width: "100%",
              minWidth: 240,
              backdropFilter: "blur(8px)",
            }}
          >
            <Search size={16} color="#3a2a33" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or artist..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "#2a1f26",
                width: "100%",
              }}
            />
          </div>

        </div>
        <div className='flex justify-center gap-5  w-60'>

          <button
            onClick={() => dispatch(ToggleMusicAddForm())}
            style={{
              display: "flex",
              alignItems: "center",
              // gap: 8,
              background: "linear-gradient(135deg,#3b6fd1,#5a3fae)",
              border: "none",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59,111,209,0.35)",
            }}
          >
            <Plus size={16} />
            Add Music
          </button>
          <button
            onClick={() => dispatch(ToggleMusicAddForm())}
            style={{
              display: "flex",
              alignItems: "center",
              // gap: 8,
              background: "linear-gradient(135deg,#3b6fd1,#5a3fae)",
              border: "none",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59,111,209,0.35)",
            }}
          >
            <Plus size={16} />
            Play
          </button>
        </div>
      </div>
    </div>
  )
}

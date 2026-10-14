import React, { useEffect, useState } from 'react'
import { useMusic } from './musicData'
import {
  getVolume,
  pauseSong,
  playSong,
  seekTo,
  setQueue,
  setVolume,
  skipTo,
  usePlayer,
  useProgress,
} from './audioPlayer'

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Footer() {
  const { data, isLoading } = useMusic()
  const player = usePlayer()
  const { current, duration } = useProgress()
  const [volume, setVolumeState] = useState(getVolume())
  const songs = data ?? []

  useEffect(() => {
    setQueue(songs)
  }, [songs])

  if (isLoading) return <h1>Loading...</h1>

  const song =
    songs.find((item) => String(item._id) === String(player.songId)) ?? songs[0] ?? null
  const isPlaying =
    !!song && String(player.songId) === String(song._id) && player.playing

  function togglePlay() {
    if (!song) return
    if (isPlaying) {
      pauseSong()
    } else {
      playSong(song)
    }
  }

  const seek = (e) => {
    seekTo(Number(e.target.value))
  }

  const changeVolume = (e) => {
    const value = Number(e.target.value)
    setVolumeState(value)
    setVolume(value)
  }

  return (
    <div className='fixed bottom-0 left-0 flex items-center justify-between w-screen h-20 px-4 bg-black/90 text-white border-t border-white/10'>
      {/* Left: cover + info */}
      <div className='flex items-center gap-3 w-1/4 min-w-0'>
        {song?.coverImage && (
          <img
            src={song.coverImage}
            className='w-12 h-12 rounded-md object-cover shrink-0'
            alt=""
          />
        )}
        <div className='flex flex-col min-w-0'>
          <span className='text-sm font-medium truncate'>{song?.title}</span>
          <span className='text-xs text-white/60 truncate'>{song?.artist}</span>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center gap-1 w-1/2'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => skipTo(-1)}
            className='text-white/70 hover:text-white transition-colors'
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform'
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => skipTo(1)}
            className='text-white/70 hover:text-white transition-colors'
          >
            ⏭
          </button>
        </div>

        <div className='flex items-center gap-2 w-full max-w-md'>
          <span className='text-xs text-white/50 w-9 text-right'>
            {formatTime(current)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            value={current}
            onChange={seek}
            className='flex-1 h-1 accent-white cursor-pointer'
          />
          <span className='text-xs text-white/50 w-9'>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 w-1/4 justify-end'>
        <span className='text-sm'>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={changeVolume}
          className='w-24 h-1 accent-white cursor-pointer'
        />
      </div>
    </div>
  )
}

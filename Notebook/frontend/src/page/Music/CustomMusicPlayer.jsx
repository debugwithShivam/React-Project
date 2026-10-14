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

export default function CustomMusicPlayer() {
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
    <div className='w-screen h-screen flex flex-col justify-between bg-black/90 text-white  p-4 shadow-xl'>
      {/* Cover image - takes most of the box */}
      <div className='w-full aspect-square rounded-xl overflow-hidden bg-white/5'>
        {song?.coverImage && (
          <img
            src={song.coverImage}
            className='w-full h-full object-contain'
            alt=""
          />
        )}
      </div>

      {/* Title + artist */}
      <div className='flex flex-col items-center text-center mt-2 min-w-0'>
        <span className='text-sm font-medium truncate w-full'>{song?.title}</span>
        <span className='text-xs text-white/60 truncate w-full'>{song?.artist}</span>
      </div>

      {/* Progress bar */}
      <div className='flex items-center gap-2 w-full mt-2'>
        <span className='text-[10px] text-white/50 w-8 text-right'>
          {formatTime(current)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={current}
          onChange={seek}
          className='flex-1 h-1 accent-white cursor-pointer'
        />
        <span className='text-[10px] text-white/50 w-8'>
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className='flex items-center justify-center gap-5 mt-2'>
        <button
          onClick={() => skipTo(-1)}
          className='text-white/70 hover:text-white transition-colors text-lg'
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className='w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform'
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => skipTo(1)}
          className='text-white/70 hover:text-white transition-colors text-lg'
        >
          ⏭
        </button>
      </div>

      {/* Volume */}
      <div className='flex items-center gap-2 w-full mt-2'>
        <span className='text-xs'>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={changeVolume}
          className='flex-1 h-1 accent-white cursor-pointer'
        />
      </div>
    </div>
  )
}

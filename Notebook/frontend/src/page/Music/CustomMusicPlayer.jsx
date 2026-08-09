import React, { useState, useEffect, useRef } from 'react'
import { useMusic } from './musicData'

const API_BASE = 'http://localhost:5000'

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CustomMusicPlayer() {
  const { data, isLoading } = useMusic()
  const [coverImage, setCoverImage] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [title, setTitle] = useState(null)
  const [artist, setArtist] = useState(null)
  const [index, setIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef(null)

  useEffect(() => {
    if (data && data[index]) {
      const { fileUrl: audio, coverImage: image, title, artist } = data[index]
      setFileUrl(`${API_BASE}${audio}`)
      setCoverImage(`${API_BASE}${image}`)
      setTitle(title)
      setArtist(artist)
    }
  }, [data, index])

  useEffect(() => {
    if (!fileUrl || !audioRef.current) return
    audioRef.current.src = fileUrl
    if (isPlaying) {
      audioRef.current.play()
    }
  }, [fileUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const loaded = () => setDuration(audio.duration)
    const update = () => setCurrentTime(audio.currentTime)
    const ended = () => {
      setIndex((count) => {
        if (data && count < data.length - 1) {
          return count + 1
        }
        return 0
      })
    }

    audio.addEventListener('loadedmetadata', loaded)
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('ended', ended)

    return () => {
      audio.removeEventListener('loadedmetadata', loaded)
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('ended', ended)
    }
  }, [isLoading, data])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  if (isLoading) return <h1>Loading...</h1>

  function incIndex() {
    if (data && index < data.length - 1) {
      setIndex((count) => count + 1)
    }
  }

  function decIndex() {
    if (index === 0) return
    setIndex((count) => count - 1)
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seek = (e) => {
    if (!audioRef.current) return
    const value = Number(e.target.value)
    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  const changeVolume = (e) => {
    setVolume(Number(e.target.value))
  }

  return (
    <div className='w-screen h-screen flex flex-col justify-between bg-black/90 text-white  p-4 shadow-xl'>
      <audio ref={audioRef} />

      {/* Cover image - takes most of the box */}
      <div className='w-full aspect-square rounded-xl overflow-hidden bg-white/5'>
        {coverImage && (
          <img
            src={coverImage}
            className='w-full h-full object-contain'
            alt=""
          />
        )}
      </div>

      {/* Title + artist */}
      <div className='flex flex-col items-center text-center mt-2 min-w-0'>
        <span className='text-sm font-medium truncate w-full'>{title}</span>
        <span className='text-xs text-white/60 truncate w-full'>{artist}</span>
      </div>

      {/* Progress bar */}
      <div className='flex items-center gap-2 w-full mt-2'>
        <span className='text-[10px] text-white/50 w-8 text-right'>
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
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
          onClick={decIndex}
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
          onClick={incIndex}
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
import React, { useState, useEffect, useRef } from 'react'
import { useMusic } from './musicData'
import { useSelector } from 'react-redux'
import VITE_API_URL from '../../config/backend_API_URL'

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Footer() {
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
  const optionIndex = useSelector((state)=>state.state)

  useEffect(() => {
    if (data && data[index]) {
      const { fileUrl: audio, coverImage: image, title, artist } = data[index]
      setFileUrl(`${VITE_API_URL}${audio}`)
      setCoverImage(`${VITE_API_URL}${image}`)
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
    }
  }, [isLoading])

  // keep <audio>.volume in sync with volume state
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
    <div className='fixed bottom-0 left-0 flex items-center justify-between w-screen h-20 px-4 bg-black/90 text-white border-t border-white/10'>
      <audio ref={audioRef} />

      {/* Left: cover + info */}
      <div className='flex items-center gap-3 w-1/4 min-w-0'>
        {coverImage && (
          <img
            src={coverImage}
            className='w-12 h-12 rounded-md object-cover shrink-0'
            alt=""
          />
        )}
        <div className='flex flex-col min-w-0'>
          <span className='text-sm font-medium truncate'>{title}</span>
          <span className='text-xs text-white/60 truncate'>{artist}</span>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center gap-1 w-1/2'>
        <div className='flex items-center gap-4'>
          <button
            onClick={decIndex}
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
            onClick={incIndex}
            className='text-white/70 hover:text-white transition-colors'
          >
            ⏭
          </button>
        </div>

        <div className='flex items-center gap-2 w-full max-w-md'>
          <span className='text-xs text-white/50 w-9 text-right'>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
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
import React, { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Play, Pause, Heart, Music2, Trash2 } from 'lucide-react'
import { useMusic } from './musicData'
import { useDispatch } from 'react-redux'
import { setIndex, indexToggle } from '../../Redux/Slice'
import VITE_API_URL from '../../config/backend_API_URL'

export default function MusicContainer({ search = '' }) {
  const { data, isLoading } = useMusic()
  const dispatch = useDispatch()


  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  const songs = data ?? []

  const filtered = search.trim()
    ? songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.artist?.toLowerCase().includes(search.toLowerCase())
    )
    : songs

  const togglePlay = (song) => {
    const url = `${VITE_API_URL}${song.fileUrl}`
    console.log(url)

    if (playingId === song._id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audio.play().catch((err) => console.log('Playback failed:', err))
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(song._id)
  }

  const queryClient = useQueryClient()
  let deleteMusic = useMutation({
    mutationFn: async (data) => {
      await axios.delete(`${VITE_API_URL}/authRouter/deleteMusic/${data}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['insertMusic']
      })
    },
    
    onError: (error) => {
    console.log(
      'Delete failed:',
      error.response?.data || error.message
    )
  }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 px-8 py-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/10" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center  justify-center gap-3 py-32 text-white/60">
        <Music2 size={40} className="opacity-50" />
        <p className="text-sm">
          {search ? 'No songs match your search.' : 'No music added yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="  p-5 pt-1 flex justify-center  h-full ">
      <div className='grid grid-cols-3   h-full drag-region
      no-drag hide-scrollbar p-2   overflow-y-auto justify-start gap-3'>

        {filtered.map((song, i) => {
          const isPlaying = playingId === song._id
          return (
            <div
              key={song._id}
              className="group w-50 h-84  m-2 text-black relative overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm transition hover:ring-white/30"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black/30">
                {song.coverImage ? (
                  <img
                    src={`${VITE_API_URL}${song.coverImage}`}
                    alt={song.title}
                    className="h-full w-full  object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
                    <Music2 size={32} className="text-white/40" />
                  </div>
                )}

                <button
                  onClick={() => {
                    togglePlay(song)
                    dispatch(setIndex(i))
                    dispatch(indexToggle())
                  }}
                  className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-110 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur transition hover:bg-black/60">
                  <Trash2 size={15} className={song.fav ? 'fill-rose-500 text-rose-500' : ''} onClick={() => deleteMusic.mutate(song._id)} />
                </button>
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-black">{song.title}</p>
                <p className="truncate text-xs text-black/60">{song.artist || 'Unknown Artist'}</p>
              </div>

              {isPlaying && <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500" />}
            </div>
          )
        })}

      </div>
    </div>
  )
}

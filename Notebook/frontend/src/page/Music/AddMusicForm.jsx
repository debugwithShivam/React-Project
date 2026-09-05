// AddMusicForm.jsx
import React, { useState, useRef } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Music2, Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react'
import VITE_API_URL from '../../config/backend_API_URL'
export default function AddMusicForm() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [musicFile, setMusicFile] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const musicInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const note = useSelector((state) => state.state.toggleMusicAddForm)
  const queryClient = useQueryClient()

  const addMusic = useMutation({
    mutationFn: (data) =>
      axios.post(`${VITE_API_URL}/authRouter/uploadMusic`, data, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insertMusic"] })
      setTitle("")
      setArtist("")
      setMusicFile(null)
      setCoverImage(null)
      setCoverPreview(null)
    },
  })

const handleCoverChange = (file) => {
    setCoverImage(file);
    if (file) {
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
    } else {
        setCoverPreview(null);
    }
};
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !artist || !musicFile || !coverImage) return

    const formData = new FormData()
    formData.append("title", title)
    formData.append("artist", artist)
    formData.append("music", musicFile)
    formData.append("coverImage", coverImage)
    addMusic.mutate(formData)
  }

  if (!note) return null

  const isFormValid = title && artist && musicFile && coverImage

  return (
    <div className="w-full flex justify-center px-4 absolute top-0 z-50" >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl overflow-hidden
                   bg-gradient-to-br from-slate-900 via-[#0b1730] to-slate-950
                   border border-white/10 rounded-3xl
                   shadow-[0_0_60px_-15px_rgba(56,189,248,0.35)]
                   p-7 sm:p-9 flex flex-col gap-6"
      >
        {/* ambient glow accents */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />

        {/* header */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
                          bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30">
            <Music2 className="h-5 w-5 text-cyan-300" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300
                            text-xl font-semibold tracking-tight">
              Add New Track
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Upload a song and its cover art to your library</p>
          </div>
        </div>

        {/* text fields */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider pl-0.5">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Midnight City"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 text-slate-100 placeholder-slate-500 border border-white/10
                         rounded-xl px-4 py-3 text-sm outline-none
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white/[0.07]
                         hover:border-white/20 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider pl-0.5">
              Artist
            </label>
            <input
              type="text"
              placeholder="e.g. Aurora Waves"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-white/5 text-slate-100 placeholder-slate-500 border border-white/10
                         rounded-xl px-4 py-3 text-sm outline-none
                         focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white/[0.07]
                         hover:border-white/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* file uploads */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* audio dropzone */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider pl-0.5">
              Audio File
            </span>
            <button
              type="button"
              onClick={() => musicInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center gap-2
                         h-32 rounded-xl border-2 border-dashed border-white/15
                         bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/40
                         transition-all duration-200"
            >
              {musicFile ? (
                <>
                  <Music2 className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
                  <span className="text-slate-200 text-xs px-4 text-center truncate max-w-full">
                    {musicFile.name}
                  </span>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setMusicFile(null) }}
                    className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center
                               rounded-full bg-slate-800/80 hover:bg-red-500/30 text-slate-400 hover:text-red-300
                               transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-slate-500 group-hover:text-cyan-300 transition-colors" strokeWidth={1.5} />
                  <span className="text-slate-500 text-xs">Click to select audio</span>
                  <span className="text-slate-600 text-[10px]">MP3, WAV, FLAC</span>
                </>
              )}
            </button>
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => setMusicFile(e.target.files[0] ?? null)}
              className="hidden"
            />
          </div>

          {/* cover dropzone */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider pl-0.5">
              Cover Image
            </span>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center gap-2
                         h-32 rounded-xl border-2 border-dashed border-white/15 overflow-hidden
                         bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/40
                         transition-all duration-200"
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-slate-950/40" />
                  <span className="relative text-slate-100 text-xs px-4 text-center truncate max-w-full drop-shadow">
                    {coverImage?.name}
                  </span>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); handleCoverChange(null) }}
                    className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center
                               rounded-full bg-slate-900/70 hover:bg-red-500/40 text-slate-300 hover:text-red-200
                               transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-slate-500 group-hover:text-cyan-300 transition-colors" strokeWidth={1.5} />
                  <span className="text-slate-500 text-xs">Click to select image</span>
                  <span className="text-slate-600 text-[10px]">JPG, PNG, WEBP</span>
                </>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverChange(e.target.files[0] ?? null)}
              className="hidden"
            />
          </div>
        </div>

        {/* footer */}
        <div className="relative flex items-center justify-between gap-4 pt-1">
          <p className="text-slate-500 text-xs">
            {isFormValid ? "Ready to upload" : "Fill in all fields to continue"}
          </p>

          <button
            type="submit"
            disabled={addMusic.isPending || !isFormValid}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400
                       hover:from-blue-400 hover:to-cyan-300
                       disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:opacity-60
                       text-slate-950 font-semibold text-sm px-6 py-3 rounded-xl
                       shadow-[0_0_25px_-6px_rgba(56,189,248,0.7)] disabled:shadow-none
                       transition-all duration-200 active:scale-[0.98]"
          >
            {addMusic.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {addMusic.isPending ? "Uploading..." : "Add Music"}
          </button>
        </div>

        {addMusic.isError && (
          <p className="relative text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            Upload failed. Please try again.
          </p>
        )}
      </form>
    </div>
  )
}

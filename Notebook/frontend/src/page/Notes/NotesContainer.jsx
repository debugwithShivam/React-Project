import axios from 'axios'
import React, { useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Trash2, Pencil, Pin, FileText, StickyNote, Clock } from 'lucide-react'

const noteColors = [
    { bg: 'bg-yellow-200/85', pin: 'text-yellow-600', fold: 'bg-yellow-900/10' },
    { bg: 'bg-pink-200/85', pin: 'text-pink-600', fold: 'bg-pink-900/10' },
    { bg: 'bg-blue-200/85', pin: 'text-blue-600', fold: 'bg-blue-900/10' },
    { bg: 'bg-green-200/85', pin: 'text-green-600', fold: 'bg-green-900/10' },
    { bg: 'bg-purple-200/85', pin: 'text-purple-600', fold: 'bg-purple-900/10' },
    { bg: 'bg-orange-200/85', pin: 'text-orange-600', fold: 'bg-orange-900/10' },
]

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0']

export default function NotesContainer() {

    async function getNotesData() {
        try {
            let response = await axios.get('http://localhost:5000/authRouter/getNotes', { withCredentials: true })
            console.log(response.data.data);
            return response.data.data
        } catch (error) {
            console.log(error)
        }
    }

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['insertNotes'],
        queryFn: getNotesData
    })

    const queryClient = useQueryClient();

    async function handleDelete(id) {
        try {
            await axios.delete(`http://localhost:5000/authRouter/deleteNotes/${id}`, { withCredentials: true })
            queryClient.invalidateQueries({
                queryKey: ['insertNotes']
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        window.electron.onNoteCreated(() => {
            console.log("IPC received");

            queryClient.invalidateQueries({
                queryKey: ["insertNotes"],
            });
        });
    }, [queryClient]);

    return (
        <div className="mx-5 my-6 rounded-3xl bg-white/10 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300">
            <style>{`
                @keyframes noteIn {
                    from { opacity: 0; transform: translateY(14px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .note-card {
                    animation: noteIn 0.35s ease-out both;
                }
            `}</style>

            {isLoading && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[190px] animate-pulse rounded-lg bg-white/15"
                        />
                    ))}
                </div>
            )}

            {!isLoading && (!data || data.length === 0) && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
                    <StickyNote size={34} strokeWidth={1.5} />
                    <p className="text-sm font-medium">No notes yet — write your first one.</p>
                </div>
            )}

            {!isLoading && data && data.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                    {data.map((item, index) => {
                        const color = noteColors[index % noteColors.length]
                        const rotate = rotations[index % rotations.length]

                        return (
                            <div
                                key={item._id}
                                style={{ animationDelay: `${index * 45}ms` }}
                                className={`note-card group relative min-h-[190px] rounded-lg p-4 pt-6 shadow-lg ${color.bg} ${rotate} transition-all duration-300 ease-out hover:z-10 hover:rotate-0 hover:scale-[1.06] hover:shadow-2xl`}
                            >
                                <Pin
                                    size={20}
                                    className={`absolute -top-2 left-1/2 -translate-x-1/2 -rotate-45 drop-shadow ${color.pin} fill-current`}
                                />

                                {/* folded paper corner */}
                                <div
                                    className={`absolute bottom-0 right-0 h-6 w-6 rounded-tl-lg ${color.fold} [clip-path:polygon(100%_0,0%_100%,100%_100%)]`}
                                />

                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <button
                                        onClick={() => window.electron.ViewNotes(item._id)}
                                        title="View"
                                        className="rounded-full bg-black/10 p-1.5 transition-colors duration-150 hover:bg-black/25"
                                    >
                                        <FileText size={13} className="text-black/70" />
                                    </button>
                                    <button
                                        onClick={() => window.electron.UpdateNotes(item._id)}
                                        title="Edit"
                                        className="rounded-full bg-black/10 p-1.5 transition-colors duration-150 hover:bg-black/25"
                                    >
                                        <Pencil size={13} className="text-black/70" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                        className="rounded-full bg-black/10 p-1.5 transition-colors duration-150 hover:bg-red-500/70"
                                    >
                                        <Trash2 size={13} className="text-black/70" />
                                    </button>
                                </div>

                                <h3 className="mb-2 truncate pr-8 text-lg font-bold text-black">
                                    {item.title}
                                </h3>
                                <p className="line-clamp-4 text-sm leading-relaxed text-black/75">
                                    {item.content}
                                </p>

                                <span className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-black/50">
                                    <Clock size={11} />
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

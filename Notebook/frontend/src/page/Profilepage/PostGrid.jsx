import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Trash2, Heart, Eye, Clock, Pin } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";

const noteColors = [
    { bg: 'bg-yellow-200/85', pin: 'text-yellow-600', fold: 'bg-yellow-900/10' },
    { bg: 'bg-pink-200/85', pin: 'text-pink-600', fold: 'bg-pink-900/10' },
    { bg: 'bg-blue-200/85', pin: 'text-blue-600', fold: 'bg-blue-900/10' },
    { bg: 'bg-green-200/85', pin: 'text-green-600', fold: 'bg-green-900/10' },
    { bg: 'bg-purple-200/85', pin: 'text-purple-600', fold: 'bg-purple-900/10' },
    { bg: 'bg-orange-200/85', pin: 'text-orange-600', fold: 'bg-orange-900/10' },
]

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0']

function LikeButton({ post }) {
    const queryClient = useQueryClient();

    const likePost = useMutation({
        mutationFn: async () => {
            const response = await axios.post(
                `${VITE_API_URL}/authRouter/likePost/${post._id}`,
                {},
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["post", post._id] });
        },
    });

    return (
        <button
            type="button"
            onClick={() => likePost.mutate()}
            disabled={likePost.isPending}
            aria-label={post.likedByMe ? "Unlike post" : "Like post"}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
                post.likedByMe
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
            } disabled:opacity-50`}
        >
            <Heart size={14} className={post.likedByMe ? "fill-current" : ""} />
            {post.likeCount ?? 0}
        </button>
    );
}

export default function PostGrid({ posts, canDelete = false }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const deletePost = useMutation({
        mutationFn: async (postId) => {
            const response = await axios.delete(
                `${VITE_API_URL}/authRouter/post/${postId}`,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            setError("");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (err) => {
            setError(err.response?.data?.message ?? "Could not delete this post.");
        },
    });

    if (!posts || posts.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-white/50">
                Nothing posted yet.
            </p>
        );
    }

    return (
        <div className="px-1 pb-4">
            {error && <p className="mb-3 text-sm text-red-300/80">{error}</p>}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {posts.map((post, index) => (
                    <div
                        key={post._id}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    >
                        {post.mediaUrl ? (
                            <img
                                src={post.mediaUrl}
                                alt=""
                                className="h-60 w-full object-cover"
                            />
                        ) : (
                            <div
                                className={`relative min-h-[190px] rounded-lg p-4 pt-6 shadow-lg ${noteColors[index % noteColors.length].bg} ${rotations[index % rotations.length]} transition-all duration-300 ease-out hover:rotate-0`}
                            >
                                <Pin
                                    size={20}
                                    className={`absolute -top-2 left-1/2 -translate-x-1/2 -rotate-45 drop-shadow ${noteColors[index % noteColors.length].pin} fill-current`}
                                />

                                <div
                                    className={`absolute bottom-0 right-0 h-6 w-6 rounded-tl-lg ${noteColors[index % noteColors.length].fold} [clip-path:polygon(100%_0,0%_100%,100%_100%)]`}
                                />

                                <div className="absolute top-2 right-2 flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/ViewPost/${post._id}`)}
                                        title="View"
                                        aria-label="View note"
                                        className="rounded-full bg-black/10 p-1.5 transition-colors duration-150 hover:bg-black/25"
                                    >
                                        <Eye size={13} className="text-black/70" />
                                    </button>
                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => deletePost.mutate(post._id)}
                                            disabled={deletePost.isPending}
                                            title="Delete"
                                            aria-label="Delete post"
                                            className="rounded-full bg-black/10 p-1.5 transition-colors duration-150 hover:bg-red-500/70 disabled:opacity-50"
                                        >
                                            <Trash2 size={13} className="text-black/70" />
                                        </button>
                                    )}
                                </div>

                                <h3 className="mb-2 truncate pr-20 text-lg font-bold text-black">
                                    {post.title || post.note?.title || "Note"}
                                </h3>
                                <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-black/75">
                                    {post.note?.content || "This note is empty."}
                                </p>

                                <span className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-black/50">
                                    <Clock size={11} />
                                    {new Date(post.note?.createdAt ?? post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-3 p-4">
                            <div className="min-w-0">
                                {post.caption && (
                                    <p className="text-sm break-words">
                                        {post.caption}
                                    </p>
                                )}
                                <span className="mt-2 flex items-center gap-2 text-xs text-white/45">
                                    {post.visibility === "private" ? (
                                        <>
                                            <Lock size={12} />
                                            Only you
                                        </>
                                    ) : (
                                        <>
                                            <Globe size={12} />
                                            Public
                                        </>
                                    )}
                                    <span>·</span>
                                    {new Date(post.createdAt).toLocaleDateString(
                                        [],
                                        { day: "2-digit", month: "short" }
                                    )}
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <LikeButton post={post} />

                                {canDelete && post.mediaUrl && (
                                    <button
                                        type="button"
                                        onClick={() => deletePost.mutate(post._id)}
                                        disabled={deletePost.isPending}
                                        aria-label="Delete post"
                                        className="shrink-0 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-red-500/70 hover:text-white disabled:opacity-50"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

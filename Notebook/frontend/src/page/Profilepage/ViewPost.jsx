import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, FileText, Code2, Heart, Pencil, Globe, Lock, User, MessageCircle, Send, Trash2, WifiOff } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";

const DEFAULTS = {
  content: "",
  html: "<!-- Write HTML -->",
  css: "/* Write CSS */",
  javascript: 'console.log("Hello")',
};

function isOfflineError(error) {
  return !error?.response && !navigator.onLine;
}

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  async function getPostData() {
    const response = await axios.get(
      `${VITE_API_URL}/authRouter/post/${id}`,
      { withCredentials: true }
    );
    return response.data.data;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: getPostData,
    enabled: !!id,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["post", id] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  const likePost = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${VITE_API_URL}/authRouter/likePost/${id}`,
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: refresh,
  });

  const addComment = useMutation({
    mutationFn: async (text) => {
      const response = await axios.post(
        `${VITE_API_URL}/authRouter/comment/${id}`,
        { text },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      refresh();
    },
  });

  const removeComment = useMutation({
    mutationFn: async (commentId) => {
      const response = await axios.delete(
        `${VITE_API_URL}/authRouter/comment/${commentId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: refresh,
  });

  // The snapshot is what was posted; the live note only exists for the Edit link.
  const liveNote = data?.note;

  const snapshotHasContent = Boolean(
    data?.noteSnapshot?.content?.trim() ||
    data?.noteSnapshot?.html?.trim() ||
    data?.noteSnapshot?.css?.trim() ||
    data?.noteSnapshot?.javascript?.trim()
  );

  const source = snapshotHasContent ? data.noteSnapshot : liveNote ?? null;

  const contentVal = source?.content ?? "";
  const htmlVal = source?.html ?? "";
  const cssVal = source?.css ?? "";
  const jsVal = source?.javascript ?? "";

  const availableTabs = useMemo(() => {
    if (!source) return [];

    const tabs = [];
    if (contentVal.trim() !== DEFAULTS.content.trim())
      tabs.push({ key: 'content', label: 'Note', icon: <FileText size={13} /> });
    if (htmlVal.trim() !== DEFAULTS.html.trim())
      tabs.push({ key: 'html', label: 'HTML', icon: <Code2 size={13} /> });
    if (cssVal.trim() !== DEFAULTS.css.trim())
      tabs.push({ key: 'css', label: 'CSS', icon: <Code2 size={13} /> });
    if (jsVal.trim() !== DEFAULTS.javascript.trim())
      tabs.push({ key: 'javascript', label: 'JS', icon: <Code2 size={13} /> });
    return tabs;
  }, [source, contentVal, htmlVal, cssVal, jsVal]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const contentMap = { content: contentVal, html: htmlVal, css: cssVal, javascript: jsVal };
  const comments = data?.comments ?? [];

  function handleClose() {
    if (window.electron?.closeNoteWindow) {
      window.electron.closeNoteWindow();
    } else {
      navigate(-1);
    }
  }

  function handleEdit() {
    if (window.electron?.UpdateNotes) {
      window.electron.UpdateNotes(liveNote._id);
    } else {
      navigate(`/UpdateNotes/${liveNote._id}`);
    }
  }

  function submitComment(event) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || addComment.isPending) return;
    addComment.mutate(text);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-yellow-200">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 rounded-xl bg-yellow-200">
        <p className="text-sm text-gray-700">
          {isOfflineError(error)
            ? "You are offline. Connect to the internet to open this post."
            : error?.response?.data?.message ?? "This post cannot be shown."}
        </p>
        <button
          onClick={handleClose}
          className="no-drag rounded-full bg-black/10 px-4 py-1.5 text-sm text-gray-700 hover:bg-black/20"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden rounded-xl bg-gradient-to-b from-yellow-200 to-yellow-300 shadow-2xl">

      <div className="drag-region flex justify-end gap-2 p-2">
        <button
          onClick={() => likePost.mutate()}
          disabled={likePost.isPending}
          aria-label={data.likedByMe ? "Unlike post" : "Like post"}
          className={`no-drag flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
            data.likedByMe
              ? 'bg-red-500 text-white'
              : 'bg-yellow-100/70 text-gray-700 hover:bg-yellow-100'
          } disabled:opacity-50`}
        >
          <Heart size={14} className={data.likedByMe ? "fill-current" : ""} />
          {data.likeCount ?? 0}
        </button>

        {data.isOwner && liveNote && (
          <button
            onClick={handleEdit}
            title="Edit"
            aria-label="Edit note"
            className="no-drag flex items-center gap-1.5 rounded-full bg-yellow-100/70 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-yellow-100"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}

        <button
          onClick={handleClose}
          className="no-drag rounded-full bg-yellow-100/70 p-1.5 transition hover:bg-yellow-100"
          title="Close"
          aria-label="Close"
        >
          <X size={16} className="text-gray-700" />
        </button>
      </div>

      <div className="drag-region px-4 pb-1">
        <h1 className="truncate text-base font-bold text-gray-900">
          {data.title || source?.title || data.caption || "Untitled"}
        </h1>
      </div>

      <div className="drag-region flex items-center gap-3 px-4 pb-2 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          {data.userId?.profilePicture ? (
            <img
              src={data.userId.profilePicture}
              alt=""
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <User size={13} />
          )}
          {data.userId?.name || data.userId?.username || "Unknown"}
        </span>
        <span className="flex items-center gap-1">
          {data.visibility === "private" ? <Lock size={12} /> : <Globe size={12} />}
          {data.visibility === "private" ? "Only you" : "Public"}
        </span>
        <span>
          {new Date(data.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {availableTabs.length > 1 && (
        <div className="no-drag flex flex-wrap gap-2 px-4 pb-2 pt-1">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition ${
                activeTab === tab.key
                  ? 'bg-yellow-500 font-semibold text-white'
                  : 'bg-yellow-100/70 text-gray-700 hover:bg-yellow-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="no-drag hide-scrollbar flex-1 overflow-auto px-4 pb-3">
        {data.mediaUrl && (
          online
            ? <img src={data.mediaUrl} alt="" className="max-h-full w-full rounded-lg object-contain" />
            : (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <WifiOff size={14} />
                This image needs an internet connection.
              </p>
            )
        )}

        {!data.mediaUrl && !source && (
          <p className="text-sm text-gray-600">This note is no longer available.</p>
        )}

        {!data.mediaUrl && source && activeTab && (
          activeTab === 'content'
            ? <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{contentMap[activeTab]}</p>
            : <pre className="rounded-lg bg-white/50 p-3 font-mono text-xs whitespace-pre-wrap text-gray-800">{contentMap[activeTab]}</pre>
        )}

        {!data.mediaUrl && source && availableTabs.length === 0 && (
          <p className="text-sm italic text-gray-500">This note is empty.</p>
        )}

        <div className="mt-3 border-t border-yellow-900/15 pt-2">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <MessageCircle size={13} />
            {data.commentCount ?? comments.length} {(data.commentCount ?? comments.length) === 1 ? "comment" : "comments"}
          </p>

          {comments.length === 0 && (
            <p className="text-xs italic text-gray-500">No comments yet. Be the first.</p>
          )}

          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-2">
                {comment.user?.profilePicture ? (
                  <img
                    src={comment.user.profilePicture}
                    alt=""
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-500/40 text-[10px] font-bold text-gray-800">
                    {(comment.user?.name || comment.user?.username || "?").slice(0, 1)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800">
                    {comment.user?.name || comment.user?.username || "Unknown"}
                  </p>
                  <p className="text-sm break-words whitespace-pre-wrap text-gray-800">{comment.text}</p>
                </div>
                {comment.canDelete && (
                  <button
                    type="button"
                    onClick={() => removeComment.mutate(comment._id)}
                    disabled={removeComment.isPending}
                    aria-label="Delete comment"
                    className="no-drag shrink-0 rounded-full bg-black/10 p-1.5 text-black/70 transition-colors hover:bg-red-500/70 hover:text-white disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submitComment} className="no-drag flex items-center gap-2 px-4 pb-2">
        <input
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          disabled={!online || addComment.isPending}
          placeholder={online ? "Write a comment..." : "Comments need an internet connection"}
          className="min-w-0 flex-1 rounded-full bg-white/70 px-3 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!online || !commentText.trim() || addComment.isPending}
          aria-label="Post comment"
          className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-50"
        >
          <Send size={13} />
          Send
        </button>
      </form>

      <div className="drag-region px-4 pb-3 text-right">
        <span className="text-[11px] text-gray-600">
          {new Date(data.updatedAt ?? data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

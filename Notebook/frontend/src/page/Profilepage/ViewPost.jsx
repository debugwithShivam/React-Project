import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, FileText, Code2, Heart, Pencil, Globe, Lock, User } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";

const DEFAULTS = {
  content: "",
  html: "<!-- Write HTML -->",
  css: "/* Write CSS */",
  javascript: 'console.log("Hello")',
};

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(null);

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

  const likePost = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${VITE_API_URL}/authRouter/likePost/${id}`,
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const note = data?.note;
  const contentVal = note?.content ?? "";
  const htmlVal = note?.html ?? "";
  const cssVal = note?.css ?? "";
  const jsVal = note?.javascript ?? "";

  const availableTabs = useMemo(() => {
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
  }, [contentVal, htmlVal, cssVal, jsVal]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const contentMap = { content: contentVal, html: htmlVal, css: cssVal, javascript: jsVal };

  if (isLoading) {
    return (
      <div className="mx-5 my-4 flex min-h-[75vh] items-center justify-center rounded-xl bg-yellow-200">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-5 my-4 flex min-h-[75vh] flex-col items-center justify-center gap-4 rounded-xl bg-yellow-200">
        <p className="text-sm text-gray-700">
          {error?.response?.data?.message ?? "This post cannot be shown."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-black/10 px-4 py-1.5 text-sm text-gray-700 hover:bg-black/20"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-5 my-4 flex min-h-[75vh] flex-col overflow-hidden rounded-xl bg-gradient-to-b from-yellow-200 to-yellow-300 shadow-2xl">

      <div className="absolute -top-2 left-6 h-4 w-4 rotate-12 rounded-full bg-yellow-500 shadow-md" />

      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <button
          onClick={() => navigate(-1)}
          title="Close"
          aria-label="Close"
          className="rounded-full bg-yellow-100/70 p-1.5 transition hover:bg-yellow-100"
        >
          <X size={16} className="text-gray-700" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => likePost.mutate()}
            disabled={likePost.isPending}
            aria-label={data.likedByMe ? "Unlike post" : "Like post"}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
              data.likedByMe
                ? 'bg-red-500 text-white'
                : 'bg-yellow-100/70 text-gray-700 hover:bg-yellow-100'
            } disabled:opacity-50`}
          >
            <Heart size={14} className={data.likedByMe ? "fill-current" : ""} />
            {data.likeCount ?? 0}
          </button>

          {data.isOwner && note && (
            <button
              onClick={() => navigate(`/UpdateNotes/${note._id}`)}
              title="Edit"
              aria-label="Edit note"
              className="flex items-center gap-1.5 rounded-full bg-yellow-100/70 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-yellow-100"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-1">
        <h1 className="truncate text-base font-bold text-gray-900">
          {data.title || note?.title || data.caption || "Untitled"}
        </h1>
      </div>

      <div className="flex items-center gap-3 px-4 pb-2 text-xs text-gray-600">
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
        <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1">
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

      <div className="hide-scrollbar flex-1 overflow-auto px-4 pb-4">
        {!note && (
          data.mediaUrl
            ? <img src={data.mediaUrl} alt="" className="max-h-full w-full rounded-lg object-contain" />
            : <p className="text-sm text-gray-600">This post has no note content.</p>
        )}

        {note && activeTab && (
          activeTab === 'content'
            ? <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{contentMap[activeTab]}</p>
            : <pre className="rounded-lg bg-white/50 p-3 font-mono text-xs whitespace-pre-wrap text-gray-800">{contentMap[activeTab]}</pre>
        )}

        {note && availableTabs.length === 0 && (
          <p className="text-sm italic text-gray-500">This note is empty.</p>
        )}
      </div>

      <div className="px-4 pb-3 text-right">
        <span className="text-[11px] text-gray-600">
          {note?.updatedAt
            ? new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </div>
  );
}

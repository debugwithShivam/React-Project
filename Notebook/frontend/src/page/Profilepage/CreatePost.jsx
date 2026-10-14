import axios from "axios";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import {
    Globe,
    Image as ImageIcon,
    Lock,
    Notebook,
    Plus,
    Send,
    StickyNote,
    X,
} from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";
import { setPostDraftNoteId } from "../../Redux/Slice";

const NOTE_DEFAULTS = {
    content: "",
    html: "<!-- Write HTML -->",
    css: "/* Write CSS */",
    javascript: 'console.log("Hello")',
};

const CODE_FIELDS = [
    { key: "html", label: "HTML", language: "html" },
    { key: "css", label: "CSS", language: "css" },
    { key: "javascript", label: "JavaScript", language: "javascript" },
];

function isCustomNote(draft) {
    return Object.keys(NOTE_DEFAULTS).some(
        (key) => String(draft[key] ?? "").trim() !== NOTE_DEFAULTS[key]
    );
}

async function getMyNotes() {
    const response = await axios.get(`${VITE_API_URL}/authRouter/getNotes`, {
        withCredentials: true,
    });
    return response.data.data;
}

export default function CreatePost() {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const draftNoteId = useSelector((state) => state.state.postDraftNoteId);
    const [isOpen, setIsOpen] = useState(false);
    const [kind, setKind] = useState("image");
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState("");
    const [noteSource, setNoteSource] = useState("mine");
    const [noteId, setNoteId] = useState("");
    const [draft, setDraft] = useState(NOTE_DEFAULTS);
    const [saveToNotes, setSaveToNotes] = useState(true);
    const [online, setOnline] = useState(() => navigator.onLine);
    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [visibility, setVisibility] = useState("public");

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

    const { data: notesData, isLoading: notesLoading } = useQuery({
        queryKey: ["insertNotes"],
        queryFn: getMyNotes,
        enabled: isOpen,
    });
    const notes = notesData ?? [];

    // Opened straight from a note on the personal Notes page.
    useEffect(() => {
        if (!draftNoteId) return;
        setIsOpen(true);
        setKind("note");
        setNoteSource("mine");
        setNoteId(draftNoteId);
        dispatch(setPostDraftNoteId(null));
    }, [draftNoteId, dispatch]);

    useEffect(() => {
        if (!noteId) return;
        const note = notes.find((item) => String(item._id) === String(noteId));
        if (note) setTitle((current) => current || note.title || "");
    }, [notes, noteId]);

    const createPost = useMutation({
        mutationFn: async () => {
            const form = new FormData();
            form.append("title", title);
            form.append("caption", caption);
            form.append("visibility", visibility);
            if (kind === "image") {
                form.append("media", media);
            } else if (noteSource === "mine") {
                form.append("noteId", noteId);
            } else {
                form.append("noteContent", draft.content);
                form.append("noteHtml", draft.html);
                form.append("noteCss", draft.css);
                form.append("noteJavascript", draft.javascript);
                form.append("saveToNotes", saveToNotes ? "1" : "0");
            }

            const response = await axios.post(
                `${VITE_API_URL}/authRouter/createPost`,
                form,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["insertNotes"] });
            close();
        },
    });

    function close() {
        setIsOpen(false);
        setMedia(null);
        setNoteId("");
        setNoteSource("mine");
        setDraft(NOTE_DEFAULTS);
        setSaveToNotes(true);
        setTitle("");
        setCaption("");
        setVisibility("public");
        setKind("image");
        createPost.reset();
    }

    function handleMediaChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (preview) URL.revokeObjectURL(preview);
        setMedia(file);
        setPreview(URL.createObjectURL(file));
    }

    function pickNote(event) {
        const picked = event.target.value;
        const note = notes.find((item) => String(item._id) === String(picked));
        setNoteId(picked);
        setTitle(note?.title ?? "");
        setDraft({
            content: note?.content ?? "",
            html: note?.html ?? NOTE_DEFAULTS.html,
            css: note?.css ?? NOTE_DEFAULTS.css,
            javascript: note?.javascript ?? NOTE_DEFAULTS.javascript,
        });
    }

    const canSubmit =
        kind === "image" ? !!media : noteSource === "mine" ? !!noteId : isCustomNote(draft);

    const error = createPost.error
        ? createPost.error.response?.data?.message ||
          createPost.error.response?.data?.error?.message ||
          "Could not publish this post."
        : "";

    if (!isOpen) {
        return (
            <div className="flex justify-start px-1 pb-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 border border-white/10"
                >
                    <Plus size={16} />
                    New post
                </button>
            </div>
        );
    }

    return (
        <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                    New post
                </h3>
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="rounded-full bg-white/10 p-1.5 hover:bg-white/20"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="mt-3 flex gap-1 rounded-xl bg-white/5 p-1">
                {[
                    { id: "image", label: "Image", icon: ImageIcon },
                    { id: "note", label: "Note", icon: Notebook },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setKind(id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            kind === id
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {kind === "image" ? (
                <div className="mt-3 flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/25 px-4 py-3 text-sm text-white/70 hover:bg-white/10">
                        <ImageIcon size={16} />
                        {media ? media.name : "Choose an image"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleMediaChange}
                            className="hidden"
                        />
                    </label>
                    {preview && (
                        <img
                            src={preview}
                            alt=""
                            className="h-14 w-14 rounded-xl object-cover"
                        />
                    )}
                </div>
            ) : (
                <div className="mt-3">
                    <div className="mb-3 flex gap-1 rounded-xl bg-white/5 p-1">
                        {[
                            { id: "mine", label: "One of my notes" },
                            { id: "write", label: "Write a new note" },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setNoteSource(id)}
                                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    noteSource === id
                                        ? "bg-white/20 text-white"
                                        : "text-white/60 hover:text-white"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {noteSource === "mine" ? (
                        <>
                            <select
                                value={noteId}
                                onChange={pickNote}
                                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                            >
                                <option value="" className="bg-neutral-900">
                                    {notesLoading
                                        ? "Loading your notes..."
                                        : "Pick a note to publish"}
                                </option>
                                {notes.map((note) => (
                                    <option
                                        key={note._id}
                                        value={note._id}
                                        className="bg-neutral-900"
                                    >
                                        {note.title || "Untitled"}
                                    </option>
                                ))}
                            </select>
                            {!notesLoading && notes.length === 0 && (
                                <p className="mt-2 text-xs text-white/50">
                                    You have no notes yet — switch to "Write a new note" to post
                                    text, HTML, CSS or JavaScript straight from here.
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <p className="mb-1 text-xs text-white/50">Note text</p>
                                <textarea
                                    value={draft.content}
                                    rows={3}
                                    onChange={(event) =>
                                        setDraft({ ...draft, content: event.target.value })
                                    }
                                    placeholder="Write your note..."
                                    className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                                />
                            </div>

                            {CODE_FIELDS.map(({ key, label, language }) => (
                                <div key={key}>
                                    <p className="mb-1 text-xs text-white/50">{label}</p>
                                    {online ? (
                                        <div className="overflow-hidden rounded-xl border border-white/10">
                                            <Editor
                                                height="120px"
                                                language={language}
                                                theme="vs-dark"
                                                value={draft[key]}
                                                onChange={(value) =>
                                                    setDraft({ ...draft, [key]: value ?? "" })
                                                }
                                                options={{
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    fontSize: 12,
                                                    lineNumbers: "off",
                                                    folding: false,
                                                    scrollbars: { vertical: "auto" },
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <textarea
                                            value={draft[key]}
                                            rows={3}
                                            spellCheck={false}
                                            onChange={(event) =>
                                                setDraft({ ...draft, [key]: event.target.value })
                                            }
                                            className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-mono text-xs outline-none focus:border-indigo-400"
                                        />
                                    )}
                                </div>
                            ))}

                            {!online && (
                                <p className="text-xs text-amber-300/80">
                                    The code editor needs an internet connection, so these boxes
                                    are shown as plain text.
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {[
                                    { on: true, label: "Keep in my Notes", icon: StickyNote },
                                    { on: false, label: "Post only", icon: Send },
                                ].map(({ on, label, icon: Icon }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setSaveToNotes(on)}
                                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                            saveToNotes === on
                                                ? "bg-indigo-500 text-white"
                                                : "bg-white/10 text-white/60 hover:text-white"
                                        }`}
                                    >
                                        <Icon size={13} />
                                        {label}
                                    </button>
                                ))}
                                <p className="text-xs text-white/40">
                                    {saveToNotes
                                        ? "You can edit it later on the Notes page."
                                        : "It will not show up on your Notes page."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                placeholder="Write a title..."
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />

            <textarea
                value={caption}
                rows={2}
                maxLength={300}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Write a caption..."
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />

            <div className="mt-3 flex items-center gap-2">
                {[
                    { id: "public", label: "Public", icon: Globe },
                    { id: "private", label: "Only me", icon: Lock },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setVisibility(id)}
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            visibility === id
                                ? "bg-indigo-500 text-white"
                                : "bg-white/10 text-white/60 hover:text-white"
                        }`}
                    >
                        <Icon size={13} />
                        {label}
                    </button>
                ))}
            </div>

            {error && <p className="mt-3 text-sm text-red-300/80">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={close}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => createPost.mutate()}
                    disabled={!canSubmit || createPost.isPending}
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                    {createPost.isPending ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
}

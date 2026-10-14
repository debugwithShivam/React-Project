import cloudinary from "../../config/cloudinary.js";
import Post from "../../module/post.schema.js";
import Note from "../../module/sticky-note.schema.js";

function uploadBufferToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
}

const NOTE_DEFAULTS = {
    content: "",
    html: "<!-- Write HTML -->",
    css: "/* Write CSS */",
    javascript: 'console.log("Hello")',
};

function hasNoteContent(fields) {
    return Object.keys(NOTE_DEFAULTS).some(
        (key) => String(fields[key] ?? "").trim() !== NOTE_DEFAULTS[key]
    );
}

async function createPost(req, res) {
    try {
        const {
            caption = "",
            title = "",
            visibility,
            noteId,
            noteContent,
            noteHtml,
            noteCss,
            noteJavascript,
            saveToNotes,
        } = req.body ?? {};
        const mediaFile = req.file;

        const keepInPersonalNotes = !["0", "false"].includes(
            String(saveToNotes ?? "1").toLowerCase()
        );

        const inlineNoteFields = {
            content: noteContent,
            html: noteHtml,
            css: noteCss,
            javascript: noteJavascript,
        };
        const writesNewNote = !mediaFile && !noteId && hasNoteContent(inlineNoteFields);

        if (!mediaFile && !noteId && !writesNewNote) {
            return res.status(400).json({
                success: false,
                message: "Add an image, pick one of your notes, or write a note to post",
            });
        }

        if (visibility && !["public", "private"].includes(visibility)) {
            return res.status(400).json({
                success: false,
                message: "Visibility must be public or private",
            });
        }

        let note = null;
        if (!mediaFile && noteId) {
            note = await Note.findOne({
                _id: noteId,
                userId: req.user._id,
            });

            if (!note) {
                return res.status(404).json({
                    success: false,
                    message: "Note not found",
                });
            }
        }

        // A note written straight from the post box is saved as a normal
        // personal note too, so it stays editable after posting — unless the
        // user chose to post it without keeping a copy.
        if (writesNewNote && keepInPersonalNotes) {
            const hasText = String(inlineNoteFields.content ?? "").trim() !== "";
            const hasCode = hasNoteContent({
                content: "",
                html: inlineNoteFields.html,
                css: inlineNoteFields.css,
                javascript: inlineNoteFields.javascript,
            });

            note = await Note.create({
                userId: req.user._id,
                title: String(title).trim(),
                type: hasText && hasCode ? "Both" : hasCode ? "code" : "text",
                content: inlineNoteFields.content ?? "",
                html: inlineNoteFields.html ?? NOTE_DEFAULTS.html,
                css: inlineNoteFields.css ?? NOTE_DEFAULTS.css,
                javascript: inlineNoteFields.javascript ?? NOTE_DEFAULTS.javascript,
            });
        }

        let mediaUrl = null;
        if (mediaFile) {
            const mediaResult = await uploadBufferToCloudinary(
                mediaFile.buffer,
                {
                    resource_type: "image",
                    folder: "notebook-app/posts",
                }
            );

            mediaUrl = mediaResult.secure_url;
        }

        // A "post only" note has no personal note to point at, so the post keeps
        // the written text as its own copy.
        const snapshotSource =
            note ??
            (writesNewNote
                ? {
                    title: String(title).trim(),
                    content: inlineNoteFields.content ?? "",
                    html: inlineNoteFields.html ?? "",
                    css: inlineNoteFields.css ?? "",
                    javascript: inlineNoteFields.javascript ?? "",
                }
                : null);

        const post = await Post.create({
            userId: req.user._id,
            type: mediaUrl ? "image" : "note",
            caption: String(caption).trim(),
            title: String(title).trim() || snapshotSource?.title || "",
            mediaUrl,
            note: note?._id ?? null,
            noteSnapshot: snapshotSource
                ? {
                    title: snapshotSource.title ?? "",
                    content: snapshotSource.content ?? "",
                    html: snapshotSource.html ?? "",
                    css: snapshotSource.css ?? "",
                    javascript: snapshotSource.javascript ?? "",
                }
                : undefined,
            visibility: visibility === "private" ? "private" : "public",
        });

        return res.status(201).json({
            success: true,
            message: "Post created",
            data: { ...post.toObject(), note },
        });
    } catch (error) {
        console.error("Create post error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default createPost;

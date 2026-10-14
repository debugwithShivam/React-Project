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

async function createPost(req, res) {
    try {
        const { caption = "", title = "", visibility, noteId } = req.body ?? {};
        const mediaFile = req.file;

        if (!mediaFile && !noteId) {
            return res.status(400).json({
                success: false,
                message: "Add an image or pick one of your notes to post",
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
            }).select("_id title content");

            if (!note) {
                return res.status(404).json({
                    success: false,
                    message: "Note not found",
                });
            }
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

        const post = await Post.create({
            userId: req.user._id,
            type: mediaUrl ? "image" : "note",
            caption: String(caption).trim(),
            title: String(title).trim() || note?.title || "",
            mediaUrl,
            note: note?._id ?? null,
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

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Login",
            required: true,
        },

        type: {
            type: String,
            enum: ["image", "note"],
            default: "image",
        },

        caption: {
            type: String,
            default: "",
            trim: true,
        },

        title: {
            type: String,
            default: "",
            trim: true,
        },

        mediaUrl: {
            type: String,
            default: null,
            trim: true,
        },

        note: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note",
            default: null,
        },

        // Copy of the note taken at posting time, so a posted note keeps
        // showing even after the personal note is edited or deleted.
        noteSnapshot: {
            title: { type: String, default: "" },
            content: { type: String, default: "" },
            html: { type: String, default: "" },
            css: { type: String, default: "" },
            javascript: { type: String, default: "" },
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

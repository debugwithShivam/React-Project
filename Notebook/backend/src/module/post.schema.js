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

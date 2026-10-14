import mongoose from "mongoose";
import Post from "../../module/post.schema.js";
import PostComment from "../../module/postComment.schema.js";

async function addPostComment(req, res) {
    try {
        const postId = req.params.id;
        const text = String(req.body?.text ?? "").trim();

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.visibility === "private" && String(post.userId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "This post is private",
            });
        }

        const comment = await PostComment.create({
            post: postId,
            user: req.user._id,
            text,
        });

        await comment.populate("user", "_id name username profilePicture");

        const commentCount = await PostComment.countDocuments({ post: postId });

        return res.status(201).json({
            success: true,
            message: "Comment added",
            data: comment,
            commentCount,
        });
    } catch (error) {
        console.log("Add comment error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default addPostComment;

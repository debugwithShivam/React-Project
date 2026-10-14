import mongoose from "mongoose";
import Post from "../../module/post.schema.js";
import PostComment from "../../module/postComment.schema.js";

async function getPostComments(req, res) {
    try {
        const postId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const post = await Post.findById(postId).select("userId visibility");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const isOwner = String(post.userId) === String(req.user._id);

        if (post.visibility === "private" && !isOwner) {
            return res.status(403).json({
                success: false,
                message: "This post is private",
            });
        }

        const comments = await PostComment.find({ post: postId })
            .sort({ createdAt: 1 })
            .limit(100)
            .populate("user", "_id name username profilePicture");

        return res.status(200).json({
            success: true,
            data: comments.map((comment) => ({
                ...comment.toObject(),
                canDelete:
                    String(comment.user?._id) === String(req.user._id) || isOwner,
            })),
        });
    } catch (error) {
        console.log("Get comments error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getPostComments;

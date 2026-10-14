import mongoose from "mongoose";
import Post from "../../module/post.schema.js";
import PostComment from "../../module/postComment.schema.js";

async function deletePostComment(req, res) {
    try {
        const commentId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        const comment = await PostComment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        const post = await Post.findById(comment.post).select("userId");
        const isPostOwner = String(post?.userId ?? "") === String(req.user._id);

        if (String(comment.user) !== String(req.user._id) && !isPostOwner) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comment",
            });
        }

        await PostComment.deleteOne({ _id: commentId });

        const commentCount = await PostComment.countDocuments({ post: comment.post });

        return res.status(200).json({
            success: true,
            message: "Comment deleted",
            commentCount,
        });
    } catch (error) {
        console.log("Delete comment error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default deletePostComment;

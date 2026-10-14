import Post from "../../module/post.schema.js";

async function deletePost(req, res) {
    try {
        const deleted = await Post.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post deleted",
        });
    } catch (error) {
        console.error("Delete post error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default deletePost;

import mongoose from "mongoose";
import Post from "../../module/post.schema.js";
import PostLike from "../../module/postLike.schema.js";

async function getPostById(req, res) {
    try {
        const postId = req.params.id;
        const currentUserId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const post = await Post.findById(postId)
            .populate("note")
            .populate("userId", "_id name username profilePicture");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const isOwner = String(post.userId?._id ?? post.userId) === String(currentUserId);

        if (post.visibility === "private" && !isOwner) {
            return res.status(403).json({
                success: false,
                message: "This post is private",
            });
        }

        const [likeCount, likedByMe] = await Promise.all([
            PostLike.countDocuments({ post: postId }),
            PostLike.exists({ post: postId, user: currentUserId }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                ...post.toObject(),
                isOwner,
                likeCount,
                likedByMe: !!likedByMe,
            },
        });

    } catch (error) {
        console.log("Get post error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getPostById;

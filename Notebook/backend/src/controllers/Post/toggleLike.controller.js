import mongoose from "mongoose";
import Post from "../../module/post.schema.js";
import PostLike from "../../module/postLike.schema.js";

async function togglePostLike(req, res) {
    try {
        const postId = req.params.id;
        const currentUserId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const existingLike = await PostLike.findOne({
            post: postId,
            user: currentUserId,
        });

        if (existingLike) {
            await PostLike.deleteOne({ _id: existingLike._id });
        } else {
            await PostLike.create({
                post: postId,
                user: currentUserId,
            });
        }

        const liked = !existingLike;
        const likeCount = await PostLike.countDocuments({ post: postId });

        return res.status(200).json({
            success: true,
            liked,
            likeCount,
        });

    } catch (error) {
        console.log("Toggle like error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default togglePostLike;

import mongoose from "mongoose";
import userAuth from "../../module/User.js";
import Follow from "../../module/Follow.schema.js";
import Post from "../../module/post.schema.js";


async function getProfile(req, res) {
    try {
        const userId = req.params.userId || req.user._id;
        const isSelf = String(userId) === String(req.user._id);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = await userAuth.findById(userId).select(
            isSelf
                ? "_id name username email bio profilePicture"
                : "_id name username bio profilePicture"
        )

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const [followers, following, posts] = await Promise.all([
            Follow.find({
                following: userId,
            }).populate(
                    "follower",
                    "_id name username profilePicture"
                ),
            Follow.find({
                follower: userId,
            }).populate(
                    "following",
                    "_id name username profilePicture"
                ),
            Post.find({
                userId,
                ...(isSelf ? {} : { visibility: "public" }),
            })
                .sort({ createdAt: -1 })
                .limit(100)
                .populate("note", "_id title content type"),
        ]);

          return res.status(200).json({
            success: true,
            isSelf,
            user,
            stats: {
                followers: followers.length,
                following: following.length,
                posts: posts.length,
            },
            posts,
            followers: followers.map((item) => item.follower).filter(Boolean),
            following: following.map((item) => item.following).filter(Boolean),
        });

    } catch (error) {
        console.log("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getProfile

import mongoose from "mongoose";
import userAuth from "../../module/User.js";
import Follow from "../../module/Follow.schema.js";
import Post from "../../module/post.schema.js";
import PostLike from "../../module/postLike.schema.js";
import PostComment from "../../module/postComment.schema.js";


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
                .limit(100),
        ]);

        if (isSelf) {
            // The live note belongs to its owner only; other visitors see the
            // copy that was stored on the post.
            await Post.populate(posts, {
                path: "note",
                select: "_id title content html css javascript type createdAt",
            });
        }

        const postIds = posts.map((post) => post._id);

        const [likes, commentTotals] = await Promise.all([
            PostLike.find({
                post: { $in: postIds },
            }).select("post user"),
            PostComment.aggregate([
                { $match: { post: { $in: postIds } } },
                { $group: { _id: "$post", count: { $sum: 1 } } },
            ]),
        ]);

        const commentCountByPost = {};

        commentTotals.forEach((row) => {
            commentCountByPost[String(row._id)] = row.count;
        });

        const likeCountByPost = {};
        const likedByMe = new Set();

        likes.forEach((like) => {
            const key = String(like.post);
            likeCountByPost[key] = (likeCountByPost[key] ?? 0) + 1;

            if (String(like.user) === String(req.user._id)) {
                likedByMe.add(key);
            }
        });

        const postsWithLikes = posts.map((post) => ({
            ...post.toObject(),
            note: isSelf ? post.note : null,
            likeCount: likeCountByPost[String(post._id)] ?? 0,
            likedByMe: likedByMe.has(String(post._id)),
            commentCount: commentCountByPost[String(post._id)] ?? 0,
        }));

        const followerUsers = followers.map((item) => item.follower).filter(Boolean);
        const followingUsers = following.map((item) => item.following).filter(Boolean);

          return res.status(200).json({
            success: true,
            isSelf,
            user,
            stats: {
                followers: followerUsers.length,
                following: followingUsers.length,
                posts: posts.length,
            },
            posts: postsWithLikes,
            followers: followerUsers,
            following: followingUsers,
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

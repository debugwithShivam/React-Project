import userAuth from "../../module/User.js";
import Follow from "../../module/Follow.schema.js";


async function getProfile(req, res) {
    try {
        const userId = req.user._id

        const user = await userAuth.findById(userId).select("_id name username email")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const [followers, following] = await Promise.all([
            Follow.find({
                following: userId,
            }).populate(
                    "follower",
                    "_id name username"
                ),
            Follow.find({
                follower: userId,
            }).populate(
                    "following",
                    "_id name username"
                ),
        ]);

          return res.status(200).json({
            success: true,
            user,
            stats: {
                followers: followers.length,
                following: following.length,
            },
            followers: followers.map((item) => item.follower),
            following: following.map((item) => item.following),
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
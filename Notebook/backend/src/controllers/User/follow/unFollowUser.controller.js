import Follow from "../../../module/Follow.schema.js";

async function unFollowUser(req, res) {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;
        const deletedFollow = await Follow.findOneAndDelete({
            follower: followerId,
            following: followingId,
        })
        if (!deletedFollow) {
            return res.status(404).json({
                success: false,
                message: "You are not following this user",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User unfollowed successfully",
        });
    } catch (error) {
        console.log("Unfollow error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default unFollowUser
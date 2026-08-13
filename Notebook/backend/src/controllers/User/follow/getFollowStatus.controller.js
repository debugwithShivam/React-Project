import Follow from "../../../module/Follow.schema.js";

async function getFollowStatus(req, res) {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;
        console.log("hello",followingId)

        const follow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

         return res.status(200).json({
            success: true,
            following: Boolean(follow),
        });

    } catch (error) {
        console.log("Follow status error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getFollowStatus
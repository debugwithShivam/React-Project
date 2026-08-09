import Follow from "../../../module/Follow.schema.js";
import userAuth from "../../../module/User.js";

async function followUser(req, res) {
    try {
        const followerId = req.user._id;
        const followingId = req.params.userId;

        if (followerId.toString() === followingId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot Follow ypurself",
            })
        }

        const user = await userAuth.findById(followingId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId,
        });

        if (existingFollow) {
            return res.status(409).json({
                success: false,
                message: "Already following this user",
            });
        }

        const follow = await Follow.create({
            follower: followerId,
            following: followingId,
        })

        return res.status(201).json({
            success: true,
            message: "User followed successfully",
            data: follow,
        });

    } catch (error) {
        console.log("Follow user error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default followUser
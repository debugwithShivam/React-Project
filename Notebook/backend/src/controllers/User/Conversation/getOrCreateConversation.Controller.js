import userAuth from "../../../module/User.js";
import Follow from "../../../module/Follow.schema.js";
import Conversation from "../../../module/Conversation.Schema.js";

async function getOrCreateConversation(req, res) {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: "User Id is required",
            });
        }

        if (String(currentUserId) === String(otherUserId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot chat with yourself",
            });
        }

        const otherUser = await userAuth.findById(otherUserId);

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isFollowing = await Follow.findOne({
            follower: currentUserId,
            following: otherUserId,
        });

        if (!isFollowing) {
            return res.status(403).json({
                success: false,
                message: "You can only chat with users you follow",
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [currentUserId, otherUserId],
            },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    currentUserId,
                    otherUserId,
                ],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation ready",
            data: conversation,
        });

    } catch (error) {
        console.log(
            "Get/Create conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getOrCreateConversation;
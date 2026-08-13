import Conversation from "../../../module/Conversation.Schema.js";
import Message from "../../../module/Message.Schema.js";

async function getMessages(req, res) {
    try {
        const currentUserId = req.user._id;
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation Id is required",
            });
        }

        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const isParticipant = conversation.participants.some(
            (participantId) =>
                String(participantId) === String(currentUserId)
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation",
            });
        }

        const messages = await Message.find({
            conversation: conversationId,
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name username")
            .populate("receiver", "name username");

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages,
        });

    } catch (error) {
        console.log(
            "Get messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getMessages;
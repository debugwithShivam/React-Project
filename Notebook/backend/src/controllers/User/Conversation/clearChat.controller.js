import mongoose from "mongoose";
import Message from "../../../module/Message.Schema.js";
import Conversation from "../../../module/Conversation.Schema.js";

async function clearChat(req, res) {
    try {
        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation id",
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const isParticipant = conversation.participants.some(
            (participantId) => String(participantId) === String(req.user._id)
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not part of this conversation",
            });
        }

        await Message.deleteMany({ conversation: conversationId });

        conversation.lastMessage = null;
        conversation.lastMessageAt = null;
        await conversation.save();

        return res.status(200).json({
            success: true,
            message: "Chat cleared",
        });
    } catch (error) {
        console.log("Clear chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default clearChat;

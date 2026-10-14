import mongoose from "mongoose";
import Message from "../../../module/Message.Schema.js";
import Conversation from "../../../module/Conversation.Schema.js";

async function deleteMessage(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message id",
            });
        }

        const message = await Message.findOneAndDelete({
            _id: id,
            sender: req.user._id,
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "You can only delete your own messages",
            });
        }

        // The preview shown in the conversation list must not point at the
        // message that was just removed.
        const conversation = await Conversation.findById(message.conversation);

        if (conversation && String(conversation.lastMessage ?? "") === String(id)) {
            const newest = await Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 });

            conversation.lastMessage = newest?._id ?? null;
            conversation.lastMessageAt = newest?.createdAt ?? null;
            await conversation.save();
        }

        return res.status(200).json({
            success: true,
            message: "Message deleted",
        });
    } catch (error) {
        console.log("Delete message error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default deleteMessage;

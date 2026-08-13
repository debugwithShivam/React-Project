import Conversation from "../../../module/Conversation.Schema.js";
import Message from "../../../module/Message.Schema.js";
import userAuth from "../../../module/User.js";


async function sendMessage(req, res) {
    try {
        const currentUserId = req.user._id
        const { conversationId, receiverId, content, } = req.body;

        if (!conversationId || !receiverId || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Conversation, receiver and message are required",
            });
        }

        const receiver = await userAuth.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found",
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

        const receiverIsParticipant = conversation.participants.some(
            (participantId) =>
                String(participantId) === String(receiverId)
        )

        if (!receiverIsParticipant) {
            return res.status(403).json({
                success: false,
                message: "Receiver is not part of this conversation",
            });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: currentUserId,
            receiver: receiverId,
            content: content.trim(),
        });

        await message.populate([
            {
                path: "sender",
                select: "name username",
            },
            {
                path: "receiver",
                select: "name username",
            },
        ]);

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();

        await conversation.save();

        const io = req.app.get("io");
        if (io) {
            io.to(String(receiverId)).emit("newMessage", {
                conversationId: String(conversationId),
                message,
            });
        }


        return res.status(201).json({
            success: true,
            message: "Message sent",
            data: message,
        });
    } catch (error) {
        console.log(
            "Send message error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default sendMessage;
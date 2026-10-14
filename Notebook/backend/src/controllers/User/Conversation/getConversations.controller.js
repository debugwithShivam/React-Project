import Conversation from "../../../module/Conversation.Schema.js";
import Message from "../../../module/Message.Schema.js";

async function getConversations(req, res) {
    try {
        const currentUserId = req.user._id;

        const [conversations, unread] = await Promise.all([
            Conversation.find({ participants: currentUserId })
                .sort({ lastMessageAt: -1, updatedAt: -1 })
                .limit(100)
                .populate("lastMessage", "content sender createdAt")
                .populate("participants", "_id name username profilePicture"),

            Message.aggregate([
                {
                    $match: {
                        receiver: currentUserId,
                        readAt: null,
                    },
                },
                {
                    $group: {
                        _id: "$conversation",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const unreadByConversation = new Map(
            unread.map((item) => [String(item._id), item.count])
        );

        const data = conversations
            .map((conversation) => {
                const other = conversation.participants.find(
                    (participant) =>
                        String(participant._id) !== String(currentUserId)
                );

                if (!other) {
                    return null;
                }

                return {
                    conversationId: String(conversation._id),
                    user: other,
                    lastMessage: conversation.lastMessage
                        ? {
                              content: conversation.lastMessage.content,
                              sender: conversation.lastMessage.sender,
                              createdAt: conversation.lastMessage.createdAt,
                          }
                        : null,
                    lastMessageAt: conversation.lastMessageAt,
                    unreadCount:
                        unreadByConversation.get(String(conversation._id)) ?? 0,
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            data,
        });
    } catch (error) {
        console.log("Get conversations error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getConversations;

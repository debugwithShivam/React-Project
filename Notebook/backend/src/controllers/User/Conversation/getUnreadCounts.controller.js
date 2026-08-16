import Message from "../../../module/Message.Schema.js";

async function getUnreadCounts(req, res) {
    try {
        const currentUserId = req.user._id;

        const unread = await Message.aggregate([
            {
                $match: {
                    receiver: currentUserId,
                    readAt: null,
                },
            },

            {
                $group: {
                    _id: {
                        conversation: "$conversation",
                        sender: "$sender",
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]);

        const total = unread.reduce(
            (sum, item) => sum + item.count,
            0
        );

        return res.status(200).json({
            success: true,
            total,
            data: unread,
        });

    } catch (error) {
        console.log("Unread count error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default getUnreadCounts;
import userAuth from "../../module/User.js";

async function searchUsers(req, res) {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.status(200).json({
                success: true,
                message: "Search Query is empty",
                data: []
            })
        }

        const searchQuery = q.trim();
        const users = await userAuth.find({
            _id: {
                $ne: req.user.id
            },
            $or: [
                {
                    name: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                },
                {
                    username: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            ]
        }).select("_id name username")

         return res.status(200).json({
            success: true,
            message: "Users found",
            data: users
        });

    } catch (error) {
        console.log("Search users error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

export default searchUsers
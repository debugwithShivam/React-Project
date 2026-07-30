import { productOrder } from "../db/dataBase.js";

function getCartProductdata(req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const query = "SELECT * FROM CartOrders WHERE user_id = ?";

        productOrder.query(query, [userId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            return res.status(200).json({ data: result });
        });

    } catch (error) {
        return res.status(500).json({
            message: "Request Failed",
            error
        });
    }
}

export default getCartProductdata;
import { productOrder } from "../db/dataBase.js"

function cartProduct(req, res) {
    const { product_id, quantity, product_name, product_price, image, category } = req.body
    const userId = req.user?.id

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const query = "INSERT INTO CartOrders(user_id,product_id,quantity,product_name,product_price,image,category)VALUES (?,?,?,?,?,?,?)"
    productOrder.query(query, [userId, product_id, quantity, product_name, product_price, image, category], (err, result) => {
        if (err) {
            
            return res.status(500).json(err)
        }

        return res.status(201).json({
            message: "Account created", data: result
        });
    })
}

export default cartProduct
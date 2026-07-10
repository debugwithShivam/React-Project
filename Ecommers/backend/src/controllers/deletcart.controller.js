import { productOrder } from "../db/dataBase.js";

function deleteOrder(req, res) {
    let {product_id}=req.body
    try {
        const query = "delete from  CartOrders where product_id = ?;";
        productOrder.query(query,[product_id], (err, result) => {
            if (err) {
                console.log("MYSQL ERROR:", err);
                return res.status(500).json({ error: err });
            }
            console.log('2')

            return res.status(200).json({ data: result });
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Request Failed",
            error
        });
    }
}

export default deleteOrder;
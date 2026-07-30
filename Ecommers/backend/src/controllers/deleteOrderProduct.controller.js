    import { Buyproduct } from "../db/dataBase.js";

    function deleteBuyOrder(req, res) {
        let {order_id}=req.body
        console.log(order_id)
        try {
            const query = "delete from  orderBuy where order_id = ?;";
            Buyproduct.query(query,[order_id], (err, result) => {
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

    export default deleteBuyOrder;
import cron from "node-cron";
import { Buyproduct } from "../db/dataBase.js";

cron.schedule("* * * * *", () => {

    console.log("Cron Running");

    Buyproduct.query(
        "SELECT order_id, orderTrack FROM orderBuy WHERE orderTrack < 5",
        (err, orders) => {

            if (err) {
                return console.log(err);
            }

            orders.forEach((item) => {

                Buyproduct.query(
                    "UPDATE orderBuy SET orderTrack= ? WHERE order_id= ?",
                    [item.orderTrack + 1, item.order_id],
                    (err) => {
                        if (err) console.log(err);
                    }
                );

            });

        }
    );

});
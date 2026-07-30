import { Buyproduct } from "../db/dataBase.js";

function BuyProducts(req, res) {
  let {
    username,
    product_id,
    quantity,
    product_name,
    product_price,
    catogary,
    image,
    address_line2,
    city,
    state,
    payment_method,
    pin_code,
    email_Address,
    Phone_number
  } = req.body

  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let query = "INSERT INTO orderBuy (user_id,username,product_id,quantity,product_name,product_price,catogary,image,address_line2,city,state,payment_method,pin_code,email_Address,Phone_number)VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"

  Buyproduct.query(query, [userId, username, product_id, quantity, product_name, product_price, catogary, image, address_line2, city, state, payment_method, pin_code, email_Address, Phone_number], (err, result) => {
    if (err) {
      
      return res.status(500).json(err)
    }

    return res.status(201).json({
      message: "Order placed successfully"
    });
  })
}

export default BuyProducts
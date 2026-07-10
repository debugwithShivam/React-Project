import allProducts from "../config/config.js";
import {productsDb} from '../db/dataBase.js'

export default async function insertproduct(req,res){

    allProducts.forEach((product) => {
        const query = 'INSERT INTO productsTable (title, name, description, rating, price, offer, image, category, brand, stock, delivery, size, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
       productsDb.query(query, [
            product.title,
            product.name,
            product.description,
            product.rating,
            product.price,
            product.offer,
            product.image,
            product.category,
            product.brand,
            product.stock,
            product.delivery,
            product.size ? JSON.stringify(product.size) : null,
            product.color ? JSON.stringify(product.color) : null
        ], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("INSERT FILE RUNNING");
                console.log("Inserted:", product.image);
            }
        })
    })
}


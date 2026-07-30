import { productsDb } from "../db/dataBase.js";
import config from "../config/config.js";

export default function getproductController(req,res) {
    try{
        const query = "select * from productsTable "
        productsDb.query(query,(err,result)=>{
               if (err) {
                return res.status(500).json(err)
            };
            res.status(201).json({data:result})
        })
    }catch(err){
        res.status(401).json({message:"Product Not found"})
    }
}

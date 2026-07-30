import jwt from "jsonwebtoken";
import config from "../config/config.js";
import {db} from "../db/dataBase.js";

export default async function checkAuth(req,res) {
    let token = req.cookies.accesstOKEN;
    console.log(token)
    if(!token){
       return res.status(401).json({message:"Token is not Found"})
    }

    jwt.verify(token,config.ACCESSTOKEN,(err,user)=>{
        if(err){
              return res.status(403).json({ authenticated: false });
        }

        let query = 'SELECT id, firstName, lastName ,email FROM  users WHERE id = ?'
        db.query(query,[user.id],(err,result)=>{
            if (err || result.length === 0) {
                return res.status(404).json({ authenticated: false });
            }
            res.json({ authenticated: true, user: result[0] });
        })
    })

}
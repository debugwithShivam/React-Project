import jwt from 'jsonwebtoken';
import config from '../config/EVConfig.js';

function CheckToken(req,res,next){
    let token = req.cookies?.ACCESSTOKEN 

    if(!token){
        return res.status(401).json({message: 'No token, authorization denied'})
    }

    try{
        const decode = jwt.verify(token,config.ACCESSTOKEN);
        req.user = decode
        next()
    }catch(err){
         return res.status(403).json({ message: 'Token is not valid' });
    }
}
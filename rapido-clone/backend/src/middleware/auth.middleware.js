import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js';

export const authenticateUser  = (req,res,next) => {
    try{
        const authHeader = req.headers.authorization

        if(!authHeader){
            return res.status(401).json({
                success:false,
                message:'Authorization header is required'
            })
        }

        const [type,token] = authHeader.split(' ');

        if(type !== 'Bearer' || !token){
            return res.status(401).json({
                success:false,
                message:"Invalid authorization format",
            })
        }

        const decoded = jwt.verify(
            token,
            envConfig.ACCESS_TOKEN_SECRET
        )

        req.user = decoded

        next()

    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Invalid or expired access token",
            error:error.message
        })
    }
}

export const requireRole = (...allowedRole) => {
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({   
                success:false,
                message:"User is not authenticated"
            })
        }
        if(!allowedRole.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:"You do not have paermission to access this resource"
            })
        }
        next()
    }
}

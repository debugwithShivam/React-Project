import jwt from 'jsonwebtoken'
import envConfig from '../config/envConfig.js';


export const authenticateUser = (req, res, next) => {
    try {

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = jwt.verify(
            accessToken,
            envConfig.ACCESS_TOKEN_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token'
        });
    }
};


export const requireRole = (...allowedRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User is not authenticated'
            });
        }
        if (!allowedRole.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }
        next();
    };
};
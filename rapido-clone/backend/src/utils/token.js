import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig.js';

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            user: user.id,
            role: user.role
        },
        envConfig.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '15m'
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user: user.id
        },
        envConfig.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '7d'
        }
    );
};
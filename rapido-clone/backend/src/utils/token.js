import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig.js';

const JWT_ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY = '30m';

const baseClaims = (userId, role) => ({
    sub: String(userId),
    user: String(userId),
    role,
    iat: Math.floor(Date.now() / 1000),
});

export const generateAccessToken = (userId, role) => {
    return jwt.sign(
        baseClaims(userId, role),
        envConfig.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
            algorithm: JWT_ALGORITHM,
        }
    );
};

export const generateRefreshToken = (userId, role) => {
    return jwt.sign(
        baseClaims(userId, role),
        envConfig.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY,
            algorithm: JWT_ALGORITHM,
        }
    );
};

export const generatePasswordResetToken = (userId, role) => {
    return jwt.sign(
        {
            ...baseClaims(userId, role),
            purpose: 'password_reset',
        },
        envConfig.PASSWORD_RESET_TOKEN_SECRET,
        {
            expiresIn: RESET_TOKEN_EXPIRY,
            algorithm: JWT_ALGORITHM,
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET, { algorithms: [JWT_ALGORITHM] });
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, envConfig.REFRESH_TOKEN_SECRET, { algorithms: [JWT_ALGORITHM] });
};

export const verifyPasswordResetToken = (token) => {
    return jwt.verify(token, envConfig.PASSWORD_RESET_TOKEN_SECRET, { algorithms: [JWT_ALGORITHM] });
};
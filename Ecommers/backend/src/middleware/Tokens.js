import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { db } from '../db/dataBase.js';

async function tookenChecker(req, res, next) {
    const accessToken = req.cookies?.accesstOKEN || req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, config.ACCESSTOKEN);
            req.user = decoded;
            req.accessToken = accessToken;
            req.cookies.accesstOKEN = accessToken;
            return next();
        } catch (error) {
            if (!(error instanceof jwt.JsonWebTokenError) && !(error instanceof jwt.TokenExpiredError)) {
                console.log(error)
                return res.status(401).json({ message: 'Invalid token' });
            }
        }
    }

    if (!refreshToken) {
        return res.status(401).json({ message: 'Access token expired. Please login again.' })
    }

    try {
        const refreshPayload = jwt.verify(refreshToken, config.REFRESHSECRET);
        const [rows] = await db.promise().query(
            'SELECT id, firstName, lastName, email FROM users WHERE id = ?',
            [refreshPayload.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found. Please login again.' });
        }

        const user = rows[0];
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email },
            config.ACCESSTOKEN,
            { expiresIn: '2d' }
        );

        res.cookie('accesstOKEN', newAccessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 2 * 24 * 60 * 60 * 1000,
            path: '/',
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });

        req.user = { id: user.id, email: user.email };
        req.accessToken = newAccessToken;
        req.cookies.accesstOKEN = newAccessToken;
        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        return res.status(500).json({ message: 'Token refresh failed' });
    }
}

export default tookenChecker
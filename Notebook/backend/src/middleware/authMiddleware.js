import jwt from 'jsonwebtoken'
import config from '../config/EVConfig.js';
import userAuth from '../module/User.js';

async function tookenChecker(req, res, next) {

    const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refreshToken;

    console.log("Origin:", req.headers.origin);
    console.log("Cookies:", req.cookies);
    console.log("Authorization:", req.headers.authorization);

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, config.ACCESSTOKEN);
            const user = await userAuth.findById(decoded.id)

            if (!user) {
                return res.status(401).json({
                    message: "User not found",
                });
            }

            req.user = user;

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
        const refreshPayload = jwt.verify(refreshToken, config.REFRESHTOKEN);


        const user = await userAuth.findById(refreshPayload.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email },
            config.ACCESSTOKEN,
            { expiresIn: '2d' }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 2 * 24 * 60 * 60 * 1000,
            path: '/',
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });

        req.user = { id: user.id, email: user.email };
        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        return res.status(500).json({ message: 'Token refresh failed' });
    }
}

export default tookenChecker
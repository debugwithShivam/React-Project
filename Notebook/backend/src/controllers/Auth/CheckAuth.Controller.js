import jwt from 'jsonwebtoken'
import userAuth from '../../module/User.js';
import config from '../../config/EVConfig.js';

async function checkAuth(req, res, next) {
    console.log("Cookies:", req.cookies);
    console.log("Header Cookie:", req.headers.cookie);

    const token = req.cookies.accessToken;
    console.log("Token:", token);

    try {
        const decoded = jwt.verify(token, config.ACCESSTOKEN);
        console.log("Decoded:", decoded);

        const user = await userAuth.findById(decoded.id);
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({
                authenticated: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);

        return res.status(401).json({
            authenticated: false,
            message: err.message,
        });
    }
}

export default checkAuth
import jwt from 'jsonwebtoken'
import userAuth from '../../module/User.js';
import config from '../../config/EVConfig.js';
import generateToken from '../../utils/generateToken.js';

async function checkAuth(req, res, next) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;


    if (!refreshToken) {
        return res.status(401).json({
            authenticated: false,
            message: "No token provided"
        });
    }



    try {
        const decoded = jwt.verify(accessToken, config.ACCESSTOKEN);

        console.log('1')
        const user = await userAuth.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                authenticated: false,
                message: "User not found",
            });
        }


        req.user = user;
        next();
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).json({
                authenticated: false,
                message: "Refresh Token Missing"
            });
        }

        try {
            const refreshDecoded = jwt.verify(
                refreshToken,
                config.REFRESHTOKEN
            );
            const user = await userAuth.findById(refreshDecoded.id);
            if (!user) {
                return res.status(404).json({
                    authenticated: false,
                    message: "User not found"
                });
            }
            const newAccessToken = generateToken(
                user._id,
                "ACCESSTOKEN"
            );

            
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 2 * 24 * 60 * 60 * 1000
            });

            req.user = user;

            return next();
        } catch (refreshError) {
            return res.status(401).json({
                authenticated: false,
                message: "Refresh Token Expired"
            });
        }

    }
}

export default checkAuth
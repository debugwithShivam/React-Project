import generateToken from '../../utils/generateToken.js'
import userAuth from '../../module/User.js';

async function verifyOtp(req, res) {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await userAuth.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        if (new Date() > user.otpExpire) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            });
        }

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;

        await user.save();

        let accessToken = generateToken(user._id, "ACCESSTOKEN")
        let refreshToken = generateToken(user._id, "REFRESHTOKEN")

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Email Verified",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })



    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

export default verifyOtp
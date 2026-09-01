import generateToken from "../../utils/generateToken.js";
import userAuth from "../../module/User.js";
import { hashOtp } from "../../utils/otp.js";


async function verifyOtp(req, res) {

    try {

        const {
            email,
            otp
        } = req.body;



        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }


        const normalizedEmail =
            email.trim().toLowerCase();



        const user = await userAuth.findOne({
            email: normalizedEmail
        });


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }



        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message:
                    "Email already verified"
            });
        }



        if (!user.otp || !user.otpExpire) {
            return res.status(400).json({
                success: false,
                message:
                    "No active OTP. Please request a new OTP."
            });
        }



        if (
            Date.now() >
            new Date(user.otpExpire).getTime()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new one."
            });
        }



        const incomingOtpHash =
            hashOtp(String(otp));



        if (
            incomingOtpHash !== user.otp
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }



        user.isVerified = true;

        user.otp = null;

        user.otpExpire = null;


        await user.save();




        const accessToken =
            generateToken(
                user._id,
                "ACCESSTOKEN"
            );

        const refreshToken =
            generateToken(
                user._id,
                "REFRESHTOKEN"
            );



        res.cookie(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                sameSite: "none",
                secure: true,
                path: "/",
                maxAge:
                    2 *
                    24 *
                    60 *
                    60 *
                    1000
            }
        );


        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                sameSite: "none",
                secure: true,
                path: "/",
                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000
            }
        );


        // -----------------------------
        // 11. Response
        // -----------------------------

        return res.status(200).json({
            success: true,

            message:
                "Email verified successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });


    } catch (error) {

        console.error(
            "verifyOtp error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to verify OTP"
        });
    }
}


export default verifyOtp;
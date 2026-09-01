import userAuth from "../../module/User.js";
import registerUser from "../../utils/HashingPassword.js";
import { generateOtp, hashOtp } from "../../utils/otp.js";
import { sendOtpEmail } from "../../services/email.service.js";

async function authorization(req, res) {

    try {

        const {
            name,
            username,
            email,
            password
        } = req.body;

        console.log("CREATE ACCOUNT:", email);


        // -------------------------
        // Validate
        // -------------------------

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        // -------------------------
        // Normalize
        // -------------------------

        const normalizedName =
            name.trim();

        const normalizedUsername =
            username.trim().toLowerCase();

        const normalizedEmail =
            email.trim().toLowerCase();


        // -------------------------
        // Check existing user
        // -------------------------

        const existingUser = await userAuth.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        });


        if (existingUser) {

            if (existingUser.isVerified) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Email or username already registered"
                });
            }


            // User exists but isn't verified
            const otp = generateOtp();

            const otpHash = hashOtp(otp);

            const otpExpire = new Date(
                Date.now() + 10 * 60 * 1000
            );


            await sendOtpEmail({
                to: normalizedEmail,
                otp,
                name: normalizedName
            });


            existingUser.otp = otpHash;
            existingUser.otpExpire = otpExpire;

            await existingUser.save();


            return res.status(200).json({
                success: true,
                message:
                    "A new OTP has been sent to your email"
            });
        }


        // -------------------------
        // Generate OTP
        // -------------------------

        const otp = generateOtp();

        const otpHash = hashOtp(otp);

        const otpExpire = new Date(
            Date.now() + 10 * 60 * 1000
        );


        console.log("OTP generated");


        // -------------------------
        // Hash password
        // -------------------------

        const hashedPassword =
            await registerUser(password);


        // -------------------------
        // Create user
        // -------------------------

        const user = await userAuth.create({

            name: normalizedName,

            username: normalizedUsername,

            email: normalizedEmail,

            password: hashedPassword,

            otp: otpHash,

            otpExpire: otpExpire,

            isVerified: false

        });


        console.log(
            "USER CREATED:",
            user._id
        );


        // -------------------------
        // Send OTP
        // -------------------------

        try {

            await sendOtpEmail({
                to: normalizedEmail,
                otp,
                name: normalizedName
            });

        } catch (emailError) {

            console.error(
                "OTP EMAIL ERROR:",
                emailError
            );


            // Delete newly created user
            await userAuth.findByIdAndDelete(
                user._id
            );


            return res.status(503).json({
                success: false,
                message:
                    "Unable to send verification email"
            });
        }


        // -------------------------
        // Success
        // -------------------------

        return res.status(201).json({
            success: true,
            message:
                "Account created. OTP sent to your email."
        });


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "CREATE ACCOUNT ERROR:"
        );

        console.error(error);

        console.error(
            "================================"
        );


        if (error?.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    "Email or username already exists"
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Unable to create account"
        });
    }
}


export default authorization;
import userAuth from "../../module/User.js";
import generateToken from "../../utils/generateToken.js";
import verifyPassword from "../../utils/verifyPassword.js";


async function singIn(req, res) {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const user = await userAuth.findOne({ email })

        console.log(user)
        if (!user) {
            return res.status(401).json({
                message: "Invaild email or password"
            })
        }
        
        const isPasswordCorrect = await verifyPassword(password, user.password)
        console.log(isPasswordCorrect)
        
        if (!isPasswordCorrect) {
            return res.status(402).json({
                message: "Invaild email or password"
            })
        }
        
        let accessToken = generateToken(user._id, "ACCESSTOKEN")
        let refreshToken = generateToken(user._id, "REFRESHTOKEN")
        console.log(1)

        res.cookie("accessToken", accessToken, {
            httpOnly: false,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: false,
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
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
}


export default singIn
import config from "../../config/EVConfig.js";
import userAuth from "../../module/User.js";
import registerUser from "../../utils/HashingPassword.js";
import { generateOtp, hashOtp } from "../../utils/otp.js";
import { sendOtpEmail } from "../../services/email.service.js";




async function authorization(req, res) {
  const { name, username, email, password } = req.body
  console.log(email)

  if (!name || !email || !password || !username) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }


  try {
    const normalizedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userAuth.findOne({
      $or: [
        { email: normalizedUsername },
        { username: normalizedEmail }
      ]
    })

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "Email or username already registered",
        });
      }
      const otp = generateOtp();
      const otpHash = hashOtp(otp)

      await sendOtpEmail({
        to: normalizedEmail,
        otp,
        name: normalizedName
      })

      existingUser.otp = otpHash;
      existingUser.otpExpire = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "A new OTP has been sent to your email",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const hashedPassword =
      await registerUser(password);

    await userAuth.create(
      {
        name: name.trim(),
        username: normalizedUsername.trim(),
        email: normalizedEmail.trim(),
        password: hashedPassword.trim(),
        otp: OtpGen,
        otpExpire: otpExpire,
        isVerified: false
      }
    )


    try {
      await sendOtpEmail({
        to: normalizedEmail,
        otp,
        name:normalizedName
      });
    } catch (emailError) {

      await userAuth.findByIdAndDelete(user._id);

      console.error(
        "OTP email failed:",
        emailError
      );

      return res.status(503).json({
        success: false,
        message: "Unable to send verification email. Please try again.",
      });
    }


    return res.status(201).json({
      success: true,
      message: "Account created. OTP sent to your email.",
    });

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    console.error("createAccount error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
}



export default authorization
import config from "../../config/EVConfig.js";
import userAuth from "../../module/User.js";
import registerUser from "../../utils/HashingPassword.js";
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.EMAIL,
        pass: config.PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("SMTP is ready");
  }
});



async function authorization(req, res) {
  const { name, username, email, password } = req.body
  console.log(email)

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }


  try {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userAuth.findOne({
      $or: [
        { email:normalizedUsername },
        { username:normalizedEmail }
      ]
    })

    if (existingUser) {
      if (existingUser.email === normalizedUsername) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }

      if (existingUser.username === normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
          username:"Username is already exists"
        });
      }
    }

    const OtpGen = Math.floor(100000 + Math.random() * 900000)
    const hashedPassword = await registerUser(password)
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000)

    await userAuth.create(
      {
        name:name.trim(),
        username: normalizedUsername.trim(),
        email: normalizedEmail.trim(),
        password: hashedPassword.trim(),
        otp: OtpGen,
        otpExpire: otpExpire,
        isVerified: false
      }
    )


    await transporter.sendMail({
      from: config.EMAIL,
      to: email,
      subject: "Email Verification",
      html: `
          <div style="max-width:450px;margin:40px auto;background:#ffffff;
          border-radius:16px;box-shadow:0 8px 25px rgba(0,0,0,0.08);
          overflow:hidden;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
          border:1px solid #e5e7eb;">
          
          <div style="background:#2563eb;padding:25px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;">
          📒 Notebook
          </h1>
          <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">
          Secure OTP Verification
          </p>
          </div>
          
          <div style="padding:35px;text-align:center;">
          
          <h2 style="margin:0 0 15px;color:#1f2937;font-size:24px;">
          <p>Hello <strong>${name}</strong>,</p>
          </h2>
          
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin-bottom:25px;">
          Use the One-Time Password (OTP) below to complete your verification.
          </p>
          
          <div style="display:inline-block;
          background:#f8fafc;
          border:1.5px dashed #2563eb;
          border-radius:12px;
          padding:15px 20px;
          margin-bottom:25px;">
          
          <span
          style="
          font-size:27px;
          font-weight:bold;
          color:#2563eb;
          letter-spacing:8px;
          ">
          Your Notebook verification code is:
          ${OtpGen}
          
          </span>
          
          </div>
          
          <p style="margin:0;color:#ef4444;font-size:14px;font-weight:600;">
          ⏱ Expires in 5 minutes
          </p>
          
          <p style="margin-top:25px;
          color:#6b7280;
          font-size:14px;
          line-height:1.6;">
          If you didn't request this verification, you can safely ignore this email.
          </p>
          
          </div>
          
          <div style="background:#f9fafb;
          padding:18px;
          text-align:center;
          border-top:1px solid #e5e7eb;">
          
          <p style="margin:0;
          color:#9ca3af;
          font-size:13px;">
          © 2026 <strong>Notebook</strong>. All Rights Reserved.
          </p>
          
          </div>
          
          </div>
          `
    })
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}



export default authorization
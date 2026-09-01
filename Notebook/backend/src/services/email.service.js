import { Resend } from "resend";
import config from "../config/EVConfig.js";

const resend = new Resend(config.RESENDAPI);

export async function sendOtpEmail({ to, otp, name }) {
    try {
        const { data, error } = await resend.emails.send({
            from: config.EMAIL,
            to: [to],
            subject: "Your Notebook Verification Code",

            html: `
                <!DOCTYPE html>
                <html>
                <body style="
                    margin:0;
                    padding:0;
                    background:#f3f4f6;
                    font-family:Arial,sans-serif;
                ">

                    <div style="
                        max-width:450px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:16px;
                        overflow:hidden;
                        border:1px solid #e5e7eb;
                    ">

                        <div style="
                            background:#2563eb;
                            padding:25px;
                            text-align:center;
                        ">
                            <h1 style="
                                margin:0;
                                color:white;
                                font-size:28px;
                            ">
                                📒 Notebook
                            </h1>

                            <p style="
                                margin:8px 0 0;
                                color:#dbeafe;
                                font-size:14px;
                            ">
                                Secure OTP Verification
                            </p>
                        </div>

                        <div style="
                            padding:35px;
                            text-align:center;
                        ">

                            <h2 style="
                                margin:0 0 15px;
                                color:#1f2937;
                            ">
                                Verify your email
                            </h2>

                            <p style="
                                color:#4b5563;
                                font-size:15px;
                            ">
                                Hello <strong>${name || "there"}</strong>,
                            </p>

                            <p style="
                                color:#6b7280;
                                font-size:15px;
                                line-height:1.6;
                            ">
                                Use this One-Time Password to verify your
                                Notebook account.
                            </p>

                            <div style="
                                display:inline-block;
                                background:#f8fafc;
                                border:1.5px dashed #2563eb;
                                border-radius:12px;
                                padding:18px 25px;
                                margin:20px 0;
                            ">

                                <span style="
                                    font-size:32px;
                                    font-weight:bold;
                                    color:#2563eb;
                                    letter-spacing:8px;
                                ">
                                    ${otp}
                                </span>

                            </div>

                            <p style="
                                margin:0;
                                color:#ef4444;
                                font-size:14px;
                                font-weight:600;
                            ">
                                ⏱ This OTP expires in 10 minutes.
                            </p>

                            <p style="
                                margin-top:25px;
                                color:#6b7280;
                                font-size:14px;
                                line-height:1.6;
                            ">
                                If you didn't request this verification,
                                you can safely ignore this email.
                            </p>

                        </div>

                        <div style="
                            background:#f9fafb;
                            padding:18px;
                            text-align:center;
                            border-top:1px solid #e5e7eb;
                        ">

                            <p style="
                                margin:0;
                                color:#9ca3af;
                                font-size:13px;
                            ">
                                © 2026 <strong>Notebook</strong>.
                                All Rights Reserved.
                            </p>

                        </div>

                    </div>

                </body>
                </html>
            `,
        });

        if (error) {
            console.error("Resend email error:", error);
            throw new Error("Unable to send OTP email");
        }

        console.log("OTP email sent:", data?.id);

        return data;

    } catch (error) {
        console.error("sendOtpEmail error:", error);
        throw error;
    }
}
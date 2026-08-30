import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setIsAuthenticated } from "../Redux/Slice";
import { useDispatch } from "react-redux";

export default function EmailVerifyOTP() {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const email = localStorage.getItem("email");
  console.log(email);

  async function handleSubmit(e) {
    if (otp.length !== 6) {
      alert("Enter a valid 6 digit OTP");
      return;
    }
    e.preventDefault();
    try {
      let response = await axios.post(
        "https://react-project-qnnx.onrender.com/authRouter/VerifOtp",
        {
          email: email,
          otp: otp,
        },
        { withCredentials: true },
      );

      console.log(response)
      if (response.data.success) {
        dispatch(setIsAuthenticated(true))
        navigate("/");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl bg-black/80 text-white p-8 shadow-2xl border border-white/10">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Verify Email</h1>

          <p className="mt-3 text-sm text-gray-400 leading-6">
            We've sent a 6-digit verification code to your email address. Enter
            it below to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-center text-2xl tracking-[10px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-white text-black font-semibold transition hover:bg-blue-600 hover:text-white"
          >
            Verify OTP
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Didn't receive the code?
          <button className="ml-2 text-blue-400 hover:text-blue-300 font-medium">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import imgeConfig from "../config/imageConfig";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFromData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function createAccount(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Fill all Fields");
      return;
    }

    try {
      const reponse = await axios.post(
        "http://localhost:5000/authRouter/createAccount",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true },
      );

      localStorage.setItem("email", formData.email);
                  navigate("/Email");

    } catch (error) {
      console.log("DATA:", error.response?.data);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFromData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center  sm:p-5">
        <div className="w-full max-w-5xl min-h-[420px] flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-2xl">
          {/* Left */}
          <div className="w-full md:w-1/2 bg-black/80 text-white p-5 flex flex-col justify-between">
            {/* Heading */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Login</h1>

              <p className="mt-2 text-xs md:text-sm text-gray-300 leading-6">
                Come and join us! You can also handle your personal tasks like
                playing music.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 space-y-3"
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            {/* Bottom */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-xs md:text-sm">
                <input type="checkbox" className="accent-blue-500" />I Agree To
                give personal info
              </label>

              <button
                onClick={(e) => {
                  createAccount(e);
                }}
                className="mt-4 w-full h-10 rounded-lg bg-white text-black font-semibold hover:bg-blue-600 hover:text-white transition"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex w-1/2 bg-black/50 items-center justify-center p-5">
            <img
              src={imgeConfig.loginImag}
              alt="No Image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
}

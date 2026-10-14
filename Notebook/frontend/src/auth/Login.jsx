import { useNavigate } from "react-router-dom";
import imgeConfig from "../config/imageConfig";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from 'react-redux'
import { setIsAuthenticated, setUser } from "../Redux/Slice";
import VITE_API_URL from "../config/backend_API_URL";
export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFromData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // Mutation setup
  const createAccountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${VITE_API_URL}/authRouter/createAccount`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setIsAuthenticated(true));
      dispatch(setUser(data.user));
      navigate("/");
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message ?? "Unable to create account, please try again.");
    },
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFromData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.username) {
      setErrorMessage("Fill all Fields");
      return;
    }
    setErrorMessage("");
    createAccountMutation.mutate(formData);
  }

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center sm:p-5">
        <div className="w-full h-10 max-w-4xl min-h-[420px] flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-2xl">
          <div className="w-full md:w-1/2 bg-black/80 text-white p-5 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Create Account</h1>
              <p className="mt-2 text-xs md:text-sm text-gray-300 leading-6">
                Come and join us! You can also handle your personal tasks like playing music.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
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
              <div className="flex justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="shrink-0 text-gray-300 hover:text-white"
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full h-10 rounded-lg bg-white/10 border border-white/20 px-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={createAccountMutation.isPending}
                className="mt-4 w-full h-10 rounded-lg bg-white text-black font-semibold hover:bg-blue-600 hover:text-white transition disabled:opacity-60"
              >
                {createAccountMutation.isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>
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

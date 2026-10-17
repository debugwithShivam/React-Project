import { Link, useNavigate } from "react-router-dom";
import imgeConfig from "../config/imageConfig";
import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from 'react-redux'
import { setIsAuthenticated, setUser } from "../Redux/Slice";
import VITE_API_URL from "../config/backend_API_URL";

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60";

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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center overflow-y-auto p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-black/55 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:grid-cols-2">

        <div className="p-7 sm:p-9">
          <h2 className="text-xl font-bold text-white">Create account</h2>
          <p className="mt-1 text-sm text-white/55">
            Already have one?{" "}
            <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="signup-name" className={labelClass}>Name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="signup-username" className={labelClass}>Username</label>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="yourname"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="signup-email" className={labelClass}>Email</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="signup-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {errorMessage && (
              <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-400 hover:to-violet-400 active:scale-[0.99] disabled:opacity-60"
            >
              <UserPlus size={16} />
              {createAccountMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600/70 via-violet-600/50 to-black/70 p-8 md:flex">
          <div>
            <h1 className="text-2xl font-bold text-white">Join the notebook</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Keep your notes, tasks and music in one place — and share whatever you feel like posting.
            </p>
          </div>
          <img
            src={imgeConfig.loginImag}
            alt=""
            className="mx-auto max-h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
}

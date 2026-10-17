import imgeConfig from "../config/imageConfig";
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUser } from "../Redux/Slice";
import { Eye, EyeOff, LogIn } from "lucide-react";
import VITE_API_URL from "../config/backend_API_URL";

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/10 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40";

export default function Signin() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const singinUser = useMutation({
    mutationFn: (data) => axios.post(`${VITE_API_URL}/authRouter/singIn`, data, { withCredentials: true }),
    onSuccess: (response) => {
      dispatch(setIsAuthenticated(true));
      dispatch(setUser(response.data.user));
      navigate('/')
    },
    onError: (error) => {
      setErrorMessage(
        error.response?.data?.message ?? "Unable to sign in. Please try again."
      );
    },
  })

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }
    setErrorMessage("");
    singinUser.mutate({ email: email.trim(), password });
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center overflow-y-auto p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-black/55 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:grid-cols-2">

        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600/70 via-violet-600/50 to-black/70 p-8 md:flex">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Sign in to pick up your notes, music and tasks right where you left them.
            </p>
          </div>
          <img
            src={imgeConfig.singinImage}
            alt=""
            className="mx-auto max-h-64 object-contain"
          />
        </div>

        <div className="p-7 sm:p-9">
          <h2 className="text-xl font-bold text-white">Sign in</h2>
          <p className="mt-1 text-sm text-white/55">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-indigo-300 hover:text-indigo-200">
              Create an account
            </Link>
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="signin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="signin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
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
              <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={singinUser.isPending}
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-400 hover:to-violet-400 active:scale-[0.99] disabled:opacity-60"
            >
              <LogIn size={16} />
              {singinUser.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40 md:hidden">
            Sign in to sync your notes and music.
          </p>
        </div>
      </div>
    </div>
  );
}

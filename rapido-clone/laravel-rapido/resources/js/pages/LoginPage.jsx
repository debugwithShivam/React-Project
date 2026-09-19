import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import logo from "../image/titlelogo.jpeg";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("rider");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.identifier.trim() || !formData.password.trim()) {
      setErrorMessage("Please enter your mobile/email and password.");
      return;
    }

    setLoading(true);
    try {
      const authUser = await login(formData.identifier.trim(), formData.password);
      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        if (authUser.role === "ADMIN") {
          navigate("/Admin/Dashboard");
        } else if (authUser.role === "DRIVER") {
          navigate("/my-rides");
        } else {
          navigate("/book");
        }
      }, 1000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Click quick evaluation demo logins
  const fillQuickLogin = (email, pass, targetRole) => {
    setFormData({
      identifier: email,
      password: pass,
    });
    setRole(targetRole);
    setErrorMessage("");
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-yellow-50/40 via-white to-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 w-full">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* ================= HEADER ================= */}
        <div className="bg-brand-dark p-5 sm:p-6 text-white text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3 rounded-full flex items-center justify-center shadow-md overflow-hidden bg-white/10">
            <img
              src={logo}
              className="rounded-full w-full h-full object-cover"
              alt="Sawaari"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Log in to Sawaari
          </h2>

          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Access fast rides, captain earnings & live admin controls
          </p>
        </div>

        {/* ================= ROLE SWITCHER ================= */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl">
            {/* Rider */}
            <button
              type="button"
              onClick={() => handleRoleChange("rider")}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === "rider"
                  ? "bg-white text-brand-dark shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Rider / Commuter
            </button>

            {/* Captain */}
            <button
              type="button"
              onClick={() => handleRoleChange("captain")}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
                role === "captain"
                  ? "bg-white text-brand-dark shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Captain (Driver)
            </button>
          </div>
        </div>

        {/* ================= FORM BODY ================= */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Current Role Title */}
          <div className="text-center">
            <p className="text-sm font-bold text-brand-dark">
              Signing in as{" "}
              <span className="text-amber-600 uppercase font-black">{role}</span>
            </p>
          </div>

          {/* Error / Success Notifications */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Identifier Input */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                Email Address or 10-digit Mobile Phone
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="e.g. 9811442710 or email@mail.com"
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset token feature: Please use your registered phone number or email.")}
                  className="text-[10px] font-semibold text-brand-dark hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white transition-all"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover disabled:opacity-60 text-brand-dark font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    Login as {role === "rider" ? "Rider" : "Captain"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ================= QUICK LOGIN SHORTCUTS ================= */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <span className="text-[10px] sm:text-[11px] text-gray-400 block mb-2 font-semibold">
              ⚡ Quick Demo Credentials (MySQL DB)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickLogin("sp5812070@gmail.com", "shivam", "rider")}
                className="py-2 px-2 font-bold text-[10px] rounded-lg border bg-yellow-50 hover:bg-yellow-100 text-brand-dark border-yellow-200 transition-colors text-center"
              >
                Super Admin (Shivam)
              </button>

              <button
                type="button"
                onClick={() => fillQuickLogin("harshpandey2005@gmail.com", "password", "rider")}
                className="py-2 px-2 font-bold text-[10px] rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 transition-colors text-center"
              >
                Rider User (Harsh)
              </button>
            </div>
          </div>

          {/* ================= SIGNUP LINK ================= */}
          <div className="text-center pt-2 text-[11px] sm:text-xs text-gray-500">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              className="text-brand-dark font-bold hover:underline"
            >
              Create New Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
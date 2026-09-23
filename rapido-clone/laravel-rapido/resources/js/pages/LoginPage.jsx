import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import logo from "../image/titlelogo.jpeg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../api/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClinet = useQueryClient()
  const [role, setRole] = useState("rider");
  const [method, setMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    Phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (newRole) => {
    console.log("ROLE BUTTON CLICKED:", newRole);
    setRole(newRole);
    setMethod("email");
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      console.log("ROLE AT LOGIN TIME:", role);
      const identifier =
        method === "email"
          ? formData.email
          : formData.Phone;

      const response = await api.post('/auth/login', {
        identifier,
        password: formData.password,
        role:
          role === 'rider'
            ? 'USER'
            : role === 'captain'
              ? 'DRIVER'
              : 'ADMIN',
      });

      return response.data;
    },

    onSuccess: (data) => {
      console.log("LOGIN SUCCESS:", data);

      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
      }

      queryClinet.invalidateQueries({
        queryKey: ["currentUser"],
      });

      if (data?.user?.role === "ADMIN") {
        navigate("/Admin", { replace: true });
      } else {
        navigate("/my-rides", { replace: true });
      }
    },

    onError: (error) => {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    loginMutation.mutate();
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-yellow-50/40 via-white to-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12 w-full">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="bg-brand-dark p-5 sm:p-6 text-white text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-2.5 sm:mb-3 rounded-full flex items-center justify-center shadow-md overflow-hidden">
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
            Access fast rides, exclusive cashback & saved destinations
          </p>
        </div>

        {/* ================= ROLE SWITCHER ================= */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="grid grid-cols-3 p-1 bg-gray-100 rounded-2xl">

            {/* Rider */}
            <button
              type="button"
              onClick={() => handleRoleChange("rider")}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${role === "rider"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-black"
                }`}
            >
              Rider / Commuter
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${role === "admin"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-black"
                }`}
            >
              Admin
            </button>
            {/* Captain */}
            <button
              type="button"
              onClick={() => handleRoleChange("captain")}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${role === "captain"
                ? "bg-white text-brand-dark shadow-sm"
                : "text-gray-500 hover:text-black"
                }`}
            >
              Captain (Driver)
            </button>

          </div>
        </div>

        {/* ================= FORM ================= */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Current Role */}
          <div className="text-center">
            <p className="text-sm font-bold text-brand-dark">
              Login as{" "}
              {role === "rider"
                ? "Rider / Commuter"
                : role === "captain"
                  ? "Captain / Driver"
                  : "Admin"}
            </p>
          </div>

          {/* ================= LOGIN METHOD ================= */}

          <div>
            <div className="flex items-center mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-gray-600">
                Login Method
              </span>
            </div>

            {/* Method buttons */}

            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">


              {/* Email */}
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`py-2 w-full border-2 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all ${method === "email"
                  ? "bg-white text-brand-dark shadow-sm"
                  : "text-gray-500"
                  }`}
              >
                <Mail className="w-3 h-3" />
                Email
              </button>

              {/* Phone */}
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`py-2 w-full border-2 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all ${method === "phone"
                  ? "bg-white text-brand-dark shadow-sm"
                  : "text-gray-500"
                  }`}
              >
                <Phone className="w-3 h-3" />
                Phone
              </button>


            </div>
          </div>

          {/* ================= LOGIN FORM ================= */}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            {method === "email" && (<div> <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
              Email Address </label>


              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  required
                />
              </div>
            </div>


            )}

            {/* Phone Input */}
            {method === "phone" && (<div> <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
              Phone Number </label>


              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  required
                />
              </div>
            </div>


            )}

            {/* Password - COMMON FOR BOTH EMAIL & PHONE */}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                Password
              </label>


              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:bg-white"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="text-right mt-1">
                <button
                  type="button"
                  className="text-[10px] font-semibold text-brand-dark hover:underline"
                >
                  Forgot Password?
                </button>
              </div>


            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"

            >


              <span>



                Login as{" "}
                Login as{" "}
                {role === "rider"
                  ? "Rider"
                  : role === "captain"
                    ? "Captain"
                    : "Admin"}
              </span>

              <ArrowRight className="w-4 h-4" />


            </button>

          </form>


          {/* ================= QUICK LOGIN ================= */}
          <div className="pt-2 border-t border-gray-100 text-center">

            <span className="text-[10px] sm:text-[11px] text-gray-400 block mb-2">
              ⚡ Quick 1-Click Evaluation
            </span>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => setRole("rider")}
                className={`w-1/2 py-2 font-bold text-[10px] sm:text-[11px] rounded-lg border transition-colors active:scale-95 ${role === "rider"
                  ? "bg-yellow-50 hover:bg-yellow-100 text-brand-dark border-yellow-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
              >
                Login as Rider
              </button>

              <button
                type="button"
                onClick={() => setRole("captain")}
                className={`w-1/2 py-2 font-bold text-[10px] sm:text-[11px] rounded-lg border transition-colors active:scale-95 ${role === "captain"
                  ? "bg-yellow-50 hover:bg-yellow-100 text-brand-dark border-yellow-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200"
                  }`}
              >
                Login as Captain
              </button>

            </div>
          </div>

          {/* ================= SIGNUP ================= */}
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

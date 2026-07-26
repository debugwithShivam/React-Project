import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import imageConfig from "../config/imageConfig";

export default function Layout() {
  return (
    <div className="relative">
      <img
        src={imageConfig.backgroungImage}
        className="absolute h-screen w-screen"
        alt=""
      />
      <nav className="flex gap-5 justify-between items-center  p-2 z-50 relative bg-white/40">
        <div className="w-35">
          <img src={imageConfig.logoWithTitle} alt="" />
        </div>
        <div className=" flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Notes
          </NavLink>
          <NavLink
            to="/Timer"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Timer
          </NavLink>
          <NavLink
            to="/Music"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Music
          </NavLink>
          <NavLink
            to="/Todo"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Todo
          </NavLink>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 font-medium transition-all duration-200 hover:bg-slate-100 hover:border-slate-400">
            Sign In
          </button>

          <button className="px-5 py-2 rounded-full bg-slate-900 text-white font-medium transition-all duration-200 hover:bg-slate-700 shadow-md">
            Login
          </button>
        </div>
      </nav>
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

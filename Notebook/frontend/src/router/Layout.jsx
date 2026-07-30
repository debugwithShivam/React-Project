import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import imageConfig from "../config/imageConfig";

export default function Layout() {
  let isAuthenticated = localStorage.getItem("removebutton");
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
            to="/tasks"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Todo
          </NavLink>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95">
              {/* Setting Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.983 2.25c.442 0 .875.035 1.297.103l.43 2.154a7.71 7.71 0 011.74.722l1.84-1.224a9.81 9.81 0 011.836 1.836l-1.224 1.84c.294.544.538 1.12.722 1.74l2.154.43a9.79 9.79 0 010 2.594l-2.154.43a7.71 7.71 0 01-.722 1.74l1.224 1.84a9.81 9.81 0 01-1.836 1.836l-1.84-1.224a7.71 7.71 0 01-1.74.722l-.43 2.154a9.79 9.79 0 01-2.594 0l-.43-2.154a7.71 7.71 0 01-1.74-.722l-1.84 1.224a9.81 9.81 0 01-1.836-1.836l1.224-1.84a7.71 7.71 0 01-.722-1.74l-2.154-.43a9.79 9.79 0 010-2.594l2.154-.43c.184-.62.428-1.196.722-1.74L4.005 5.84a9.81 9.81 0 011.836-1.836l1.84 1.224a7.71 7.71 0 011.74-.722l.43-2.154a9.79 9.79 0 011.297-.103z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <span className="font-medium">Settings</span>
            </button>
          ) : (
            <>
              <Link to="/signup">
                <button className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 font-medium transition-all duration-200 hover:bg-slate-100 hover:border-slate-400">
                  Sign In
                </button>
              </Link>

              <Link to="/login">
                <button className="px-5 py-2 rounded-full bg-slate-900 text-white font-medium transition-all duration-200 hover:bg-slate-700 shadow-md">
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import imageConfig from "../config/imageConfig";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BookOpen,
  ListMusic,
  Timer,
  CheckSquare,
  Settings,
} from "lucide-react";

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await axios.get(
          "http://localhost:5000/authRouter/check-auth",
          { withCredentials: true }
        );

        setAuthenticated(res.data.authenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="relative">
      <img
        src={imageConfig.backgroungImage}
        className="absolute h-screen w-screen"
        alt=""
      />

      {/* ---------- Navbar ---------- */}
      <nav
        className="relative z-50"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          background: "rgba(20, 12, 18, 0.35)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Logo */}
        <Link to="/" className="w-35">
          <img src={imageConfig.logoWithTitle} alt="notebook" />
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <NavItem to="/" label="Notes" icon={<BookOpen size={16} />} />
          <NavItem to="/Music" label="Music" icon={<ListMusic size={16} />} />
          <NavItem to="/Timer" label="Timer" icon={<Timer size={16} />} />
          <NavItem to="/tasks" label="Todo" icon={<CheckSquare size={16} />} />
        </div>

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAuthenticated ? (
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <Settings size={16} />
              Settings
            </button>
          ) : (
            <>
              <Link to="/signup">
                <button
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    padding: "9px 20px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </Link>

              <Link to="/login">
                <button
                  style={{
                    background: "linear-gradient(135deg,#3b6fd1,#5a3fae)",
                    border: "none",
                    color: "#fff",
                    padding: "9px 20px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(59,111,209,0.35)",
                  }}
                >
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

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
        fontWeight: isActive ? 700 : 500,
        fontSize: 15,
        textDecoration: "none",
        paddingBottom: 4,
        borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}

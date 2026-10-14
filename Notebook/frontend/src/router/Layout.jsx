import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import imageConfig from "../config/imageConfig";
import VITE_API_URL from "../config/backend_API_URL";
import {
  BookOpen,
  ListMusic,
  Timer,
  CheckSquare,
  Search,
  LogOut
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated, setSelecUser, setUser } from "../Redux/Slice";
import { useQueryClient } from "@tanstack/react-query";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(
    (state) => state.state
  );

  async function handleLogout() {
    try {
      await axios.post(`${VITE_API_URL}/authRouter/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.log("Logout request failed:", error);
    }

    queryClient.clear();
    dispatch(setUser(""));
    dispatch(setSelecUser(null));
    dispatch(setIsAuthenticated(false));
    navigate("/login");
  }

  return (
    <div className="relative">
      <img
        src={imageConfig.backgroungImage}
        className="absolute h-screen w-screen"
        alt=""
      />

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
          <NavItem to="/SearchUser" label="Search" icon={<Search size={16} />} />
          <NavItem to="/" label="Notes" icon={<BookOpen size={16} />} />
          <NavItem to="/Music" label="Music" icon={<ListMusic size={16} />} />
          <NavItem to="/Timer" label="Timer" icon={<Timer size={16} />} />
          <NavItem to="/tasks" label="Todo" icon={<CheckSquare size={16} />} />
        </div>

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAuthenticated === null ? null : isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to='/ProfilePage'>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                padding: "6px 16px 6px 6px",
                borderRadius: 999,
                cursor: "pointer",
              }}
              >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#3b6fd1,#5a3fae)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {(user?.name || user?.username || "A")[0].toUpperCase()}
                </div>
              )}

              {/* Name + Username */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#fff" }}>
                  {user?.name || "User"}
                </span>
                <span style={{ fontWeight: 400, fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}>
                  @{user?.username || "guest"}
                </span>
              </div>

            </button>
                </Link>

              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  padding: "9px 14px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
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

              <Link to="/signup">
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
                  Sign Up
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

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const labelSt = {
  display: "block",
  color: "rgba(255,255,255,0.45)",
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  marginBottom: "6px",
};

const inputBoxSt = {
  position: "relative",
  display: "flex",
  alignItems: "center", // ← icon + input ek line mein
};

const iconSt = {
  position: "absolute",
  left: "11px",
  fontSize: "15px",
  color: "rgba(139,92,246,0.8)",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
};

const inputSt = {
  width: "100%",
  height: "40px", // ← fixed height
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(139,92,246,0.2)",
  borderRadius: "10px",
  padding: "0 12px 0 36px", // ← left padding icon ke liye
  color: "#fff",
  fontSize: "0.84rem",
  outline: "none",
  boxSizing: "border-box",
};

function Field({ label, type = "text", placeholder, extra }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelSt}>{label}</label>
      <div style={inputBoxSt}>
        {extra}
        <input style={inputSt} type={type} placeholder={placeholder} />
      </div>
    </div>
  );
}

export default function AuthLogin() {
  const [showPass, setShowPass] = useState(false);
  let [accountDetail, setAccountDetail] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  let navigate = useNavigate()

  async function createAccount(e) {
    console.log("hwb");
    e.preventDefault();
    if (
      !accountDetail.firstName ||
      !accountDetail.email ||
      !accountDetail.password
    ) {
      alert("Fill all fields");
      return;
    }
    try {
      let user = await axios.post(
        "http://localhost:4876/auth/singin",
        {
          firstName: accountDetail.firstName,
          lastName: accountDetail.lastName,
          email: accountDetail.email,
          password: accountDetail.password,
        },
        { withCredentials: true },
      );
      localStorage.setItem("accessToken", user.data?.accessToken || "");
      navigate('/setting')
      setAccountDetail({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      console.log("request received", user.data);
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("DATA:", err.response?.data);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setAccountDetail((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <form action="" onSubmit={(e) => e.preventDefault()}>
      <div
        style={{
          width: "340px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "20px",
          padding: "2rem 1.8rem",
          fontFamily: "sans-serif",
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize: "1.3rem",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Welcome back
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.8rem",
            marginBottom: "1.4rem",
          }}
        >
          MCODE — sign in to continue
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label style={labelSt}>FIRST NAME</label>
            <div style={inputBoxSt}>
              <span style={iconSt}>👤</span>
              <input
                style={inputSt}
                type="text"
                name="firstName"
                value={accountDetail.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
          </div>
          <div>
            <label style={labelSt}>LAST NAME</label>
            <div style={inputBoxSt}>
              <span style={iconSt}>👤</span>
              <input
                style={inputSt}
                type="text"
                name="lastName"
                value={accountDetail.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelSt}>EMAIL</label>
          <div style={inputBoxSt}>
            <span style={iconSt}>✉️</span>
            <input
              style={inputSt}
              type="email"
              name="email"
              value={accountDetail.email}
              onChange={handleChange}
              placeholder="you@mcode.com"
            />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelSt}>PASSWORD</label>
          <div style={inputBoxSt}>
            <span style={iconSt}>🔒</span>
            <input
              name="password"
              value={accountDetail.password}
              onChange={handleChange}
              style={inputSt}
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
            />
            <span
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "11px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
              }}
            >
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "1.2rem 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.07)",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem" }}>
            or
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.07)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={createAccount}
          style={{
            width: "100%",
            height: "42px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
        >
          CREATE ACCOUNT
        </button>

        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.25)",
            fontSize: "0.74rem",
            marginTop: "1rem",
          }}
        >
          Forgot password?{" "}
          <span style={{ color: "#a855f7", cursor: "pointer" }}>
            Reset here
          </span>
        </p>
      </div>
    </form>
  );
}

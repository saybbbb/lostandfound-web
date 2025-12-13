import React, { useState } from "react";
import usePageMetadata from "../hooks/usePageMetadata";
import { useParams, useNavigate } from "react-router-dom";
import { IoLockClosedOutline } from "react-icons/io5";
import api from "../services/api";

function ResetPassword() {
  usePageMetadata("Reset Password", "/images/LAFLogo.png");
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const styles = {
    wrapper: {
      minHeight: "100vh",
      width: "100%",
      backgroundImage: 'url("/images/Background.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      gap: "3rem",
    },

    overlay: {
      position: "absolute",
      inset: 0,
      background: "rgba(0, 0, 0, 0.35)",
      backdropFilter: "blur(4px)",
      pointerEvents: "none",
    },

    container: {
      position: "relative",
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      gap: "3rem",
      padding: "20px",
      flexDirection: window.innerWidth >= 900 ? "row" : "column",
    },

    card: {
      width: "380px",
      padding: "2rem",
      borderRadius: "1.5rem",
      background: "rgba(255, 255, 255, 0.20)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255,255,255,0.4)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      textAlign: "center",
    },

    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#fff",
      marginBottom: "20px",
      textShadow: "0 2px 4px rgba(0,0,0,0.7)",
    },

    inputWrapper: {
      display: "flex",
      alignItems: "center",
      background: "white",
      padding: "12px",
      borderRadius: "12px",
      marginBottom: "15px",
      boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
    },

    icon: {
      fontSize: "18px",
      marginRight: "10px",
      color: "#666",
    },

    input: {
      border: "none",
      outline: "none",
      width: "100%",
      fontSize: "15px",
    },

    button: {
      marginTop: "18px",
      width: "100%",
      padding: "12px",
      background: "#1e63ff",
      color: "white",
      borderRadius: "12px",
      fontSize: "18px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
    },

    logo: {
      width: window.innerWidth >= 900 ? "350px" : "200px",
      filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await api.post(
        `/api/auth/reset-password/${token}`,
        { password }
      );

      alert("Password reset successful! Please log in.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        {/* LEFT SIDE CARD */}
        <div style={styles.card}>
          <h2 style={styles.title}>Reset your Password</h2>

          <div style={styles.inputWrapper}>
            <IoLockClosedOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              type="password"
              placeholder="Enter your new password"
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <IoLockClosedOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              type="password"
              placeholder="Confirm your new password"
              style={styles.input}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button style={styles.button} onClick={handleSubmit}>
            Reset Password
          </button>
        </div>

        {/* RIGHT SIDE LOGO */}
        <img src="/images/LAFLogo.png" alt="Logo" style={styles.logo} />
      </div>
    </div>
  );
}

export default ResetPassword;

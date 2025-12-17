/* =========================
   IMPORTS
========================= */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import usePageMetadata from "../hooks/usePageMetadata";
import api from "../services/api";

/* =========================
   COMPONENT
========================= */
function Recovery() {
  usePageMetadata("Account Recovery", "/images/LAFLogo.png");

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/auth/forgot-password", {
        email: formData.email,
      });

      alert("A password reset link has been sent to your email.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to send reset link.");
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay} />

      <div style={styles.container}>
        {/* RECOVERY CARD */}
        <div style={styles.card}>
          <h2 style={styles.title}>Account Recovery</h2>

          <p style={styles.subtitle}>
            Already have an Account?{" "}
            <Link to="/" style={styles.link}>
              Login
            </Link>
          </p>

          {/* EMAIL */}
          <div style={styles.inputWrapper}>
            <IoMailOutline style={styles.icon} />
            <input
              style={styles.input}
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>

          <button style={styles.button} onClick={handleSubmit}>
            Send
          </button>
        </div>

        {/* LOGO */}
        <img src="/images/LAFLogo.png" alt="" style={styles.logo} />
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
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
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(4px)",
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
    fontSize: "34px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#000",
    marginBottom: "20px",
    fontSize: "15px",
  },

  link: {
    color: "#1C60DF",
    fontWeight: 600,
    textDecoration: "underline",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "10px",
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
    color: "#fff",
    borderRadius: "12px",
    fontSize: "18px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },

  logo: {
    width: window.innerWidth >= 900 ? "400px" : "200px",
    filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))",
  },
};

export default Recovery;

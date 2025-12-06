import React, { useState } from "react";
import usePageMetadata from "../hooks/usePageMetadata";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  IoCalendarOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
} from "react-icons/io5";

function Register() {
  usePageMetadata("Register", "/images/LAFLogo.png");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthday: "",
    password: "",
  });

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
      fontWeight: "700",
      color: "#fff",
      marginBottom: "8px",
      textShadow: "0 2px 4px rgba(0,0,0,0.7)",
    },

    subtitle: {
      color: "black",
      marginBottom: "20px",
      fontSize: "15px",
    },

    link: {
      color: "#1C60DF",
      fontWeight: "600",
      textDecoration: "underline",
      cursor: "pointer",
    },

    inputWrapper: {
      display: "flex",
      alignItems: "center",
      background: "white",
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
      color: "white",
      borderRadius: "12px",
      fontSize: "18px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
    },

    logo: {
      width: window.innerWidth >= 900 ? "400px" : "200px",
      filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))",
    },
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      if (res.data.success) {
        alert("Registration successful!");
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        {/* LEFT CARD */}
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>

          <p style={styles.subtitle}>
            Already have an Account?{" "}
            <Link to="/" style={styles.link}>
              Login
            </Link>
          </p>

          {/* FULL NAME */}
          <div style={styles.inputWrapper}>
            <IoPersonOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              style={styles.input}
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.inputWrapper}>
            <IoMailOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              style={styles.input}
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>

          {/* BIRTHDAY */}
          <div style={styles.inputWrapper}>
            <IoCalendarOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              style={styles.input}
              type="date"
              name="birthday"
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputWrapper}>
            <IoLockClosedOutline style={{ fontSize: 20, marginRight: 10 }} />
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button style={styles.button} onClick={handleSubmit}>
            Register
          </button>
        </div>

        {/* RIGHT LOGO */}
        <img src="/images/LAFLogo.png" style={styles.logo} />
      </div>
    </div>
  );
}

export default Register;

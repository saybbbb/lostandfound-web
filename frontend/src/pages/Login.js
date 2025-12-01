import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  

  // =========================
  //     INLINE STYLES
  // =========================
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

    forgot: {
      color: "#222",
      marginTop: "4px",
      textDecoration: "underline",
      fontSize: "13px",
      cursor: "pointer",
      fontWeight: "bold",
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

    orLineContainer: {
      marginTop: "20px",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "white",
    },

    line: {
      flexGrow: 1,
      height: "1px",
      background: "rgba(255,255,255,0.5)",
    },

    socialRow: {
      display: "flex",
      gap: "20px",
      justifyContent: "center",
      marginTop: "10px",
    },

    socialIcon: {
      width: "45px",
      height: "45px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "22px",
      cursor: "pointer",
    },

    logo: {
      width: window.innerWidth >= 900 ? "400px" : "200px",
      filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))",
    },

    adminTextLink:{
      color: "#white",
      marginTop: "4px",
      textDecoration: "underline",
      fontSize: "13px",
      cursor: "pointer",
      fontWeight: "semibold",
    },
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      formData
    );

    if (res.data.token) {

      // Store the token
      localStorage.setItem("token", res.data.token);

      // Decode JWT to extract role + ID
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));

      // ⭐⭐⭐ STORE USER ID HERE (FIX) ⭐⭐⭐
      localStorage.setItem("userId", decoded.id || decoded._id);

      // Store role
      localStorage.setItem("role", decoded.role);

      // Redirect user based on role
      if (decoded.role === "admin") {
        navigate("/AdminDashboard");
      } 
      else if (decoded.role === "staff") {
        navigate("/StaffDashboard");
      } 
      else {
        navigate("/Dashboard");
      }
    }

  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        {/* LEFT LOGIN CARD */}
        <div style={styles.card}>
          <h2 style={styles.title}>Sign in to your <br /> Account</h2>

          <p style={styles.subtitle}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.link}>Sign Up</Link>
          </p>

          {/* EMAIL INPUT */}
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>📧</span>
            <input
              style={styles.input}
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🔒</span>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>
          <br></br>
          <Link to="/recovery" style={styles.forgot}>
  Forgot Your Password?
</Link>
            
          

          <button style={styles.button} onClick={handleSubmit}>
            Log In
          </button>

      
        </div>

        {/* RIGHT LOGO */}
        <img
          src="/images/LAF Logo.png"
          alt=""
          style={styles.logo}
        />
      </div>s
    </div>
  );
}

export default Login;

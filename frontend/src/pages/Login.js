import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-overlay"></div>

        <div className="login-container">
          {/* LEFT LOGIN CARD */}
          <div className="login-card">
            <h2 className="login-title">Sign in to your Account</h2>

            <p className="login-subtext">
              Don’t have an account?{" "}
              <Link to="/register" className="login-link">Sign Up</Link>
            </p>

            <form onSubmit={handleSubmit} className="login-form">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className="login-input"
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="login-input"
                onChange={handleChange}
                required
              />

              <p className="login-forgot">Forgot Your Password?</p>

              <button type="submit" className="login-button">Log In</button>
            </form>
          </div>

          {/* RIGHT LOGO */}
          <img
            src="/images/logo.png"
            alt="Logo"
            className="login-logo"
          />
        </div>
      </div>

      {/* ===== CSS BELOW ===== */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100%;
          background-image: url("/images/background.png");
          background-size: cover;
          background-position: center;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .login-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
        }

        .login-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .login-container {
            flex-direction: row;
          }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 2.5rem;
          border-radius: 1.5rem;
          width: 350px;
          text-align: center;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .login-title {
          color: white;
          font-size: 1.9rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
        }

        .login-subtext {
          color: white;
          margin-bottom: 1.5rem;
        }

        .login-link {
          color: #8ecbff;
          font-weight: 600;
          text-decoration: underline;
        }

        .login-input {
          width: 100%;
          padding: 0.9rem;
          border-radius: 0.7rem;
          background: rgba(255, 255, 255, 0.85);
          border: none;
          outline: none;
          font-size: 1rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .login-input:focus {
          background: white;
        }

        .login-forgot {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: underline;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          cursor: pointer;
        }

        .login-button {
          margin-top: 1rem;
          width: 100%;
          background: #1867ff;
          padding: 0.9rem;
          border-radius: 0.7rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: 0.2s ease-in-out;
        }

        .login-button:hover {
          background: #1558d6;
        }

        .login-logo {
          width: 170px;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.45));
        }

        @media (min-width: 768px) {
          .login-logo {
            width: 210px;
          }
        }
      `}</style>
    </>
  );
}

export default Login;
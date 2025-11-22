import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    <>
      <div className="reg-wrapper">
        <div className="reg-overlay"></div>

        <div className="reg-container">
          {/* LEFT REGISTER CARD */}
          <div className="reg-card">
            <h2 className="reg-title">Create Your Account</h2>

            <p className="reg-subtext">
              Already have an account?{" "}
              <Link to="/" className="reg-link">Login</Link>
            </p>

            <form onSubmit={handleSubmit} className="reg-form">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="reg-input"
                onChange={handleChange}
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className="reg-input"
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="reg-input"
                onChange={handleChange}
                required
              />

              <button type="submit" className="reg-button">Register</button>
            </form>
          </div>

          {/* RIGHT LOGO */}
          <img
            src="/images/logo.png"
            alt="Logo"
            className="reg-logo"
          />
        </div>
      </div>

      {/* ===== CSS BELOW ===== */}
      <style>{`
        .reg-wrapper {
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

        .reg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
        }

        .reg-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .reg-container {
            flex-direction: row;
          }
        }

        .reg-card {
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 2.5rem;
          border-radius: 1.5rem;
          width: 350px;
          text-align: center;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .reg-title {
          color: white;
          font-size: 1.9rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
        }

        .reg-subtext {
          color: white;
          margin-bottom: 1.5rem;
        }

        .reg-link {
          color: #8ecbff;
          font-weight: 600;
          text-decoration: underline;
        }

        .reg-input {
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

        .reg-input:focus {
          background: white;
        }

        .reg-button {
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

        .reg-button:hover {
          background: #1558d6;
        }

        .reg-logo {
          width: 170px;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.45));
        }

        @media (min-width: 768px) {
          .reg-logo {
            width: 210px;
          }
        }
      `}</style>
    </>
  );
}

export default Register;
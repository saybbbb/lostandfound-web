import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Admin() {
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
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = res.data;

      if (token && user.role === "admin") {
        // Save token for future requests
        localStorage.setItem("token", token);

        // Redirect to admin dashboard
        navigate("/AdminDashboard");
      } else {
        alert("Access denied: Not an admin account");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
      <h1>Admin Login</h1>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={{ margin: "10px", padding: "10px", width: "250px" }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        style={{ margin: "10px", padding: "10px", width: "250px" }}
      />
      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
      >
        Login
      </button>
      <Link to="/AdminDashboard" style={{ marginTop: "15px" }}>Back to user login</Link>
    </div>
  );
}

export default Admin;

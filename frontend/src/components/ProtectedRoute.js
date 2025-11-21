import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(res.data.message);
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/");
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;

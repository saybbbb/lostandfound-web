import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuthorized(true);
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/");
      }
    };
    verify();
  }, [navigate]);

  return authorized ? children : null;
}

export default ProtectedRoute;

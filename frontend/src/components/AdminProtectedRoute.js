import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.user.role === "admin") {
          setAllowed(true);
        } else {
          alert("Forbidden: Admins only");
          navigate("/");
        }

      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  if (!allowed) return <div>Loading...</div>;

  return children;
}

export default AdminProtectedRoute;

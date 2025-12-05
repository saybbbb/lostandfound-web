import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StaffProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  // NEW: Only show loading on very first check
  const [initialCheck, setInitialCheck] = useState(true);

  useEffect(() => {
    const checkStaff = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Unauthorized. Please login again.");
          navigate("/");
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.user.role === "staff") {
          setAllowed(true);
        } else {
          alert("Forbidden: Staff only");
          navigate("/");
        }
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/");
      } finally {
        setInitialCheck(false); // FIRST check complete
      }
    };

    checkStaff();
  }, [navigate]);

  // ONLY show loader on the FIRST app load
  if (initialCheck) return <div></div>; // no flashing loading text

  // If check is done but user is not allowed, prevent rendering children
  if (!allowed) return <div></div>;

  return children;
}

export default StaffProtectedRoute;

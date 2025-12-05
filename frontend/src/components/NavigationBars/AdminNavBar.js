import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPersonOutline, IoCubeOutline, IoCheckmarkDoneCircleOutline } from "react-icons/io5";

function AdminNavBar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
   const [message, setMessage] = useState("");

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Fetch Auth User
  const fetchAdminInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await axios.get(
        "http://localhost:5000/api/auth/protected",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(res.data.message);
      setAdminName(res.data.user?.name || "Admin");
    } catch (err) {
      alert("Unauthorized. Please login again.");
      navigate("/admin");
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  return (
    <div style={styles.navbar}>
      <div style={styles.logonavigation}>
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.logo} />

        <div style={styles.navlink}>
          <div style={styles.navitem}>
            <IoHomeOutline size={25} color="#ffffff" />
            <p>Home</p>
          </div>

          <div style={styles.navitem}>
            <IoPersonOutline size={25} color="#ffffff" />
            <p>User</p>
          </div>

          <div style={styles.navitem}>
            <IoCubeOutline size={25} color="#ffffff" />
            <p>Post Approval</p>
          </div>

          <div style={styles.navitem}>
            <IoCheckmarkDoneCircleOutline size={25} color="#ffffff" />
            <p>Claim Request</p>
          </div>
        </div>
      </div>
      <p>{message}</p>
      <div style={styles.account}>
        <IoPersonOutline 
          size={30} 
          color="#ffffff" 
          onClick={logout} 
          style={{ cursor: "pointer" }} 
        />
        <p>{adminName}</p>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    flexDirection: "column",
    width: "250px",
    backgroundColor: "#1A1851",
    justifyContent: "space-between",
    minHeight: "100vh",
    color: "#FFFFFF",
    paddingLeft: "20px",
  },
  logonavigation: {
    display: "flex",
    flexDirection: "column",
    gap: "50px",
  },
  logo: {
    width: 150,
    height: 150,
    paddingTop: "20px",
    alignSelf: "center",
  },
  navlink: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navitem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },
  account: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "20px",
  },
};

export default AdminNavBar;
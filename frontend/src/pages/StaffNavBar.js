import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  IoHomeOutline, 
  IoPersonOutline, 
  IoCubeOutline, 
  IoCheckmarkDoneCircleOutline 
} from "react-icons/io5";

function StaffNavBar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Fetch authenticated admin
  const fetchAdminInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await axios.get(
        "http://localhost:5000/api/auth/protected",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAdminName(res.data.user?.name || "Admin");
    } catch (err) {
      alert("Unauthorized. Please login again.");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  return (
    <div style={styles.navbar}>
      <div style={styles.logonavigation}>
        
        {/* LOGO */}
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.logo} />

        {/* ICONS ONLY */}
        <div style={styles.navlink}>
          <div style={styles.iconOnly}>
            <IoHomeOutline 
            size={25} 
            color="#ffffff" 
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/StaffDashboard")} 
            />
          </div>

          <div style={styles.iconOnly}>
             <IoPersonOutline 
                size={25} 
                color="#ffffff" 
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/StaffLostApproval")} 
            />
</div>
          <div style={styles.iconOnly}>
            <IoCubeOutline size={25} color="#ffffff" />
          </div>

          <div style={styles.iconOnly}>
            <IoCheckmarkDoneCircleOutline size={25} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* ACCOUNT SECTION */}
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

/* STYLES */
const styles = {
  navbar: {
    display: "flex",
    flexDirection: "column",
    width: "250px",        // ⬅ narrower since text removed
    backgroundColor: "#1A1851",
    justifyContent: "space-between",
    minHeight: "100vh",
    color: "#FFFFFF",
    padding: "20px 0",
  },
  logonavigation: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
  },
  navlink: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    alignItems: "center",
  },

  /* ICON ONLY STYLE */
  iconOnly: {
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.2s",
  },

  account: {
    display: "flex",
    paddingLeft:"20px",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    paddingBottom: "20px",
  },
};

export default StaffNavBar;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
  IoHomeOutline, 
  IoPersonOutline, 
  IoCubeOutline, 
  IoCheckmarkCircleOutline,
  IoHourglassOutline
} from "react-icons/io5";

function StaffNavBar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staffName");
    navigate("/");
  };

  // FIX: Load name ONLY from localStorage (no more re-fetch flicker)
  useEffect(() => {
    const cachedName = localStorage.getItem("staffName");
    if (cachedName) {
      setAdminName(cachedName);
    }
  }, []);

  return (
    <div style={styles.sidebar}>

      {/* TOP SECTION */}
      <div style={styles.topSection}>

        {/* LOGO */}
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.logo} />

        {/* NAV ICONS */}
        <div style={styles.navIcons}>

          <div style={styles.iconWrapper}>
            <IoHomeOutline
              size={27}
              color="#ffffff"
              onClick={() => navigate("/StaffDashboard")}
              style={styles.icon}
            />
          </div>

          <div style={styles.iconWrapper}>
            <IoCheckmarkCircleOutline
              size={27}
              color="#ffffff"
              onClick={() => navigate("/StaffLostApproval")}
              style={styles.icon}
            />
          </div>

          <div style={styles.iconWrapper}>
            <IoCubeOutline
              size={27}
              color="#ffffff"
              onClick={() => navigate("/StaffFoundApproval")}
              style={styles.icon}
            />
          </div>

          <div style={styles.iconWrapper}>
            <IoHourglassOutline
              size={27}
              color="#ffffff"
              onClick={() => navigate("/StaffPendingClaim")}
              style={styles.icon}
            />
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
        <p style={styles.accountName}>{adminName}</p>
      </div>

    </div>
  );
}

/* ============================================================
   FIXED, CLEAN, GLITCH-FREE FLEXBOX SIDEBAR STYLES
============================================================ */
const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "150px",
    backgroundColor: "#1A1851",
    minHeight: "100vh",
    padding: "20px 0",
    color: "#FFFFFF",
    flexShrink: 0, // prevents shrinking in flex layout
  },

  topSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
  },

  logo: {
    width: 90,
    height: 90,
  },

  navIcons: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    alignItems: "center",
  },

  iconWrapper: {
    padding: "14px",
    borderRadius: "12px",
    transition: "0.2s",
    cursor: "pointer",
  },

  icon: {
    cursor: "pointer",
  },

  account: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingLeft: "20px",
  },

  accountName: {
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default StaffNavBar;

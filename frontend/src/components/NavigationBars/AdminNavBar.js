import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoAnalyticsOutline,
  IoPersonOutline,
  IoLogOutOutline
} from "react-icons/io5";

function AdminNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("");
  const [activePage, setActivePage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/");
  };

  useEffect(() => {
    const cachedName = localStorage.getItem("adminName");
    if (cachedName) setAdminName(cachedName);
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path.includes("AdminDashboard")) setActivePage("home");
    else if (path.includes("AdminUser")) setActivePage("users");
    else if (path.includes("AdminActivityLogs")) setActivePage("logs");
  }, [location]);

  const navItems = [
    { icon: IoHomeOutline, page: "home", path: "/AdminDashboard", label: "Home" },
    { icon: IoPeopleOutline, page: "users", path: "/AdminUser", label: "Users" },
    { icon: IoAnalyticsOutline, page: "logs", path: "/AdminActivityLogs", label: "Activity Logs" },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarContent}>

        {/* TOP CLUSTER (LOGO + NAVIGATION) */}
        <div style={styles.topCluster}>
          {/* LOGO */}
          <div style={styles.logoContainer}>
            <img
              src="/images/LAF Logo.png"
              alt="Logo"
              style={styles.logo}
              onClick={() => navigate("/AdminDashboard")}
            />
            <div style={styles.logoGlow} />
          </div>

          {/* NAVIGATION */}
          <div style={styles.navSection}>
            {navItems.map((item) => (
              <div
                key={item.page}
                className="nav-item"
                style={{
                  ...styles.navItem,
                  ...(activePage === item.page ? styles.navItemActive : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <item.icon
                  size={22}
                  color={activePage === item.page ? "#1A1851" : "#FFFFFF"}
                />
                <span style={styles.navLabel}>{item.label}</span>

                {activePage === item.page && <div style={styles.activeDot} />}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div style={styles.bottomSection}>
          {/* USER INFO */}
          <div style={styles.accountInfo}>
            <div style={styles.avatar}>
              <IoPersonOutline size={20} color="#1A1851" />
            </div>
            <p style={styles.accountName}>{adminName}</p>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="logout-button" style={styles.logoutButton} onClick={logout}>
            <IoLogOutOutline size={18} color="#ffffff" />
            <span style={styles.logoutText}>Logout</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  sidebar: {
    width: "220px",
    background: "linear-gradient(180deg, #1A1851 0%, #0F0E3E 100%)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "#FFFFFF",
    position: "fixed",
    left: 0,
    top: 0,
  },

  sidebarContent: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "25px 0",
  },

  /* TOP CLUSTER */
  topCluster: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  /* LOGO */
  logoContainer: {
    position: "relative",
    padding: "0 20px",
    textAlign: "center",
  },
  logo: {
    width: 95,
    height: 95,
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 2,
  },
  logoGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(248,194,46,0.25) 0%, transparent 70%)",
  },

  /* NAVIGATION */
  navSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "0 15px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.3s ease",
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "rgba(248, 194, 46, 0.18)",
  },
  activeDot: {
    position: "absolute",
    right: "10px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#F8C22E",
  },
  navLabel: {
    fontSize: "15px",
    fontWeight: "500",
  },

  /* BOTTOM SECTION */
  bottomSection: {
    padding: "0 15px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  /* USER INFO */
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#F8C22E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /* LOGOUT */
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    backgroundColor: "rgba(246, 81, 100, 0.25)",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  logoutText: { opacity: 0.9 },
};

/* Hover effects */
const style = document.createElement("style");
style.textContent = `
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }
  .logout-button:hover {
    background-color: rgba(246, 81, 100, 0.35);
    transform: translateX(-3px);
  }
  .logo:hover { transform: scale(1.06); }
`;
document.head.appendChild(style);

export default AdminNavBar;

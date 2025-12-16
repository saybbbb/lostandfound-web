import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoHourglassOutline,
  IoLogOutOutline,
} from "react-icons/io5";

function StaffNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("");
  const [activePage, setActivePage] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staffName");
    navigate("/");
  };

  useEffect(() => {
    const cachedName = localStorage.getItem("staffName");
    if (cachedName) {
      setAdminName(cachedName);
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("StaffDashboard")) setActivePage("home");
    else if (path.includes("StaffLostApproval")) setActivePage("lost");
    else if (path.includes("StaffFoundApproval")) setActivePage("found");
    else if (path.includes("StaffPendingClaim")) setActivePage("claims");
  }, [location]);

  const navItems = [
    {
      icon: IoHomeOutline,
      page: "home",
      path: "/StaffDashboard",
      label: "Dashboard",
    },
    {
      icon: IoCheckmarkCircleOutline,
      page: "lost",
      path: "/StaffLostApproval",
      label: "Lost",
    },
    {
      icon: IoCubeOutline,
      page: "found",
      path: "/StaffFoundApproval",
      label: "Found",
    },
    {
      icon: IoHourglassOutline,
      page: "claims",
      path: "/StaffPendingClaim",
      label: "Claims",
    },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        <div style={styles.topCluster}>
          {/* LOGO */}
        <div style={styles.logoContainer}>
          <img
            src="/images/LAFLogo.png"
            alt="Logo"
            style={styles.logo}
            onClick={() => navigate("/StaffDashboard")}
          />
          <div style={styles.logoGlow} />
        </div>

        {/* NAVIGATION */}
        <div style={styles.navSection}>
          {navItems.map((item) => (
            <div
              key={item.page}
              style={{
                ...styles.navItem,
                ...(activePage === item.page ? styles.navItemActive : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              <div style={styles.navIconWrapper}>
                <item.icon
                  size={24}
                  color={activePage === item.page ? "#1A1851" : "#FFFFFF"}
                />
                {activePage === item.page && <div style={styles.activeDot} />}
              </div>
              <span style={styles.navLabel}>{item.label}</span>
              <div style={styles.navHoverEffect} />
            </div>
          ))}
        </div>

        </div>
        
        {/* ACCOUNT SECTION */}
        <div style={styles.accountSection}>
          <div style={styles.accountInfo}>
            <div style={styles.avatar}>
              <IoPersonOutline size={20} color="#1A1851" />
            </div>
            <p style={styles.accountName}>{adminName}</p>
          </div>
          <div
            style={styles.logoutButton}
            onClick={logout}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateX(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateX(0)")
            }
          >
            <IoLogOutOutline size={18} color="#ffffff" />
            <span style={styles.logoutText}>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    backgroundColor: "#1A1851",
    background: "linear-gradient(180deg, #1A1851 0%, #0F0E3E 100%)",
    minHeight: "100vh",
    color: "#FFFFFF",
    flexShrink: 0,
    position: "fixed",
    overflow: "hidden",
    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "30px 0",
    justifyContent: "space-between",
  },
  topCluster: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  logoContainer: {
    position: "relative",
    padding: "0 20px 40px",
    textAlign: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    marginBottom: "30px",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    position: "relative",
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
    background:
      "radial-gradient(circle, rgba(248, 194, 46, 0.2) 0%, transparent 70%)",
    zIndex: 1,
  },
  navSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "0 15px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },
  navItemActive: {
    backgroundColor: "rgba(248, 194, 46, 0.15)",
    transform: "translateX(5px)",
  },
  navIconWrapper: {
    position: "relative",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#F8C22E",
    boxShadow: "0 0 8px rgba(248, 194, 46, 0.8)",
  },
  navLabel: {
    fontSize: "15px",
    fontWeight: "500",
    opacity: 0.9,
    transition: "opacity 0.3s ease",
  },
  navHoverEffect: {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
    transition: "left 0.6s ease",
  },
  accountSection: {
    padding: "10px 20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "25px",
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    color: "#FFFFFF",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    backgroundColor: "rgba(246, 81, 100, 0.2)",
    color: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: "500",
  },
  logoutText: {
    opacity: 0.9,
  },
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement("style");
  style.textContent = `
    .nav-item:hover .nav-hover-effect {
      left: 100%;
    }
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    .logo:hover {
      transform: scale(1.05);
    }
    .logout-button:hover {
      background-color: rgba(246, 81, 100, 0.3);
      transform: translateX(-3px);
    }
  `;
  document.head.appendChild(style);
};

addHoverEffects();

export default StaffNavBar;

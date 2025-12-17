/* =========================
   IMPORTS
========================= */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoNotificationsOutline,
  IoPersonCircleOutline,
} from "react-icons/io5";
import api from "../../services/api";

/* =========================
   COMPONENT
========================= */
function Header() {
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [openProfile, setOpenProfile] = useState(false); // kept as-is
  const [unreadCount, setUnreadCount] = useState(0);

  /* =========================
     EFFECTS
  ========================= */

  // Load user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfilePhoto(res.data.user.profile_photo);
      } catch (err) {
        console.log("Error loading user data for header", err);
      }
    };

    fetchUserData();
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/api/auth/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUnreadCount(
          res.data.notifications.filter((n) => !n.is_read).length
        );
      }
    } catch (err) {
      console.log("Error fetching notifications");
    }
  };

  // Poll every 15 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const handleNotificationClick = () => {
    setOpenProfile(false);
    navigate("/Notifications");
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <img
          src="/images/LAFLogo.png"
          alt="Logo"
          style={styles.headerLogo}
        />
        <div>USTP LOST AND FOUND</div>
      </div>

      <div style={styles.links}>
        <div style={styles.linkItem} onClick={() => navigate("/Dashboard")}>
          Home
        </div>
        <div style={styles.linkItem} onClick={() => navigate("/LostItemPage")}>
          Lost Items
        </div>
        <div style={styles.linkItem} onClick={() => navigate("/FoundItemPage")}>
          Found Items
        </div>
        <div
          style={styles.linkItem}
          onClick={() => navigate("/ReportLostItemPage")}
        >
          Report Item
        </div>

        {/* Notifications */}
        <div
          aria-label="Notifications"
          onClick={handleNotificationClick}
          style={styles.iconBtn}
        >
          <IoNotificationsOutline size={26} color="white" />
          {unreadCount > 0 && (
            <div style={styles.badge}>{unreadCount}</div>
          )}
        </div>

        {/* Profile */}
        <div
          aria-label="Profile"
          onClick={() => navigate("/settings")}
          style={styles.iconBtn}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              style={styles.profileImage}
            />
          ) : (
            <IoPersonCircleOutline size={28} color="white" />
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    backgroundColor: "#1a1851",
    position: "relative",
    zIndex: 100,
  },

  logo: {
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
  },

  headerLogo: {
    height: 52,
    width: 52,
    marginRight: 12,
  },

  links: {
    display: "flex",
    gap: 20,
    fontWeight: 600,
    fontSize: 18,
    color: "white",
    alignItems: "center",
  },

  linkItem: {
    cursor: "pointer",
  },

  iconBtn: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    color: "white",
    fontSize: "11px",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid #1a1851",
  },

  profileImage: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
  },
};

export default Header;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import axios from "axios";

function Header() {
  const navigate = useNavigate();

  // KEEPING YOUR EXISTING PROFILE LOGIC
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  // CHANGED: Replaced 'openNotif' with 'unreadCount' for the badge
  const [unreadCount, setUnreadCount] = useState(0);

  // KEEPING YOUR EXISTING USER FETCH LOGIC
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfilePhoto(res.data.user.profile_photo);
      } catch (err) {
        console.log("Error loading user data for header", err);
      }
    };
    fetchUserData();
  }, []);

  // ADDED: Fetch Unread Notification Count
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/auth/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Count only unread items
        setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.log("Error fetching notifications");
    }
  };

  // ADDED: Poll for notifications every 15 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  // CHANGED: Navigate to page instead of toggling popup
  const handleNotificationClick = () => {
    setOpenProfile(false); // Close profile if open
    navigate("/Notifications");
  };

  const styles = {
    header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 24px",
      backgroundColor: "#1a1851",
      position: "relative",
      zIndex: 100,
    },
    logo: {
      fontWeight: "bold",
      fontSize: 20,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
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
      fontWeight: "600",
      fontSize: 18,
      color: "white",
      alignItems: "center",
    },
    linkItem: { cursor: "pointer" },
    iconBtn: { 
      cursor: "pointer", 
      display: "flex", 
      alignItems: "center",
      position: "relative" // Added for badge positioning
    },
    // ADDED: Badge style
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
      border: "1px solid #1a1851"
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.headerLogo} />
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

        {/* UPDATED: Notification Bell */}
        <div
          aria-label="Notifications"
          onClick={handleNotificationClick} // Updated handler
          style={styles.iconBtn}
        >
          <IoNotificationsOutline size={26} color="white" />
          {/* ADDED: Badge */}
          {unreadCount > 0 && <div style={styles.badge}>{unreadCount}</div>}
        </div>

        <div
          aria-label="Profile"
          onClick={() => navigate("/settings")}
          style={styles.iconBtn}
        >
          {profilePhoto && (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} 
            />
          )}
        </div>
      </div>
      
      {/* REMOVED: <NotificationBar /> panel */}
    </header>
  );
}

export default Header;
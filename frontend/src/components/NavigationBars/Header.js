import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline, IoPersonCircleOutline } from "react-icons/io5";
import ProfileBar from "./ProfileBar";
import NotificationBar from "./NotificationBar";

function Header() {
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleProfile = () => {
    // clicking icon should toggle; ensure notif panel closes
    setOpenNotif(false);
    setOpenProfile((s) => !s);
  };

  const toggleNotif = () => {
    // clicking icon should toggle; ensure profile panel closes
    setOpenProfile(false);
    setOpenNotif((s) => !s);
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
      zIndex: 100, // ensure header sits above page content but below menus
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
    iconBtn: { cursor: "pointer", display: "flex", alignItems: "center" },
  };

  const notifications = [
    { message: "Your claim was approved.", time: "Nov 29, 2025 14:12" },
    { message: "A new item reported near ICT.", time: "Nov 28, 2025 09:01" },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.headerLogo} />
        <div>USTP LOST AND FOUND</div>
      </div>

      <div style={styles.links}>
        <div style={styles.linkItem} onClick={() => navigate("/Dashboard")}>Home</div>
        <div style={styles.linkItem} onClick={() => navigate("/LostItemPage")}>Lost Items</div>
        <div style={styles.linkItem} onClick={() => navigate("/FoundItemPage")}>Found Items</div>
        <div style={styles.linkItem} onClick={() => navigate("/ReportLostItemPage")}>Report Item</div>

        <div
          aria-label="Notifications"
          onClick={toggleNotif}
          style={styles.iconBtn}
        >
          <IoNotificationsOutline size={26} color="white" />
        </div>

        <div
          aria-label="Profile"
          onClick={toggleProfile}
          style={styles.iconBtn}
        >
          <IoPersonCircleOutline size={26} color="white" />
        </div>
      </div>

      {/* Panels */}
      <NotificationBar
        open={openNotif}
        onClose={() => setOpenNotif(false)}
        notifications={notifications}
      />

      <ProfileBar
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onNavigate={(path) => navigate(path)}
        onLogout={logout}
      />
    </header>
  );
}

export default Header;

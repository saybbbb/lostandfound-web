/* =========================
   IMPORTS
========================= */
import React from "react";

/* =========================
   COMPONENT
========================= */
function ProfileBar({ open, onClose, onNavigate, onLogout }) {
  if (!open) return null;

  /* =========================
     RENDER
  ========================= */
  return (
    <div
      role="menu"
      aria-label="Profile menu"
      style={styles.container}
    >
      <div
        style={styles.item}
        onClick={() => {
          onNavigate("/profile");
          onClose();
        }}
      >
        Profile
      </div>

      <div
        style={styles.item}
        onClick={() => {
          onNavigate("/settings");
          onClose();
        }}
      >
        Settings
      </div>

      <div
        style={styles.logoutItem}
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        Logout
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    position: "absolute",
    top: 70,
    right: 20,
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    zIndex: 2000,
  },

  item: {
    padding: "10px 12px",
    cursor: "pointer",
    borderRadius: 6,
    marginBottom: 6,
    fontSize: 15,
  },

  logoutItem: {
    padding: "10px 12px",
    cursor: "pointer",
    borderRadius: 6,
    marginBottom: 6,
    fontSize: 15,
    color: "red",
    fontWeight: 600,
  },
};

export default ProfileBar;

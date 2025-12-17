/* =========================
   IMPORTS
========================= */
import React from "react";

/* =========================
   COMPONENT
========================= */
function NotificationBar({ open, notifications }) {
  if (!open) return null;

  /* =========================
     RENDER
  ========================= */
  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Notifications</h4>

      {!notifications || notifications.length === 0 ? (
        <p style={styles.empty}>No notifications</p>
      ) : (
        notifications.map((notif, i) => (
          <div key={i} style={styles.notification}>
            {notif.message}
          </div>
        ))
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    position: "absolute",
    top: "70px",
    right: "110px",
    width: "280px",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 100,
    maxHeight: "350px",
    overflowY: "auto",
  },

  title: {
    marginBottom: 10,
  },

  empty: {
    opacity: 0.6,
  },

  notification: {
    padding: "10px",
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    marginBottom: 8,
    fontSize: 14,
  },
};

export default NotificationBar;

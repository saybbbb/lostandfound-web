import React from "react";

function NotificationBar({ open, notifications }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "70px",
        right: "110px",
        width: "280px",
        background: "white",
        borderRadius: 10,
        padding: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 100,
        maxHeight: "350px",
        overflowY: "auto",
      }}
    >
      <h4 style={{ marginBottom: 10 }}>Notifications</h4>

      {(!notifications || notifications.length === 0) ? (
        <p style={{ opacity: 0.6 }}>No notifications</p>
      ) : (
        notifications.map((notif, i) => (
          <div
            key={i}
            style={{
              padding: "10px",
              background: "#f8f8f8",
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            {notif.message}
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationBar;

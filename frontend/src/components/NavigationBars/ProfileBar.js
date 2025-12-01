import React from "react";

function ProfileBar({ open, onClose, onNavigate, onLogout }) {
  
  if (!open) return null;

  return (
    <div
      role="menu"
      aria-label="Profile menu"
      style={{
        position: "absolute",
        top: 70,
        right: 20,
        width: 200,
        background: "#fff",
        borderRadius: 8,
        padding: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        zIndex: 2000,
      }}
    >
      <div
        style={itemStyle}
        onClick={() => {
          onNavigate("/profile");
          onClose();
        }}
      >
        Profile
      </div>

      <div
        style={itemStyle}
        onClick={() => {
          onNavigate("/settings");
          onClose();
        }}
      >
        Settings
      </div>

      <div
        style={{ ...itemStyle, color: "red", fontWeight: "600" }}
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

const itemStyle = {
  padding: "10px 12px",
  cursor: "pointer",
  borderRadius: 6,
  marginBottom: 6,
  fontSize: 15,
};

export default ProfileBar;

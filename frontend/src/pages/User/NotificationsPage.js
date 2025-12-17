// ============================= 1. IMPORTS =============================
import React, { useState, useEffect } from "react";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import {
  IoNotificationsOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import api from "../../services/api";

// ============================= 2. COMPONENT =============================
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await api.get("/api/auth/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.log("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // MARK ALL AS READ
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.put(
        "/api/auth/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.log("Error marking as read");
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " minutes ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hours ago";
    return Math.floor(seconds / 86400) + " days ago";
  };

  const getNotificationDetails = (type) => {
    switch (type) {
      case "match":
        return {
          icon: <IoSearchOutline size={24} />,
          title: "Potential Match Found",
          color: "#F59E0B", // Yellow
        };
      case "claim_request":
        return {
          icon: <IoNotificationsOutline size={24} />,
          title: "Item Claim Request",
          color: "#F59E0B", // Yellow
        };
      case "report_verified":
        return {
          icon: <IoCheckmarkCircleOutline size={24} />,
          title: "Report Verified",
          color: "#10B981", // Green
        };
      case "report_submitted":
        return {
          icon: <IoDocumentTextOutline size={24} />,
          title: "Report Submitted",
          color: "#3B82F6", // Blue
        };
      case "claim_update":
        return {
          icon: <IoShieldCheckmarkOutline size={24} />,
          title: "Item Claim Update",
          color: "#10B981", // Green
        };
      case "status_update":
        return {
          icon: <IoRefreshOutline size={24} />,
          title: "Status Update",
          color: "#3B82F6", // Blue
        };
      default:
        return {
          icon: <IoInformationCircleOutline size={24} />,
          title: "System Notification",
          color: "#6366F1", // Indigo
        };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "matches") return n.type === "match";
    if (filter === "claims")
      return n.type === "claim_request" || n.type === "claim_update";
    return true;
  });

  // ============================= 3. RENDER =============================
  return (
    <div style={styles.wrapper}>
      <Header />

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              Stay updated with your lost and found items
            </p>
          </div>
          <button style={styles.markReadBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        <div style={styles.tabs}>
          {[
            { id: "all", label: "All Notifications" },
            { id: "unread", label: "Unread" },
            { id: "matches", label: "Matches" },
            { id: "claims", label: "Claims" },
          ].map((tab) => (
            <TabButton
              key={tab.id}
              active={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              label={tab.label}
            />
          ))}
        </div>

        <div style={styles.list}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
          ) : filteredNotifications.length === 0 ? (
            <div style={styles.emptyState}>
              <IoNotificationsOutline size={48} color="#CBD5E1" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const details = getNotificationDetails(n.type);
              return (
                <div
                  key={n._id}
                  style={{
                    ...styles.card,
                    borderLeft: n.is_read
                      ? "1px solid #E5E7EB"
                      : `4px solid ${details.color}`,
                  }}
                >
                  <div style={{ ...styles.iconContainer, color: "black" }}>
                    {details.icon}
                  </div>
                  <div style={styles.content}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{details.title}</h3>
                      <span style={styles.time}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={styles.message}>{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Helper Component
const TabButton = ({ active, onClick, label }) => {
  const [hover, setHover] = useState(false);

  const baseStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid transparent",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: active ? "#1A1851" : hover ? "#E5E7EB" : "transparent",
    color: active ? "white" : "#6B7280",
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </button>
  );
};

// ============================= 4. STYLES =============================
const styles = {
  wrapper: {
    backgroundColor: "#F9FAFB",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "40px 20px",
    flex: 1,
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1A1851",
    margin: "0 0 8px 0",
  },
  subtitle: { color: "#6B7280", fontSize: "16px", margin: 0 },
  markReadBtn: {
    background: "none",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tabs: { display: "flex", gap: "10px", marginBottom: "24px" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    gap: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #E5E7EB",
    alignItems: "flex-start",
  },
  iconContainer: { marginTop: "2px" },
  content: { flex: 1 },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  time: { fontSize: "13px", color: "#9CA3AF" },
  message: {
    fontSize: "14px",
    color: "#4B5563",
    margin: 0,
    lineHeight: "1.5",
  },
  emptyState: { textAlign: "center", padding: "60px 0", color: "#9CA3AF" },
};

export default NotificationsPage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { 
  IoCheckmarkDoneOutline, 
  IoNotificationsOutline, 
  IoSearchOutline, 
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline
} from "react-icons/io5";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, matches, claims
  const [loading, setLoading] = useState(true);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/auth/notifications", {
        headers: { Authorization: `Bearer ${token}` }
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
      await axios.put("http://localhost:5000/api/auth/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state immediately
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.log("Error marking as read");
    }
  };

  // HELPER: Format Time (e.g., "2 hours ago")
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  // HELPER: Get Icon & Title based on Backend 'type'
  const getNotificationDetails = (type) => {
    switch (type) {
      case "match":
        return { icon: <IoSearchOutline size={24} />, title: "Potential Match Found", color: "#F59E0B" }; // Yellow
      case "claim_update":
        return { icon: <IoShieldCheckmarkOutline size={24} />, title: "Item Claim Update", color: "#10B981" }; // Green
      case "status_update":
        return { icon: <IoRefreshOutline size={24} />, title: "Status Update", color: "#3B82F6" }; // Blue
      default:
        return { icon: <IoInformationCircleOutline size={24} />, title: "System Notification", color: "#6366F1" }; // Indigo
    }
  };

  // FILTER LOGIC
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "matches") return n.type === "match";
    if (filter === "claims") return n.type === "claim_update";
    return true; // 'all'
  });

  return (
    <div style={styles.wrapper}>
      <Header />
      
      <div style={styles.container}>
        {/* PAGE HEADER */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>Stay updated with your lost and found items</p>
          </div>
          <button style={styles.markReadBtn} onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        {/* TABS / FILTERS */}
        <div style={styles.tabs}>
          {[
            { id: "all", label: "All Notifications" },
            { id: "unread", label: "Unread" },
            { id: "matches", label: "Matches" },
            { id: "claims", label: "Claims" }
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(filter === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div style={styles.list}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
          ) : filteredNotifications.length === 0 ? (
            <div style={styles.emptyState}>
              <IoNotificationsOutline size={48} color="#CBD5E1" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredItems(filteredNotifications, getNotificationDetails, timeAgo)
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Helper component to render list items clean
const filteredItems = (items, getDetails, timeAgo) => {
  return items.map((n) => {
    const details = getDetails(n.type);
    return (
      <div key={n._id} style={{ ...styles.card, borderLeft: n.is_read ? "none" : `4px solid #F59E0B` }}>
        <div style={styles.iconContainer}>
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
  });
};

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
    color: "#1F2937",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: "16px",
    margin: 0,
  },
  markReadBtn: {
    background: "none",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid transparent",
    background: "transparent",
    color: "#6B7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  activeTab: {
    backgroundColor: "#1A1851",
    color: "white",
    borderColor: "#1A1851",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    gap: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #E5E7EB", // Default border
    alignItems: "flex-start",
  },
  iconContainer: {
    marginTop: "2px",
    color: "#1A1851",
  },
  content: {
    flex: 1,
  },
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
  time: {
    fontSize: "13px",
    color: "#9CA3AF",
  },
  message: {
    fontSize: "14px",
    color: "#4B5563",
    margin: 0,
    lineHeight: "1.5",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "#9CA3AF",
  }
};

export default NotificationsPage;
import React, { useEffect, useState } from "react";
import usePageMetadata from "../../hooks/usePageMetadata";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import {
  IoNotificationsOutline,
  IoAddCircleOutline,
  IoEyeOutline,
} from "react-icons/io5";
import axios from "axios";

function StaffDashboard() {
  usePageMetadata("Staff Dashboard", "/images/LAFLogo.png");
  const [counts, setCounts] = useState({ lost: 0, found: 0, claims: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [statsAnimation, setStatsAnimation] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const [postsRes, claimsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/staff/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/auth/staff/claims/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const lost = postsRes.data.lost || [];
      const found = postsRes.data.found || [];
      const claims = claimsRes.data.claims || [];

      // Animate numbers
      setTimeout(() => {
        setCounts({
          lost: lost.length,
          found: found.length,
          claims: claims.length,
        });
        setStatsAnimation(true);
        setTimeout(() => setStatsAnimation(false), 1000);
      }, 300);

      // Recent activity
      const combined = [
        ...lost.map((i) => ({ ...i, type: "Lost Report", color: "#F65164" })),
        ...found.map((i) => ({ ...i, type: "Found Report", color: "#4ECB71" })),
        ...claims.map((i) => ({
          ...i,
          type: "Claim Request",
          color: "#F8C22E",
        })),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentItems(combined);
    } catch (err) {
      console.log("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatCircle = ({ number, label, borderColor, description, delay }) => (
    <div style={styles.statBox}>
      <div
        style={{
          ...styles.circle,
          borderColor,
          animation: statsAnimation
            ? `pulse ${0.5 + delay}s ease-in-out`
            : "none",
        }}
      >
        <p style={styles.circleNumber}>{loading ? "..." : number}</p>
        <p style={styles.circleLabel}>{label}</p>
      </div>
      <p style={styles.statText}>{description}</p>
      <div style={{ ...styles.statGlow, backgroundColor: borderColor }} />
    </div>
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>Good Day, Staff</h1>
            <p style={styles.subGreeting}>Here's what needs your attention</p>
          </div>
          <div style={styles.topIcons}>
            <div style={styles.notificationIcon}>
              <IoNotificationsOutline size={24} color="#1A1851" />
              <div style={styles.notificationBadge}>3</div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={styles.row}>
          <div style={styles.statsContainer}>
            <div style={styles.statsHeader}>
              <h3 style={styles.statsTitle}>Pending Reviews</h3>
              <p style={styles.statsSubtitle}>Items awaiting approval</p>
            </div>
            <div style={styles.statsRow}>
              <StatCircle
                number={counts.claims}
                label="Claim Reviews"
                borderColor="#F8C22E"
                description="New Claim Requests"
                delay={0.1}
              />
              <StatCircle
                number={counts.lost}
                label="Lost Report"
                borderColor="#F65164"
                description="New Lost Reports"
                delay={0.2}
              />
              <StatCircle
                number={counts.found}
                label="Found Report"
                borderColor="#4ECB71"
                description="New Found Items"
                delay={0.3}
              />
            </div>
          </div>

          {/* DATE TIME CARD */}
          <div style={styles.dateBox}>
            <div style={styles.dateContent}>
              <div style={styles.timeContainer}>
                <p style={styles.time}>{formatTime(time)}</p>
                <div style={styles.timeDots}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.timeDot,
                        animationDelay: `${i * 0.2}s`,
                        backgroundColor:
                          i === Math.floor(time.getSeconds() / 20)
                            ? "#F8C22E"
                            : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <p style={styles.todayLabel}>Today</p>
              <p style={styles.todayDate}>
                {time.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div style={styles.dateDecorations}>
              <div style={styles.decorationCircle} />
              <div
                style={{ ...styles.decorationCircle, left: "60%", top: "20%" }}
              />
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div style={styles.recentBox}>
          <div style={styles.recentHeader}>
            <h3 style={styles.recentTitle}>Recent Activity</h3>
            <button
              style={styles.refreshButton}
              onClick={loadDashboardData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div style={styles.recentList}>
            {recentItems.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No pending activities</p>
                <p style={styles.emptySub}>Everything is up to date!</p>
              </div>
            ) : (
              recentItems.map((item, index) => (
                <div
                  key={item._id}
                  style={{
                    ...styles.recentItem,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div style={styles.itemTypeIndicator}>
                    <div
                      style={{
                        ...styles.typeDot,
                        backgroundColor: item.color,
                      }}
                    />
                    <span style={styles.itemType}>{item.type}</span>
                  </div>
                  <div style={styles.itemDetails}>
                    <b>{item.name || item.itemName || "Unnamed Item"}</b>
                    <span style={styles.itemDate}>
                      {new Date(item.createdAt).toLocaleDateString()} •
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div style={styles.itemActions}>
                    <button style={styles.viewButton}>Review</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={styles.actionButtons}>
          <button style={styles.btnPrimary}>
            <IoAddCircleOutline size={20} />
            Add Announcement
          </button>
          <button style={styles.btnSecondary}>
            <IoEyeOutline size={20} />
            View Pending Posts
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)",
  },
  mainContent: {
    flex: 1,
    padding: "30px 40px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },
  greeting: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1A1851",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1A1851 0%, #0F0E3E 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subGreeting: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  topIcons: {
    display: "flex",
    gap: "20px",
  },
  notificationIcon: {
    position: "relative",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#F65164",
    color: "white",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  row: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
  },
  statsContainer: {
    flex: 2,
    background: "linear-gradient(135deg, #0F0E3E 0%, #1A1851 100%)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(15, 14, 62, 0.15)",
    position: "relative",
    overflow: "hidden",
  },
  statsHeader: {
    marginBottom: "30px",
  },
  statsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "0 0 5px 0",
  },
  statsSubtitle: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: 0,
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    textAlign: "center",
    color: "white",
    position: "relative",
    padding: "15px",
    transition: "transform 0.3s ease",
  },
  circle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    border: "10px solid",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    position: "relative",
    background: "rgba(255, 255, 255, 0.05)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
  circleNumber: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 5px 0",
    transition: "all 0.3s ease",
  },
  circleLabel: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.9,
  },
  statText: {
    marginTop: "15px",
    fontSize: "15px",
    fontWeight: "500",
    opacity: 0.9,
  },
  statGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    opacity: 0.1,
    filter: "blur(20px)",
    zIndex: -1,
  },
  dateBox: {
    flex: 1,
    background: "linear-gradient(135deg, #0F0E3E 0%, #1A1851 100%)",
    borderRadius: "24px",
    padding: "30px",
    color: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 14, 62, 0.15)",
  },
  dateContent: {
    position: "relative",
    zIndex: 2,
  },
  timeContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "15px",
    marginBottom: "20px",
  },
  time: {
    fontSize: "42px",
    fontWeight: "800",
    margin: 0,
    fontFamily: "'SF Mono', monospace",
    letterSpacing: "2px",
  },
  timeDots: {
    display: "flex",
    gap: "4px",
    marginBottom: "10px",
  },
  timeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  todayLabel: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "0 0 5px 0",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  todayDate: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
  },
  dateDecorations: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  decorationCircle: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(248, 194, 46, 0.1) 0%, transparent 70%)",
    top: "-40px",
    left: "30%",
  },
  recentBox: {
    background: "#FFFFFF",
    padding: "30px",
    borderRadius: "24px",
    marginBottom: "30px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
  },
  recentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  recentTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1A1851",
    margin: 0,
  },
  refreshButton: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  recentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    borderLeft: "4px solid",
    animation: "slideIn 0.5s ease-out forwards",
    opacity: 0,
  },
  itemTypeIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },
  typeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  itemType: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
  },
  itemDetails: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemDate: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  itemActions: {
    flex: 1,
    textAlign: "right",
  },
  viewButton: {
    background: "linear-gradient(135deg, #1A1851 0%, #0F0E3E 100%)",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#94a3b8",
  },
  emptySub: {
    fontSize: "14px",
    marginTop: "8px",
    opacity: 0.7,
  },
  actionButtons: {
    display: "flex",
    gap: "20px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1A1851 0%, #0F0E3E 100%)",
    color: "white",
    border: "none",
    padding: "16px 30px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(26, 24, 81, 0.2)",
  },
  btnSecondary: {
    background: "transparent",
    color: "#1A1851",
    border: "2px solid #1A1851",
    padding: "16px 30px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
  },
};

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stat-box:hover {
    transform: translateY(-5px);
  }
  
  .stat-box:hover .circle {
    transform: scale(1.05);
  }
  
  .stat-box:hover .circle-number {
    transform: scale(1.1);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(26, 24, 81, 0.3);
  }
  
  .btn-secondary:hover {
    background-color: #1A1851;
    color: white;
    transform: translateY(-2px);
  }
  
  .view-button:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 12px rgba(26, 24, 81, 0.2);
  }
  
  .refresh-button:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  .notification-icon:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;
document.head.appendChild(style);

export default StaffDashboard;

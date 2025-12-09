import React, { useState, useEffect, useCallback } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { 
  IoSearchOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoEyeOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StaffFoundApproval() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchFoundItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoundItems(res.data.found || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFoundItems();
  }, [fetchFoundItems]);

  const approveItem = async (itemId) => {
    setApprovingId(itemId);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/approve",
        { itemId, type: "found" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      animateRemoval(itemId);
      showNotification("✓ Found item approved successfully!", "success");
    } catch (err) {
      showNotification("Approval failed.", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectItem = async (itemId) => {
    setRejectingId(itemId);
    const reason = prompt("Please provide a reason for rejecting this item:");
    if (!reason) {
      setRejectingId(null);
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/reject",
        { itemId, type: "found", reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      animateRemoval(itemId);
      showNotification("✗ Found item rejected.", "warning");
    } catch (err) {
      showNotification("Rejection failed.", "error");
    } finally {
      setRejectingId(null);
    }
  };

  const animateRemoval = (itemId) => {
    setFoundItems(prev => prev.filter(item => item._id !== itemId));
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 16px 24px;
      background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444'};
      color: white; border-radius: 10px; font-weight: 600; z-index: 1000;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filtered = foundItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.posted_by?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />
      <div style={styles.mainContent}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Found Item Approval</h1>
            <p style={styles.subtitle}>Review found item submissions from users</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.statsBadge}>
              <IoTimeOutline size={18} />
              <span>{foundItems.length} Pending</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <IoSearchOutline size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search found items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.controlGroup}>
            <button style={styles.refreshButton} onClick={fetchFoundItems} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading found items...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <IoInformationCircleOutline size={64} color="#cbd5e1" />
              <h3>No pending found items</h3>
              <p>All found item submissions have been reviewed</p>
            </div>
          ) : (
            <div style={styles.itemsGrid}>
              {filtered.map((item, index) => (
                <div key={item._id} style={{ ...styles.itemCard, animationDelay: `${index * 0.05}s` }}>
                  
                  {/* CARD HEADER */}
                  <div style={styles.cardHeader}>
                    <div style={styles.itemAvatar}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemTitle}>{item.name}</h3>
                      <div style={styles.itemMeta}>
                        <span style={styles.itemStatus}>Pending</span>
                        <span style={styles.itemDate}>
                          {formatRelativeTime(item.date_found || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={styles.cardBody}>
                    <p style={styles.itemDescription}>
                      {item.description || "No description provided"}
                    </p>
                    <div style={styles.location}>
                      <IoLocationOutline size={16} />
                      <span>{item.found_location}</span>
                    </div>

                    <div style={styles.submitterInfo}>
                      <div style={styles.submitterAvatar}>
                        {item.posted_by?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div style={styles.submitterName}>
                          {item.posted_by?.name || "Unknown"}
                        </div>
                        <div style={styles.submitterEmail}>
                          {item.posted_by?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div style={styles.cardFooter}>
                    <button
                      style={styles.viewDetailsBtn}
                      onClick={() => navigate(`/StaffFoundReview/${item._id}`)}
                    >
                      <IoEyeOutline size={18} /> Review
                    </button>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => approveItem(item._id)}
                        disabled={approvingId === item._id}
                      >
                        {approvingId === item._id ? <div style={styles.loadingDots}/> : <IoCheckmarkCircleOutline size={18} />}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => rejectItem(item._id)}
                        disabled={rejectingId === item._id}
                      >
                        {rejectingId === item._id ? <div style={styles.loadingDots}/> : <IoCloseCircleOutline size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}

const styles = {
  /* ================================
     LAYOUT & CONTAINER
  ================================== */
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)",
  },

  mainContent: {
    flex: 1,
    padding: "30px 40px",
    overflowY: "auto",
  },

  /* ================================
     HEADER
  ================================== */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
  },

  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1A1851",
  },

  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    marginTop: "6px",
  },

  headerActions: {
    display: "flex",
    gap: "20px",
  },

  statsBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "rgba(248, 194, 46, 0.15)",
    color: "#d97706",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
  },

  /* ================================
     SEARCH & CONTROLS
  ================================== */
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },

  searchContainer: {
    flex: 1,
    position: "relative",
    maxWidth: "600px",
  },

  searchInput: {
    width: "100%",
    padding: "16px 16px 16px 52px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    background: "#fff",
    transition: "all 0.25s ease",
  },

  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },

  controlGroup: {
    display: "flex",
    gap: "12px",
  },

  refreshButton: {
    padding: "14px 28px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  /* ================================
     GRID ITEMS / CARD LIST
  ================================== */
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },

  itemCard: {
    background: "#fff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    animation: "slideInCard 0.5s forwards",
    opacity: 0,
    transform: "translateY(10px)",
    display: "flex",
    flexDirection: "column",
  },

  /* ================================
     CARD HEADER
  ================================== */
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    borderBottom: "1px solid #f1f5f9",
  },

  itemAvatar: {
    width: "60px",
    height: "60px",
    background: "#dbeafe",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "22px",
    color: "#1A1851",
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
  },

  itemTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "6px",
  },

  itemMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  itemStatus: {
    padding: "4px 12px",
    background: "#fef3c7",
    color: "#d97706",
    borderRadius: "20px",
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  itemDate: {
    fontSize: "14px",
    color: "#94a3b8",
  },

  /* ================================
     CARD BODY
  ================================== */
  cardBody: {
    padding: "24px",
    flex: 1,
  },

  itemDescription: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "16px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
  },

  /* ================================
     SUBMITTER INFO BLOCK
  ================================== */
  submitterInfo: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
  },

  submitterAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e0f2fe",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
    color: "#0369a1",
  },

  submitterName: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "15px",
  },

  submitterEmail: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  /* ================================
     CARD FOOTER
  ================================== */
  cardFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },

  viewDetailsBtn: {
    padding: "10px 20px",
    background: "transparent",
    color: "#1A1851",
    border: "2px solid #1A1851",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "0.25s",
  },

  actionButtons: {
    display: "flex",
    gap: "10px",
  },

  approveBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    padding: "10px",
    background: "#10B981",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.25s",
  },

  rejectBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    padding: "10px",
    background: "#EF4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.25s",
  },

  /* ================================
     EMPTY & LOADING
  ================================== */
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  loadingContainer: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #1A1851",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },

  loadingDots: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 1.5s ease-in-out infinite",
  },
};


// CSS Animation Injection
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes slideInCard { to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
  .view-details-btn:hover { background-color: #1A1851 !important; color: #fff !important; }
  .approve-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
  .reject-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
`;
document.head.appendChild(style);

export default StaffFoundApproval;
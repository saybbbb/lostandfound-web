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
  const [filter, setFilter] = useState("all"); 
  const token = localStorage.getItem("token");

  // FIX: Wrapped in useCallback to make it a stable dependency for useEffect
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

  // FIX: Added fetchFoundItems to dependency array
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

      animateRemoval(itemId, -100);
      showNotification("✓ Found item approved successfully!", "success");
    } catch (err) {
      console.log(err);
      showNotification("Approval failed. Please try again.", "error");
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

      animateRemoval(itemId, 100);
      showNotification("✗ Found item rejected.", "warning");
    } catch (err) {
      console.log(err);
      showNotification("Rejection failed. Please try again.", "error");
    } finally {
      setRejectingId(null);
    }
  };

  const animateRemoval = (itemId, direction) => {
    const itemElement = document.getElementById(`found-item-${itemId}`);
    if (itemElement) {
      itemElement.style.transform = `translateX(${direction}%)`;
      itemElement.style.opacity = "0";
      setTimeout(() => {
        setFoundItems(prev => prev.filter(item => item._id !== itemId));
      }, 300);
    } else {
      setFoundItems(prev => prev.filter(item => item._id !== itemId));
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444'};
      color: white;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-out 2.7s;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // FIX: Removed unused 'getStatusColor' function

  const filteredItems = foundItems
    .filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.posted_by?.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "recent") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filter === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

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
              <span>{foundItems.length} Pending Items</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <IoSearchOutline size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by item name, description, or submitter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Items</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
            
            <button 
              style={styles.refreshButton}
              onClick={fetchFoundItems}
              disabled={loading}
            >
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
          ) : filteredItems.length === 0 ? (
            <div style={styles.emptyState}>
              <IoInformationCircleOutline size={64} color="#cbd5e1" />
              <h3>No pending found items</h3>
              <p>All found items have been reviewed and processed</p>
            </div>
          ) : (
            <div style={styles.itemsGrid}>
              {filteredItems.map((item, index) => (
                <div 
                  key={item._id}
                  id={`found-item-${item._id}`}
                  style={{
                    ...styles.itemCard,
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.itemAvatar}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemTitle}>{item.name}</h3>
                      <div style={styles.itemMeta}>
                        <span style={styles.itemStatus}>
                          {item.approval_status || 'pending'}
                        </span>
                        <span style={styles.itemDate}>
                          {formatDate(item.date_found || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.itemDescription}>
                      {item.description || "No description provided"}
                    </p>
                    
                    {item.location && (
                      <div style={styles.location}>
                        <IoLocationOutline size={16} />
                        <span>{item.location}</span>
                      </div>
                    )}

                    <div style={styles.submitterInfo}>
                      <div style={styles.submitterAvatar}>
                        {item.posted_by?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div style={styles.submitterName}>
                          {item.posted_by?.name || "Unknown User"}
                        </div>
                        <div style={styles.submitterEmail}>
                          {item.posted_by?.email || "No email provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <button
                      style={styles.viewDetailsBtn}
                      onClick={() => navigate(`/StaffFoundReview/${item._id}`)}
                    >
                      <IoEyeOutline size={18} />
                      View Details
                    </button>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => approveItem(item._id)}
                        disabled={approvingId === item._id}
                      >
                        {approvingId === item._id ? (
                          <div style={styles.loadingDots}></div>
                        ) : (
                          <>
                            <IoCheckmarkCircleOutline size={18} />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => rejectItem(item._id)}
                        disabled={rejectingId === item._id}
                      >
                        {rejectingId === item._id ? (
                          <div style={styles.loadingDots}></div>
                        ) : (
                          <>
                            <IoCloseCircleOutline size={18} />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Summary</h4>
            <div style={styles.summaryStats}>
              <div style={styles.summaryStat}>
                <span style={styles.statLabel}>Total Items</span>
                <span style={styles.statValue}>{foundItems.length}</span>
              </div>
              <div style={styles.summaryStat}>
                <span style={styles.statLabel}>Showing</span>
                <span style={styles.statValue}>{filteredItems.length}</span>
              </div>
              <div style={styles.summaryStat}>
                <span style={styles.statLabel}>Last Updated</span>
                <span style={styles.statValue}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

const styles = {
  // ... (Same styles as provided previously)
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
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1A1851",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1A1851 0%, #0F0E3E 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
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
    backgroundColor: "rgba(248, 194, 46, 0.15)",
    color: "#d97706",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
  },
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
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  searchInput: {
    width: "100%",
    padding: "16px 16px 16px 52px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    outline: "none",
  },
  controlGroup: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  filterSelect: {
    padding: "14px 20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    fontSize: "15px",
    color: "#475569",
    cursor: "pointer",
    outline: "none",
    minWidth: "160px",
  },
  refreshButton: {
    padding: "14px 28px",
    backgroundColor: "#1A1851",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  content: {
    marginBottom: "30px",
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
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94a3b8",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    animation: "slideInCard 0.5s ease-out forwards",
    opacity: 0,
    transform: "translateY(10px)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px 24px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  itemAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "14px",
    backgroundColor: "#dbeafe",
    color: "#1A1851",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  itemMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  itemStatus: {
    padding: "4px 12px",
    backgroundColor: "#fef3c7",
    color: "#d97706",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemDate: {
    fontSize: "14px",
    color: "#94a3b8",
  },
  cardBody: {
    padding: "20px 24px",
    flex: 1,
  },
  itemDescription: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  },
  location: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
  },
  submitterInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },
  submitterAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    flexShrink: 0,
  },
  submitterName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "2px",
  },
  submitterEmail: {
    fontSize: "13px",
    color: "#94a3b8",
  },
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
    backgroundColor: "transparent",
    color: "#1A1851",
    border: "2px solid #1A1851",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
  },
  approveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#10B981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  rejectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#EF4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loadingDots: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  summary: {
    marginBottom: "30px",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 20px 0",
  },
  summaryStats: {
    display: "flex",
    gap: "30px",
  },
  summaryStat: {
    flex: 1,
  },
  statLabel: {
    display: "block",
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "8px",
  },
  statValue: {
    display: "block",
    fontSize: "24px",
    fontWeight: "800",
    color: "#1A1851",
  },
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes slideInCard {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }

  .search-input:focus {
    border-color: #1A1851;
    box-shadow: 0 0 0 3px rgba(26, 24, 81, 0.1);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: #0F0E3E;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(26, 24, 81, 0.3);
  }

  .refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }

  .view-details-btn:hover {
    background-color: #1A1851;
    color: white;
    transform: translateY(-2px);
  }

  .approve-btn:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .reject-btn:hover:not(:disabled) {
    background-color: #DC2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .approve-btn:disabled,
  .reject-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .filter-select:hover {
    border-color: #1A1851;
  }
`;
document.head.appendChild(style);

export default StaffFoundApproval;
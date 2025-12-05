import React, { useState, useEffect } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { 
  IoSearchOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoTimeOutline,
  IoInformationCircleOutline
} from "react-icons/io5";
import axios from "axios";

function StaffLostApproval() {
  const [search, setSearch] = useState("");
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const token = localStorage.getItem("token");

  // LOAD PENDING LOST ITEMS
  useEffect(() => {
    fetchLostItems();
  }, [token]);

  const fetchLostItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLostItems(res.data.lost || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // APPROVE LOST ITEM
  const approveItem = async (itemId) => {
    setApprovingId(itemId);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/approve",
        { itemId, type: "lost" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Animated removal
      const itemElement = document.getElementById(`item-${itemId}`);
      if (itemElement) {
        itemElement.style.transform = "translateX(-100%)";
        itemElement.style.opacity = "0";
        setTimeout(() => {
          setLostItems(prev => prev.filter(item => item._id !== itemId));
        }, 300);
      } else {
        setLostItems(prev => prev.filter(item => item._id !== itemId));
      }

      showNotification("✓ Lost item approved successfully!", "success");
    } catch (err) {
      console.log(err);
      showNotification("Approval failed. Please try again.", "error");
    } finally {
      setApprovingId(null);
    }
  };

  // REJECT LOST ITEM
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
        { itemId, type: "lost", reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Animated removal
      const itemElement = document.getElementById(`item-${itemId}`);
      if (itemElement) {
        itemElement.style.transform = "translateX(100%)";
        itemElement.style.opacity = "0";
        setTimeout(() => {
          setLostItems(prev => prev.filter(item => item._id !== itemId));
        }, 300);
      } else {
        setLostItems(prev => prev.filter(item => item._id !== itemId));
      }

      showNotification("✗ Lost item rejected.", "warning");
    } catch (err) {
      console.log(err);
      showNotification("Rejection failed. Please try again.", "error");
    } finally {
      setRejectingId(null);
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

  const filtered = lostItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Lost Item Approval</h1>
            <p style={styles.subtitle}>Review and manage lost item submissions</p>
          </div>
          <div style={styles.statsBadge}>
            <IoTimeOutline size={18} />
            <span>{lostItems.length} Pending</span>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <IoSearchOutline size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search lost items by name, description, or reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button 
            style={styles.refreshButton}
            onClick={fetchLostItems}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading lost items...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <IoInformationCircleOutline size={48} color="#cbd5e1" />
              <h3>No pending lost items</h3>
              <p>All lost item submissions have been reviewed</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Item Details</th>
                    <th style={styles.th}>Reporter</th>
                    <th style={styles.th}>Date & Time</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, index) => (
                    <tr 
                      key={row._id} 
                      id={`item-${row._id}`}
                      style={{
                        ...styles.tableRow,
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.itemCell}>
                          <div style={styles.itemAvatar}>
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={styles.itemName}>{row.name}</div>
                            <div style={styles.itemDesc}>
                              {row.description || "No description provided"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.userAvatar}>
                            {row.reported_by?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div style={styles.userName}>
                              {row.reported_by?.name || "Unknown"}
                            </div>
                            <div style={styles.userEmail}>
                              {row.reported_by?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <div style={styles.date}>{formatDate(row.date_lost)}</div>
                          <div style={styles.time}>
                            {row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={styles.actionTd}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.approveBtn}
                            onClick={() => approveItem(row._id)}
                            disabled={approvingId === row._id}
                          >
                            {approvingId === row._id ? (
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
                            onClick={() => rejectItem(row._id)}
                            disabled={rejectingId === row._id}
                          >
                            {rejectingId === row._id ? (
                              <div style={styles.loadingDots}></div>
                            ) : (
                              <>
                                <IoCloseCircleOutline size={18} />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SUMMARY FOOTER */}
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Pending:</span>
            <span style={styles.summaryValue}>{lostItems.length}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Showing:</span>
            <span style={styles.summaryValue}>{filtered.length} items</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Last Updated:</span>
            <span style={styles.summaryValue}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
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
  statsBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "rgba(248, 194, 46, 0.15)",
    color: "#d97706",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: "600",
  },
  searchSection: {
    display: "flex",
    flexWrap: "warp",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },
  searchContainer: {
    flex: 1,
    position: "relative",
    minWidth: "200px"
  },
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  searchInput: {
    width: "75%",
    padding: "16px 16px 16px 52px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
    outline: "none",
  },
  refreshButton: {
    flexShrink: 0,
    minWidth: "150px",
    padding: "14px 28px",
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
    marginBottom: "25px",
  },
  loadingContainer: {
    padding: "60px 20px",
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
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  th: {
    padding: "22px 24px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "left",
  },
  tableRow: {
    animation: "slideInRow 0.5s ease-out forwards",
    opacity: 0,
    transform: "translateY(10px)",
    borderBottom: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  td: {
    padding: "20px 24px",
    verticalAlign: "middle",
  },
  itemCell: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  itemAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
    flexShrink: 0,
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  itemDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.4",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f0f9ff",
    color: "#1A1851",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    flexShrink: 0,
  },
  userName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "2px",
  },
  userEmail: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  dateCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  date: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1e293b",
  },
  time: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  actionTd: {
    padding: "20px 24px",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  approveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#10B981",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    justifyContent: "center",
  },
  rejectBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#EF4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    justifyContent: "center",
  },
  loadingDots: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    marginBottom: "30px",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  summaryValue: {
    fontSize: "18px",
    fontWeight: "700",
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

  @keyframes slideInRow {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }

  .search-input:focus {
    border-color: #1A1851;
    box-shadow: 0 0 0 3px rgba(26, 24, 81, 0.1);
  }

  .refresh-button:hover {
    background-color: #f8fafc;
    transform: translateY(-2px);
  }

  .table-row:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
  }

  .approve-btn:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
  }

  .reject-btn:hover:not(:disabled) {
    background-color: #DC2626;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
  }

  .approve-btn:disabled,
  .reject-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);

export default StaffLostApproval;
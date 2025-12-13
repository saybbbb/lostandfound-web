import React, { useState, useEffect, useCallback } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { 
  IoSearchOutline, 
  IoTimeOutline,
  IoInformationCircleOutline,
  IoEyeOutline 
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function StaffPendingClaim() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/staff/claims/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data.claims || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filtered = claims.filter((claim) =>
    claim.claimed_by?.name?.toLowerCase().includes(search.toLowerCase()) ||
    claim.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />
      <div style={styles.mainContent}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Pending Claims</h1>
            <p style={styles.subtitle}>Review claim submissions from students</p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.statsBadge}>
              <IoTimeOutline size={18} />
              <span>{claims.length} Pending</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <IoSearchOutline size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.controlGroup}>
            <button style={styles.refreshButton} onClick={fetchClaims} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading pending claims...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <IoInformationCircleOutline size={64} color="#cbd5e1" />
              <h3>No pending claims</h3>
              <p>All claims have been reviewed</p>
            </div>
          ) : (
            <div style={styles.itemsGrid}>
              {filtered.map((claim, index) => (
                <div key={claim._id} style={{ ...styles.itemCard, animationDelay: `${index * 0.05}s` }}>
                  
                  {/* CARD HEADER */}
                  <div style={styles.cardHeader}>
                    <div style={styles.itemAvatar}>
                      {claim.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemTitle}>{claim.name}</h3>
                      <div style={styles.itemMeta}>
                        <span style={styles.itemStatus}>Pending</span>
                        <span style={styles.itemDate}>
                          {formatRelativeTime(claim.claimed_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={styles.cardBody}>
                    <div style={styles.submitterInfo}>
                      <div style={styles.submitterAvatar}>
                        {claim.claimed_by?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div style={styles.submitterName}>
                          {claim.claimed_by?.name}
                        </div>
                        <div style={styles.submitterEmail}>
                          {claim.claimed_by?.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                      <span style={{fontSize: 14, color: '#64748b'}}>Claim Type:</span>
                      <span style={{fontSize: 14, fontWeight: 600, color: '#1A1851'}}>Item Recovery</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                      <span style={{fontSize: 14, color: '#64748b'}}>Submitted:</span>
                      <span style={{fontSize: 14, fontWeight: 600, color: '#1A1851'}}>
                        {new Date(claim.claimed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div style={styles.cardFooter}>
                    <button
                      style={{...styles.viewDetailsBtn, width: '100%', justifyContent: 'center'}}
                      onClick={() => navigate(`/StaffClaimReview/${claim._id}`)}
                    >
                      <IoEyeOutline size={18} /> Review Claim
                    </button>
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

// Consistent Styling Object – Polished & Professional
const styles = {
  /* ================================
     LAYOUT
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
    fontWeight: 800,
    color: "#1A1851",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#64748b",
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
    fontWeight: 600,
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
    background: "#fff",
    outline: "none",
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
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  /* ================================
     GRID OF CARDS
  ================================== */
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },

  itemCard: {
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    opacity: 0,
    transform: "translateY(10px)",
    animation: "slideInCard 0.5s forwards",
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
    borderRadius: "14px",
    background: "#dbeafe",
    color: "#1A1851",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    fontWeight: 700,
    flexShrink: 0,
  },

  itemInfo: { flex: 1 },

  itemTitle: {
    fontSize: "18px",
    fontWeight: 700,
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
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#d97706",
    fontWeight: 600,
    fontSize: "12px",
    textTransform: "uppercase",
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

  /* SUBMITTER */
  submitterInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
  },

  submitterAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 600,
  },

  submitterName: {
    fontWeight: 600,
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
    borderRadius: "10px",
    border: "2px solid #1A1851",
    background: "transparent",
    color: "#1A1851",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "0.25s ease",
  },

  /* ================================
     LOADING / EMPTY
  ================================== */
  loadingDots: {
    width: "20px",
    height: "20px",
    backgroundColor: "currentColor",
    borderRadius: "50%",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#ffffff",
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
};


// CSS Animation Injection
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes slideInCard { to { opacity: 1; transform: translateY(0); } }
  .view-details-btn:hover { background-color: #1A1851 !important; color: #fff !important; }
`;
document.head.appendChild(style);

export default StaffPendingClaim;
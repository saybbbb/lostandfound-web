import React, { useState, useEffect } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { 
  IoSearchOutline, 
  IoEyeOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoPersonOutline,
  IoCalendarOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StaffPendingClaim() {
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/staff/claims/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClaims(res.data.claims || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const mins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (mins < 60) return `${mins} min ago`;
    if (hrs < 24) return `${hrs} hrs ago`;
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filtered = claims.filter((row) =>
    row.claimed_by?.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.claimed_by?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewClaim = (id) => navigate(`/StaffClaimReview/${id}`);

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

        {/* CONTROLS – MATCH FOUND UI */}
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <IoSearchOutline size={20} color="#94a3b8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by student, item, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.controlGroup}>
            <button 
              style={styles.refreshButton}
              onClick={fetchClaims}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
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
                <div
                  key={claim._id}
                  style={{
                    ...styles.itemCard,
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  
                  {/* CARD HEADER */}
                  <div style={styles.cardHeader}>
                    <div style={styles.itemAvatar}>
                      {claim.name?.charAt(0).toUpperCase() || "C"}
                    </div>

                    <div style={styles.itemInfo}>
                      <h3 style={styles.itemTitle}>{claim.name}</h3>
                      <div style={styles.itemMeta}>
                        <span style={styles.itemStatus}>pending</span>
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

                    <div style={styles.claimDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Claim Type:</span>
                        <span style={styles.detailValue}>Item Recovery</span>
                      </div>

                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Submitted:</span>
                        <span style={styles.detailValue}>
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div style={styles.cardFooter}>
                    <button
                      style={styles.viewDetailsBtn}
                      onClick={() => handleViewClaim(claim._id)}
                    >
                      <IoEyeOutline size={18} />
                      Review Claim
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

/* ------------------ STYLES (Copied & Matched to Found UI) ------------------ */

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)",
  },

  mainContent: { flex: 1, padding: "30px 40px", overflowY: "auto" },

  /* HEADER */
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
  subtitle: { fontSize: "16px", color: "#64748b" },

  headerActions: { display: "flex", gap: "20px" },
  statsBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "rgba(248, 194, 46, 0.15)",
    color: "#d97706",
    borderRadius: "12px",
    fontWeight: "600",
  },

  /* CONTROLS */
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
  },
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
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
  },

  /* CONTENT GRID */
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },

  /* CARD */
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

  /* CARD HEADER */
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
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: "18px", fontWeight: "700" },
  itemMeta: { display: "flex", gap: "12px", alignItems: "center" },
  itemStatus: {
    background: "#fef3c7",
    padding: "4px 12px",
    borderRadius: "20px",
    color: "#d97706",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  itemDate: { fontSize: "14px", color: "#94a3b8" },

  /* CARD BODY */
  cardBody: { padding: "24px" },

  submitterInfo: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "20px",
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
  },
  submitterName: { fontWeight: "600" },
  submitterEmail: { fontSize: "13px", color: "#94a3b8" },

  claimDetails: { display: "flex", flexDirection: "column", gap: "12px" },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
  },
  detailLabel: { fontSize: "14px", color: "#64748b" },
  detailValue: { fontSize: "14px", fontWeight: "600" },

  /* FOOTER */
  cardFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #f1f5f9",
  },
  viewDetailsBtn: {
    width: "100%",
    padding: "12px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: "10px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    border: "none",
  },

  /* EMPTY STATE */
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  loadingContainer: { padding: "80px 20px", textAlign: "center" },
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

export default StaffPendingClaim;

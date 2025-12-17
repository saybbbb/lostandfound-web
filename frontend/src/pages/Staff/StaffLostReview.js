import React, { useEffect, useState } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowBackOutline,
  IoImageOutline,
  IoPersonOutline,
  IoCubeOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoCallOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import usePageMetadata from "../../hooks/usePageMetadata";

export default function StaffLostReview() {
  usePageMetadata("Staff Lost Review", "/images/LAFLogo.png");

  const { id } = useParams(); // expected route: /StaffLostReview/:id
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Defensive: ensure res.data.lost is an array
      const lostList = Array.isArray(res.data?.lost) ? res.data.lost : [];
      const found = lostList.find((li) => String(li._id) === String(id));

      if (found) {
        setItem(found);
      } else {
        setItem(null);
      }
    } catch (err) {
      console.error("Error fetching lost item:", err);
      showNotification("Failed to load item details", "error");
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${
        type === "success"
          ? "#10B981"
          : type === "warning"
          ? "#F59E0B"
          : "#EF4444"
      };
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

  const approve = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await api.post(
        "/api/auth/staff/approve",
        { itemId: id, type: "lost" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("✓ Lost item approved successfully!", "success");
      setTimeout(() => navigate("/StaffLostApproval"), 1400);
    } catch (err) {
      console.error("Approval error:", err);
      showNotification("Failed to approve item", "error");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (processing) return;
    const reason = prompt(
      "Please provide a detailed reason for rejecting this report:"
    );
    if (!reason) return;
    setProcessing(true);
    try {
      await api.post(
        "/api/auth/staff/reject",
        { itemId: id, type: "lost", reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("✗ Item rejected", "warning");
      setTimeout(() => navigate("/StaffLostApproval"), 1400);
    } catch (err) {
      console.error("Rejection error:", err);
      showNotification("Failed to reject item", "error");
    } finally {
      setProcessing(false);
    }
  };

  const requestMoreInfo = () => {
    // This mirrors ClaimReview behaviour: simple UI notification.
    showNotification("Info request sent to reporter", "success");
    // Optional: send backend notification/email here if implemented server-side.
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <StaffNavBar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h3>Loading Item Details...</h3>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.container}>
        <StaffNavBar />
        <div style={styles.errorContainer}>
          <IoWarningOutline size={64} color="#EF4444" />
          <h2>Item Not Found</h2>
          <p>
            The requested lost item could not be found or has been processed.
          </p>
          <button
            style={styles.backButton}
            onClick={() => navigate("/StaffLostApproval")}
          >
            <IoArrowBackOutline size={18} /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <StaffNavBar />
      <div style={styles.main}>
        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <button
              style={styles.backNavButton}
              onClick={() => navigate("/StaffLostApproval")}
            >
              <IoArrowBackOutline size={20} /> Back to List
            </button>
            <div style={styles.headerBracket}>
              <div style={styles.headerInfo}>
                <h1 style={styles.title}>Lost Item Review</h1>
                <p style={styles.subtitle}>
                  Review lost item report before publishing
                </p>
              </div>

              <div style={styles.claimStatus}>
                <span style={styles.statusBadge}>Pending Approval</span>
                <span style={styles.claimId}>
                  ID: {String(item._id).substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          <div style={styles.contentGrid}>
            {/* LEFT COLUMN: Item Info + Reporter */}
            <div style={styles.detailsColumn}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <IoCubeOutline size={24} color="#1A1851" />
                  <h3 style={styles.cardTitle}>Item Information</h3>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Item Name</span>
                    <span style={styles.detailValue}>
                      {item.name || "Unnamed Item"}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Category</span>
                    <span style={styles.detailValue}>
                      {item.category?.name || "Uncategorized"}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Location Lost</span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <IoLocationOutline color="#64748b" />
                      <span style={styles.detailValue}>
                        {item.lost_location}
                      </span>
                    </div>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Date Lost</span>
                    <span style={styles.detailValue}>
                      {formatDate(item.date_lost)}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Description</span>
                    <p style={styles.description}>
                      {item.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reporter card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <IoPersonOutline size={24} color="#1A1851" />
                  <h3 style={styles.cardTitle}>Reported By</h3>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.claimantInfo}>
                    <div style={styles.avatar}>
                      {item.reported_by?.name
                        ? item.reported_by.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <div style={styles.claimantName}>
                        {item.reported_by?.name || "Unknown"}
                      </div>
                      <div style={styles.claimantEmail}>
                        {item.reported_by?.email || "No email"}
                      </div>
                    </div>
                  </div>

                  {item.contact_info && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Contact Info</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <IoCallOutline color="#64748b" />
                        <span style={styles.detailValue}>
                          {item.contact_info}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Image + Timeline + Actions */}
            <div style={styles.proofColumn}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <IoImageOutline size={24} color="#1A1851" />
                  <h3 style={styles.cardTitle}>Reference Image</h3>
                </div>
                <div style={styles.cardBody}>
                  {item.image_url ? (
                    <div style={styles.imageContainer}>
                      <img
                        src={item.image_url}
                        alt="Lost item"
                        style={styles.proofImage}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div style="padding:20px;color:#999;text-align:center">Image failed to load</div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 30,
                        textAlign: "center",
                        color: "#64748b",
                        background: "#f8fafc",
                        borderRadius: 10,
                      }}
                    >
                      <IoImageOutline size={40} style={{ opacity: 0.5 }} />
                      <p>No reference image provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <IoCalendarOutline size={24} color="#1A1851" />
                  <h3 style={styles.cardTitle}>Report Timeline</h3>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.timeline}>
                    <div style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>Report Submitted</div>
                        <div style={styles.timelineDate}>
                          {formatDate(item.createdAt || item.date_lost)}
                        </div>
                      </div>
                    </div>

                    <div style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineTitle}>Under Review</div>
                        <div style={styles.timelineDate}>
                          Currently being reviewed by staff
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <IoInformationCircleOutline size={24} color="#1A1851" />
                  <h3 style={styles.cardTitle}>Review Actions</h3>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.verificationGuidelines}>
                    <h4 style={styles.guidelinesTitle}>Checklist:</h4>
                    <ul style={styles.guidelinesList}>
                      <li>Verify description is clear</li>
                      <li>Ensure contact info is valid</li>
                      <li>Check if duplicate report exists</li>
                    </ul>
                  </div>

                  <div style={styles.actionButtons}>
                    <button
                      style={styles.approveButton}
                      onClick={approve}
                      disabled={processing}
                    >
                      {processing ? (
                        <div style={styles.loadingDots} />
                      ) : (
                        <>
                          <IoCheckmarkCircleOutline size={20} /> Approve Report
                        </>
                      )}
                    </button>

                    <button
                      style={styles.rejectButton}
                      onClick={reject}
                      disabled={processing}
                    >
                      <IoCloseCircleOutline size={20} /> Reject Report
                    </button>

                    <button
                      style={styles.needsInfoButton}
                      onClick={requestMoreInfo}
                    >
                      Request More Info
                    </button>
                  </div>

                  <div style={styles.actionNotes}>
                    <p>
                      <strong>Important:</strong> Once processed, this report
                      cannot be modified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* ============================================
   Styles – Polished & Fully Consistent
   (Aligned with StaffClaimReview UI System)
=============================================== */

const styles = {
  /* ========= CONTAINER ========= */
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: "100vh",
    overflowY: "auto",
    paddingLeft: "220px", // Match StaffNavBar width
  },
  mainContent: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    padding: "30px 40px",
    overflowY: "auto",
  },

  /* ========= LOADING / ERROR ========= */
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 60px)",
    color: "#64748b",
  },

  loadingSpinner: {
    width: 60,
    height: 60,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #1A1851",
    borderRadius: "50%",
    marginBottom: 20,
    animation: "spin 1s linear infinite",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 60px)",
    textAlign: "center",
    padding: 40,
  },

  /* ========= HEADER ========= */
  backNavButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    maxWidth: "200px",
  },
  headerBracket: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
    gap: "60%",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 30,
    gap: 20,
    flexWrap: "wrap",
  },

  headerInfo: {
    flex: 1,
    minWidth: 300,
  },

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: "#1A1851",
    margin: "0 0 8px 0",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    margin: 0,
  },

  claimStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },

  statusBadge: {
    padding: "8px 16px",
    backgroundColor: "#fef3c7",
    color: "#d97706",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    textTransform: "uppercase",
  },

  claimId: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "monospace",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    backgroundColor: "#1A1851",
    color: "#ffffff",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    marginTop: 20,
  },

  /* ========= GRID LAYOUT ========= */
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30,
    marginBottom: 40,
  },

  detailsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  proofColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  /* ========= CARD UI ========= */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },

  cardBody: {
    padding: 24,
  },

  /* ========= DETAIL ITEMS ========= */
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 20,
  },

  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  detailValue: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1e293b",
  },

  description: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },

  /* ========= CLAIMANT INFO ========= */
  claimantInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 20,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    flexShrink: 0,
  },

  claimantName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
  },

  claimantEmail: {
    fontSize: 14,
    color: "#64748b",
  },

  /* ========= IMAGES ========= */
  imageContainer: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },

  proofImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  /* ========= TIMELINE ========= */
  timeline: {
    position: "relative",
    paddingLeft: 20,
  },

  timelineItem: {
    position: "relative",
    marginBottom: 24,
    display: "flex",
    alignItems: "flex-start",
  },

  timelineDot: {
    position: "absolute",
    left: -28,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: "#1A1851",
    border: "3px solid #ffffff",
    boxShadow: "0 0 0 3px rgba(26, 24, 81, 0.1)",
  },

  timelineContent: {
    flex: 1,
  },

  timelineTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 4,
  },

  timelineDate: {
    fontSize: 14,
    color: "#64748b",
  },

  /* ========= VERIFICATION GUIDELINES ========= */
  verificationGuidelines: {
    backgroundColor: "#f0f9ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    border: "1px solid #e0f2fe",
  },

  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0369a1",
    margin: "0 0 12px 0",
  },

  guidelinesList: {
    margin: 0,
    paddingLeft: 20,
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.6,
  },

  /* ========= ACTION BUTTONS ========= */
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  approveButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    backgroundColor: "#10B981",
    color: "#ffffff",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    width: "100%",
  },

  rejectButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    backgroundColor: "#EF4444",
    color: "#ffffff",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    width: "100%",
  },

  needsInfoButton: {
    padding: 16,
    backgroundColor: "transparent",
    color: "#1A1851",
    border: "2px solid #1A1851",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },

  loadingDots: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  actionNotes: {
    padding: 16,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center",
    border: "1px solid #fbbf24",
  },
};

// Add animations/styles to document (same as ClaimReview)
const style = document.createElement("style");
style.textContent = `
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
@keyframes fadeOut { to { opacity: 0; transform: translateX(100px); } }
.approve-button:hover:not(:disabled){ background-color:#059669; transform:translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
.reject-button:hover:not(:disabled){ background-color:#DC2626; transform:translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,0.3); }
@media (max-width:1200px){ .content-grid{ grid-template-columns: 1fr; } }
@media (max-width:768px){ .header{ flex-direction: column; align-items: stretch; } .claim-status{ align-items: flex-start; } .card-header{ flex-direction: column; align-items: flex-start; gap: 12px; } }
`;
document.head.appendChild(style);

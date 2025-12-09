import React, { useEffect, useState } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoCubeOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoImageOutline
} from "react-icons/io5";

// Helper function outside component
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

export default function StaffClaimReview() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [proofImages, setProofImages] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClaimDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/staff/claims/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const found = res.data.claims.find((c) => c._id === claimId);
        
        if (found) {
          setClaim(found);
          // Extract images from proof description if present
          if (found.proof_description) {
            const images = extractImages(found.proof_description);
            setProofImages(images);
          }
        } else {
          setClaim(null);
        }
      } catch (err) {
        console.error("Error fetching claim:", err);
        showNotification("Failed to load claim details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchClaimDetails();
  }, [claimId, token]);

  const extractImages = (text) => {
    const regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi;
    const matches = text.match(regex);
    return matches ? matches.slice(0, 3) : [];
  };

  const approve = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/claims/verify",
        { itemId: claimId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("✓ Claim approved successfully!", "success");
      setTimeout(() => navigate("/StaffPendingClaim"), 1500);
    } catch (err) {
      console.error("Approval error:", err);
      showNotification("Failed to approve claim", "error");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (processing) return;
    const reason = prompt("Please provide a detailed reason for rejecting this claim:");
    if (!reason) return;

    setProcessing(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/claims/reject",
        { itemId: claimId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("✗ Claim rejected", "warning");
      setTimeout(() => navigate("/StaffPendingClaim"), 1500);
    } catch (err) {
      console.error("Rejection error:", err);
      showNotification("Failed to reject claim", "error");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <StaffNavBar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h3>Loading Claim Details...</h3>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div style={styles.container}>
        <StaffNavBar />
        <div style={styles.errorContainer}>
          <IoWarningOutline size={64} color="#EF4444" />
          <h2>Claim Not Found</h2>
          <p>The requested claim could not be found or may have been processed already.</p>
          <button 
            style={styles.backButton}
            onClick={() => navigate("/StaffPendingClaim")}
          >
            <IoArrowBackOutline size={18} />
            Back to Claims
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <button 
            style={styles.backNavButton}
            onClick={() => navigate("/StaffPendingClaim")}
          >
            <IoArrowBackOutline size={20} />
            Back to Claims
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>Claim Review</h1>
            <p style={styles.subtitle}>Review and verify this claim request</p>
          </div>
          <div style={styles.claimStatus}>
            <span style={styles.statusBadge}>Pending Review</span>
            <span style={styles.claimId}>ID: {claim._id.substring(0, 8)}...</span>
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* LEFT COLUMN - CLAIM DETAILS */}
          <div style={styles.detailsColumn}>
            {/* ITEM CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoCubeOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Item Information</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Item Name</span>
                  <span style={styles.detailValue}>{claim.name || "Unnamed Item"}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Category</span>
                  {/* 👇 FIXED: Handle both Object (populated) and String (unpopulated) */}
                  <span style={styles.detailValue}>
                    {claim.category?.name || claim.category || "General"}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Description</span>
                  <p style={styles.description}>{claim.description || "No description provided"}</p>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Original Status</span>
                  <span style={styles.detailValue}>{claim.status || "Unknown"}</span>
                </div>
              </div>
            </div>

            {/* CLAIMANT CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoPersonOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Claimant Details</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.claimantInfo}>
                  <div style={styles.avatar}>
                    {claim.claimed_by?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div style={styles.claimantName}>{claim.claimed_by?.name || "Unknown User"}</div>
                    <div style={styles.claimantEmail}>{claim.claimed_by?.email || "No email provided"}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Student ID</span>
                  <span style={styles.detailValue}>{claim.claimed_by?.studentId || "Not provided"}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Contact</span>
                  <span style={styles.detailValue}>{claim.claimed_by?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - IMAGES, PROOF & ACTIONS */}
          <div style={styles.proofColumn}>
            
            {/* NEW: ITEM IMAGE CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoImageOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Item Image</h3>
              </div>
              <div style={styles.cardBody}>
                {claim.image_url ? (
                  <div style={styles.imageContainer}>
                    <img 
                      src={claim.image_url} 
                      alt="Claimed Item" 
                      style={styles.proofImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="text-align:center; color:#999; padding: 20px;">Image failed to load</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div style={{padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "10px"}}>
                    <IoImageOutline size={40} style={{marginBottom: 10, opacity: 0.5}}/>
                    <p>No image provided for this item</p>
                  </div>
                )}
              </div>
            </div>

            {/* TIMELINE CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoCalendarOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Claim Timeline</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.timeline}>
                  <div style={styles.timelineItem}>
                    <div style={styles.timelineDot}></div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineTitle}>Claim Submitted</div>
                      <div style={styles.timelineDate}>
                        {formatDate(claim.claimed_at)}
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

            {/* PROOF CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoDocumentTextOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Proof of Ownership</h3>
              </div>
              <div style={styles.cardBody}>
                {/* Proof Images from text URLs */}
                {proofImages.length > 0 && (
                  <div style={styles.proofImages}>
                    {proofImages.map((img, index) => (
                      <div key={index} style={styles.imageContainer}>
                        <img 
                          src={img} 
                          alt={`Proof ${index + 1}`} 
                          style={styles.proofImage}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={styles.proofText}>
                  <p><strong>Claimant's Statement:</strong></p>
                  <p>{claim.proof_description || "No additional proof provided."}</p>
                </div>
                
                <div style={styles.proofValidation}>
                  <IoShieldCheckmarkOutline size={20} color="#10B981" />
                  <span>Verification recommended based on provided evidence</span>
                </div>
              </div>
            </div>

            {/* ACTIONS CARD */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoInformationCircleOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Review Actions</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.verificationGuidelines}>
                  <h4 style={styles.guidelinesTitle}>Verification Guidelines:</h4>
                  <ul style={styles.guidelinesList}>
                    <li>Verify claimant identity matches item ownership</li>
                    <li>Check proof authenticity and timeliness</li>
                    <li>Ensure no conflicting claims exist</li>
                  </ul>
                </div>

                <div style={styles.actionButtons}>
                  <button
                    style={styles.approveButton}
                    onClick={approve}
                    disabled={processing}
                  >
                    {processing && claim._id === processing ? (
                      <div style={styles.loadingDots}></div>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline size={20} />
                        Approve Claim
                      </>
                    )}
                  </button>
                  <button
                    style={styles.rejectButton}
                    onClick={reject}
                    disabled={processing}
                  >
                    <IoCloseCircleOutline size={20} />
                    Reject Claim
                  </button>
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

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 60px)",
    color: "#64748b",
  },

  loadingSpinner: {
    width: "60px",
    height: "60px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #1A1851",
    borderRadius: "50%",
    marginBottom: "20px",
    animation: "spin 1s linear infinite",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 60px)",
    textAlign: "center",
    padding: "40px",
  },

  /* ================================
     HEADER
  ================================== */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },

  headerInfo: {
    flex: 1,
    minWidth: "300px",
  },

  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1A1851",
    margin: "0 0 8px 0",
  },

  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },

  backNavButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  claimStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },

  statusBadge: {
    padding: "8px 16px",
    backgroundColor: "#fef3c7",
    color: "#d97706",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  claimId: {
    fontSize: "13px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 28px",
    backgroundColor: "#1A1851",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
  },

  /* ================================
     GRID CONTENT
  ================================== */
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginBottom: "40px",
  },

  detailsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  proofColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  /* ================================
     CARD
  ================================== */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },

  cardBody: {
    padding: "24px",
  },

  /* ================================
     DETAILS
  ================================== */
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },

  detailLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },

  description: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  /* ================================
     CLAIMANT INFO
  ================================== */
  claimantInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    flexShrink: 0,
  },

  claimantName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },

  claimantEmail: {
    fontSize: "14px",
    color: "#64748b",
  },

  /* ================================
     IMAGES
  ================================== */
  imageContainer: {
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },

  proofImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  proofImages: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  proofText: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
  },

  /* ================================
     TIMELINE
  ================================== */
  timeline: {
    position: "relative",
    paddingLeft: "20px",
  },

  timelineItem: {
    position: "relative",
    marginBottom: "24px",
    display: "flex",
    alignItems: "flex-start",
  },

  timelineDot: {
    position: "absolute",
    left: "-28px",
    top: "4px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#1A1851",
    border: "3px solid #ffffff",
    boxShadow: "0 0 0 3px rgba(26, 24, 81, 0.1)",
  },

  timelineContent: { flex: 1 },

  timelineTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },

  timelineDate: {
    fontSize: "14px",
    color: "#64748b",
  },

  /* ================================
     APPROVAL SECTION
  ================================== */
  proofValidation: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
  },

  verificationGuidelines: {
    backgroundColor: "#f0f9ff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #e0f2fe",
  },

  guidelinesTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0369a1",
    margin: "0 0 12px 0",
  },

  guidelinesList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  approveButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "18px",
    backgroundColor: "#10B981",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
  },

  rejectButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "18px",
    backgroundColor: "#EF4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
  },

  loadingDots: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  actionNotes: {
    padding: "16px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "10px",
    fontSize: "14px",
    textAlign: "center",
    border: "1px solid #fbbf24",
  },
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
  @keyframes fadeOut { to { opacity: 0; transform: translateX(100px); } }
  .back-nav-button:hover { background-color: #f8fafc; border-color: #1A1851; color: #1A1851; transform: translateX(-3px); }
  .image-container:hover .proof-image { transform: scale(1.05); }
  .image-container:hover { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }
  .approve-button:hover:not(:disabled) { background-color: #059669; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
  .reject-button:hover:not(:disabled) { background-color: #DC2626; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); }
  .approve-button:disabled, .reject-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .back-button:hover { background-color: #0F0E3E; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(26, 24, 81, 0.3); }
  @media (max-width: 1200px) { .content-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .header { flex-direction: column; align-items: stretch; } .claim-status { align-items: flex-start; } .card-header { flex-direction: column; align-items: flex-start; gap: 12px; } }
`;
document.head.appendChild(style);
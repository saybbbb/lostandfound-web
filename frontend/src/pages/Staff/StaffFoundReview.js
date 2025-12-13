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
  IoWarningOutline
} from "react-icons/io5";

export default function StaffFoundReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          "/api/auth/staff/pending",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Find the specific item from the list of pending items
        const foundItem = res.data.found.find((i) => i._id === id);
        
        if (foundItem) {
          setItem(foundItem);
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, token]);

  const approve = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await api.post(
        "/api/auth/staff/approve",
        { itemId: id, type: "found" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Found item approved successfully!");
      navigate("/StaffFoundApproval");
    } catch (err) {
      console.error("Approval error:", err);
      alert("Failed to approve item");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (processing) return;
    const reason = prompt("Please provide a reason for rejecting this item:");
    if (!reason) return;

    setProcessing(true);
    try {
      await api.post(
        "/api/auth/staff/reject",
        { itemId: id, type: "found", reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Item rejected.");
      navigate("/StaffFoundApproval");
    } catch (err) {
      console.error("Rejection error:", err);
      alert("Failed to reject item");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <StaffNavBar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <h3>Loading details...</h3>
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
          <p>The requested item could not be found or has already been processed.</p>
          <button 
            style={styles.backButton}
            onClick={() => navigate("/StaffFoundApproval")}
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
      <div style={styles.mainContent}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <button style={styles.backNavButton} onClick={() => navigate("/StaffFoundApproval")}>
            <IoArrowBackOutline size={20} /> Back to List
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>Found Item Review</h1>
            <p style={styles.subtitle}>Review found item report before publishing</p>
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* LEFT COLUMN */}
          <div style={styles.detailsColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoCubeOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Item Information</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Item Name</span>
                  <span style={styles.detailValue}>{item.name}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Category</span>
                  {/* FIX: Handle object or string category */}
                  <span style={styles.detailValue}>
                    {item.category?.name || item.category || "Uncategorized"}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Location Found</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
                    <IoLocationOutline color="#64748b"/>
                    <span style={styles.detailValue}>{item.found_location}</span>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Date Found</span>
                  <span style={styles.detailValue}>{formatDate(item.date_found)}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Description</span>
                  <p style={styles.description}>{item.description}</p>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoPersonOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Reported By</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.claimantInfo}>
                  <div style={styles.avatar}>
                    {item.posted_by?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div style={styles.claimantName}>{item.posted_by?.name || "Unknown"}</div>
                    <div style={styles.claimantEmail}>{item.posted_by?.email || "No email"}</div>
                  </div>
                </div>
                {item.contact_info && (
                    <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Contact Info Provided</span>
                    <span style={styles.detailValue}>{item.contact_info}</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={styles.proofColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoImageOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Item Image</h3>
              </div>
              <div style={styles.cardBody}>
                {item.image_url ? (
                  <div style={styles.imageContainer}>
                    <img src={item.image_url} alt="Found Item" style={styles.proofImage} />
                  </div>
                ) : (
                  <div style={{padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "10px"}}>
                    <IoImageOutline size={40} style={{marginBottom: 10, opacity: 0.5}}/>
                    <p>No image provided</p>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <IoInformationCircleOutline size={24} color="#1A1851" />
                <h3 style={styles.cardTitle}>Actions</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.actionButtons}>
                  <button style={styles.approveButton} onClick={approve} disabled={processing}>
                    {processing ? <div style={styles.loadingDots}/> : <><IoCheckmarkCircleOutline size={20} /> Approve Post</>}
                  </button>
                  <button style={styles.rejectButton} onClick={reject} disabled={processing}>
                    <IoCloseCircleOutline size={20} /> Reject Post
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
  container: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)" },
  mainContent: { flex: 1, padding: "30px 40px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" },
  backNavButton: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "transparent", color: "#64748b", border: "2px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  headerInfo: { flex: 1, marginLeft: "20px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#1A1851" },
  subtitle: { fontSize: "16px", color: "#64748b" },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" },
  detailsColumn: { display: "flex", flexDirection: "column", gap: "24px" },
  proofColumn: { display: "flex", flexDirection: "column", gap: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "24px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0 },
  cardBody: { padding: "24px" },
  detailItem: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
  detailLabel: { fontSize: "14px", color: "#64748b", fontWeight: "500", textTransform: "uppercase" },
  detailValue: { fontSize: "16px", fontWeight: "600", color: "#1e293b" },
  description: { fontSize: "15px", color: "#475569", lineHeight: "1.6", margin: 0, padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" },
  claimantInfo: { display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px" },
  avatar: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0 },
  claimantName: { fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  claimantEmail: { fontSize: "14px", color: "#64748b" },
  imageContainer: { width: "100%", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f1f5f9" },
  proofImage: { width: "100%", height: "auto", display: "block" },
  actionButtons: { display: "flex", flexDirection: "column", gap: "12px" },
  approveButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "18px", backgroundColor: "#10B981", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%" },
  rejectButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "18px", backgroundColor: "#EF4444", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", color: "#64748b" },
  loadingSpinner: { width: "60px", height: "60px", border: "4px solid #e2e8f0", borderTop: "4px solid #1A1851", borderRadius: "50%", marginBottom: "20px", animation: "spin 1s linear infinite" },
  loadingDots: { width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "currentColor", animation: "pulse 1.5s ease-in-out infinite" },
  errorContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", textAlign: "center", padding: "40px" },
  backButton: { display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", backgroundColor: "#1A1851", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "20px" },
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
  .back-nav-button:hover { background-color: #f8fafc; border-color: #1A1851; color: #1A1851; transform: translateX(-3px); }
  .approve-button:hover:not(:disabled) { background-color: #059669; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
  .reject-button:hover:not(:disabled) { background-color: #DC2626; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); }
  .back-button:hover { background-color: #0F0E3E; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(26, 24, 81, 0.3); }
  @media (max-width: 1200px) { .content-grid { grid-template-columns: 1fr; } }
`;
document.head.appendChild(style);
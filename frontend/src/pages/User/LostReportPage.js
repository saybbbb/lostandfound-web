// ============================= 1. IMPORTS =============================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { uploadToCloudinary } from "../../utils/uploadImage";
import api from "../../services/api";

// Icons
import { IoCloudUploadOutline, IoImageOutline } from "react-icons/io5";

// ============================= 2. COMPONENT =============================
function LostReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State
  const [lostItem, setLostItem] = useState(null);
  const [form, setForm] = useState({
    found_location: "",
    description: "",
    date_found: "",
    image_url: "",
    contact_info: "",
  });
  
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Single Lost Item
  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(
          `/api/auth/lost-items/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (!res.data || !res.data.item) {
          alert("Lost item not found.");
          navigate("/LostItemPage");
          return;
        }

        setLostItem(res.data.item);
      } catch (err) {
        console.log(err);
        alert("Error loading item.");
        navigate("/LostItemPage");
      }
    };

    loadItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
        const url = await uploadToCloudinary(file);
        if (url) {
            setForm((prev) => ({ ...prev, image_url: url }));
        } else {
            alert("Upload failed: No URL returned.");
        }
    } catch (error) {
        console.error("Upload Error:", error);
        alert("Image upload failed.");
    } finally {
        setIsUploading(false);
    }
  };

  // Submit Found Report
  const submitFoundReport = async () => {
    if (isUploading) return;
    if (isSubmitting) return;

    // Basic validation
    if (!form.found_location || !form.date_found || !form.description || !form.contact_info) {
        alert("Please fill in all required fields.");
        return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/api/auth/lost-items/report-found",
        {
          ...form,
          lost_item_id: id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!res.data.success) {
        alert(res.data.message || "Error submitting report.");
        setIsSubmitting(false);
        return;
      }

      navigate("/ReportSuccessPage?type=found");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error submitting found item report.");
      setIsSubmitting(false);
    }
  };

  if (!lostItem) return null;

  // ============================= 3. RENDER =============================
  return (
    <>
      <Header />
      <div style={styles.page}>
        
        {/* Header Section */}
        <div style={styles.headerBlock}>
            <h1 style={styles.title}>Found Item Report</h1>
            <p style={styles.subtitle}>You are reporting that you found: <strong>{lostItem.name}</strong></p>
        </div>

        <div style={styles.splitLayout}>
            
            {/* LEFT COLUMN: LOST ITEM INFO (Reference) */}
            <div style={styles.leftColumn}>
                
                {/* 1. Lost Item Image Display */}
                <div style={styles.displayBox}>
                    {lostItem.image_url ? (
                        <img src={lostItem.image_url} alt="Lost Item Reference" style={styles.imageDisplay} />
                    ) : (
                        <div style={styles.placeholder}>
                            <IoImageOutline size={48} color="#ccc" />
                            <span style={{color: "#999", marginTop: 10}}>No Image Provided by Owner</span>
                        </div>
                    )}
                    <div style={styles.labelTag}>Lost Item Reference</div>
                </div>

                {/* 2. Lost Item Description */}
                <div style={styles.infoGroup}>
                    <label style={styles.label}>Item Name: {lostItem.name}</label>
                    <div style={styles.descriptionBox}>
                        <p style={styles.descText}><strong>Location Lost:</strong> {lostItem.lost_location}</p>
                        <p style={styles.descText}><strong>Date Lost:</strong> {new Date(lostItem.date_lost).toLocaleDateString()}</p>
                        <hr style={{margin: "10px 0", border: "0", borderTop: "1px solid #ddd"}}/>
                        <p style={styles.descText}>{lostItem.description}</p>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: FINDER'S FORM */}
            <div style={styles.rightColumn}>
                
                {/* 1. Finder Image Upload */}
                <div style={styles.uploadContainer}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={styles.fileInputHidden}
                        id="found-proof-upload"
                    />
                    <label htmlFor="found-proof-upload" style={styles.uploadLabel}>
                        {preview ? (
                            <img src={preview} alt="Preview" style={styles.imagePreview} />
                        ) : (
                            <div style={styles.uploadPlaceholder}>
                                <IoCloudUploadOutline size={48} color="#1A1851" style={{ marginBottom: 10 }} />
                                <span style={{color: "#555"}}>Upload Image of Found Item (Optional)</span>
                            </div>
                        )}
                        {isUploading && (
                            <div style={styles.uploadingOverlay}>
                                <span>Uploading...</span>
                            </div>
                        )}
                    </label>
                    <div style={styles.labelTag}>Your Image</div>
                </div>

                {/* 2. Finder Inputs */}
                <div style={styles.infoGroup}>
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Found Location*</label>
                            <input 
                                name="found_location" 
                                value={form.found_location}
                                onChange={handleChange}
                                style={styles.input}
                                required 
                            />
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label}>Date Found*</label>
                            <input
                                type="date"
                                name="date_found"
                                value={form.date_found}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <label style={styles.label}>Description*</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        style={styles.textarea}
                        placeholder="Describe where specifically you found it or its current condition..."
                        required
                    />

                    <label style={styles.label}>Contact Info*</label>
                    <input 
                        name="contact_info" 
                        value={form.contact_info}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Email or Phone Number"
                        required 
                    />
                </div>

                {/* 3. Action Buttons */}
                <div style={styles.buttonRow}>
                    <button 
                        onClick={() => navigate("/LostItemPage")} 
                        style={styles.cancelBtn}
                    >
                        Cancel
                    </button>

                    <button 
                        onClick={submitFoundReport} 
                        style={(isUploading || isSubmitting) ? styles.disabledBtn : styles.submitBtn}
                        disabled={isUploading || isSubmitting}
                    >
                        {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Found Report"}
                    </button>
                </div>

            </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ============================= 4. STYLES =============================
const styles = {
  page: { 
    padding: "40px 100px", 
    maxWidth: "1400px", 
    margin: "0 auto",
    minHeight: "80vh"
  },
  headerBlock: {
      marginBottom: "30px",
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#1A1851",
    marginBottom: "5px"
  },
  subtitle: { 
    fontSize: 16,
    color: "#666", 
  },
  
  // SPLIT LAYOUT
  splitLayout: {
    display: "flex",
    gap: "50px", 
    alignItems: "flex-start",
  },
  leftColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // BOX STYLES
  displayBox: {
      width: "100%",
      height: "400px", 
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      backgroundColor: "#fff",
      display: "flex",
      position: "relative",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
  },
  imageDisplay: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      backgroundColor: "#f8f9fa",
  },
  placeholder: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
  },

  // UPLOAD STYLES
  uploadContainer: {
      width: "100%", 
      height: "300px", // Slightly smaller than Claim page since we have more inputs
      border: "2px dashed #ccc",
      borderRadius: "10px",
      backgroundColor: "#f8f8f8",
      display: "flex",
      position: "relative",
      overflow: "hidden",
  },
  fileInputHidden: { display: "none" },
  uploadLabel: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
  },
  uploadPlaceholder: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
  },
  imagePreview: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      backgroundColor: "#e5e7eb",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#1A1851",
  },

  // LABELS & TEXT
  labelTag: {
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: "rgba(26, 24, 81, 0.8)",
      color: "white",
      padding: "4px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
      pointerEvents: "none",
  },
  infoGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
  },
  label: { 
      fontWeight: "700", 
      color: "#1A1851", 
      fontSize: 16,
      marginBottom: "5px"
  },
  descriptionBox: {
      padding: "15px",
      backgroundColor: "#f1f5f9",
      borderRadius: "8px",
      minHeight: "120px",
      border: "1px solid #e2e8f0",
  },
  descText: {
      margin: 0,
      color: "#475569",
      lineHeight: "1.6",
      marginBottom: "5px",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  textarea: { 
    padding: "15px", 
    minHeight: "100px", 
    borderRadius: "8px", 
    border: "1px solid #ccc", 
    background: "#fff", 
    fontSize: 15,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  row: {
      display: "flex",
      gap: "15px",
  },
  col: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
  },

  // BUTTONS
  buttonRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px",
      marginTop: "10px",
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "#f2f2f2",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: { 
    backgroundColor: "#1A1851", 
    padding: "12px 32px", 
    color: "white", 
    fontWeight: "bold", 
    borderRadius: 6, 
    cursor: "pointer", 
    border: "none", 
    fontSize: 16,
    transition: "background-color 0.3s"
  },
  disabledBtn: {
    backgroundColor: "#cccccc", 
    padding: "12px 32px", 
    color: "white", 
    fontWeight: "bold", 
    borderRadius: 6, 
    cursor: "not-allowed", 
    border: "none", 
    fontSize: 16,
  },
};

export default LostReportPage;
// ============================= 1. IMPORTS =============================
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Components
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";

// Utils
import { uploadToCloudinary } from "../../utils/uploadImage";

// Icons
import { IoCloudUploadOutline, IoImageOutline } from "react-icons/io5";

// ============================= 2. COMPONENT =============================
function ClaimFoundItemPage() {
  const { foundId } = useParams();
  const navigate = useNavigate();

  // State
  const [foundItem, setFoundItem] = useState(null);
  const [proof, setProof] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  // 🔴 NEW: image validation error
  const [imageError, setImageError] = useState("");

  // Effect: Load Found Item details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/found-items/${foundId}`)
      .then((res) => setFoundItem(res.data.item))
      .catch((err) => console.log(err));
  }, [foundId]);

  // Handler: Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      console.log("Starting image upload...");
      const url = await uploadToCloudinary(file);
      console.log("Upload successful:", url);

      if (url) {
        setProofImage(url);
        setImageError(""); // ✅ clear error on success
      } else {
        alert("Upload failed: No URL returned.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Image upload failed. Please check your internet connection.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handler: Submit Claim
  const submitClaim = async () => {
    if (isUploading) return;
    if (isSubmitting) return;

    // 🔴 BLOCK SUBMIT IF IMAGE NOT ATTACHED
    if (!proofImage) {
      setImageError(
        "Please upload a proof image before submitting your claim."
      );
      return;
    }

    if (!proof.trim()) {
      alert("Please provide a description of proof.");
      return;
    }

    setIsSubmitting(true);
    setImageError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/claims",
        {
          found_item: foundId,
          proof_description: proof,
          claim_proof_image: proofImage,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.data.success) {
        alert(res.data.message);
        setIsSubmitting(false);
        return;
      }

      navigate("/ReportSuccessPage?type=claim");
    } catch (err) {
      console.error("Submit Claim Error:", err);
      alert(err.response?.data?.message || "Error submitting claim.");
      setIsSubmitting(false);
    }
  };

  if (!foundItem) return null;

  // ============================= 3. RENDER =============================
  return (
    <>
      <Header />
      <div style={styles.page}>
        {/* Header Section */}
        <div style={styles.headerBlock}>
          <h1 style={styles.title}>Claim Found Item</h1>
          <p style={styles.subtitle}>Provide proof to verify ownership.</p>
        </div>

        <div style={styles.splitLayout}>
          {/* LEFT COLUMN: FOUNDER'S INFO */}
          <div style={styles.leftColumn}>
            {/* 1. Founder Image (Static Display) */}
            <div style={styles.displayBox}>
              {foundItem.image_url ? (
                <img
                  src={foundItem.image_url}
                  alt="Found Item"
                  style={styles.imageDisplay}
                />
              ) : (
                <div style={styles.placeholder}>
                  <IoImageOutline size={48} color="#ccc" />
                  <span style={{ color: "#999", marginTop: 10 }}>
                    No Image Provided by Finder
                  </span>
                </div>
              )}
              <div style={styles.labelTag}>Founder's Image</div>
            </div>

            {/* 2. Founder Description */}
            <div style={styles.infoGroup}>
              <label style={styles.label}>Found Item: {foundItem.name}</label>
              <div style={styles.descriptionBox}>
                <p style={styles.descText}>{foundItem.description}</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CLAIMANT'S FORM */}
          <div style={styles.rightColumn}>
            {/* 1. Claimant Image Upload (Big Box) */}
            <div style={styles.uploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={styles.fileInputHidden}
                id="claim-proof-upload"
              />
              <label htmlFor="claim-proof-upload" style={styles.uploadLabel}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={styles.imagePreview}
                  />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <IoCloudUploadOutline
                      size={48}
                      color="#1A1851"
                      style={{ marginBottom: 10 }}
                    />
                    <span style={{ color: "#555" }}>Upload Proof Image</span>
                  </div>
                )}
                {isUploading && (
                  <div style={styles.uploadingOverlay}>
                    <span>Uploading...</span>
                  </div>
                )}
              </label>
              <div style={styles.labelTag}>Your Proof Image</div>
            </div>

            {/* 🔴 IMAGE REQUIRED ERROR */}
            {imageError && (
              <span style={{ color: "red", fontSize: 13 }}>{imageError}</span>
            )}

            {/* 2. Claimant Proof Description */}
            <div style={styles.infoGroup}>
              <label style={styles.label}>Proof Description*</label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                style={styles.textarea}
                placeholder="Describe unique markings, contents, wallpapers, or specific details..."
                required
              />
            </div>

            {/* 3. Action Buttons */}
            <div style={styles.buttonRow}>
              <button
                onClick={() => navigate("/Dashboard")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                onClick={submitClaim}
                style={
                  isUploading || isSubmitting
                    ? styles.disabledBtn
                    : styles.submitBtn
                }
                disabled={isUploading || isSubmitting}
              >
                {isUploading
                  ? "Uploading..."
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit Claim"}
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
    minHeight: "80vh",
  },
  headerBlock: {
    marginBottom: "30px",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1851",
    marginBottom: "5px",
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
    height: "400px", // Static Height
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
    height: "400px", // Static Height matching left side
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    gap: "10px",
  },
  label: {
    fontWeight: "700",
    color: "#1A1851",
    fontSize: 16,
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
  },
  textarea: {
    padding: "15px",
    minHeight: "120px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
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
    transition: "background-color 0.3s",
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

export default ClaimFoundItemPage;

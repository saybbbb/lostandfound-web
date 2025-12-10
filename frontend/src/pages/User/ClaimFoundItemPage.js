import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../utils/uploadImage";

function ClaimFoundItemPage() {
  const { foundId } = useParams();
  const navigate = useNavigate();

  const [foundItem, setFoundItem] = useState(null);
  const [proof, setProof] = useState("");
  const [proofImage, setProofImage] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/found-items/${foundId}`)
      .then((res) => setFoundItem(res.data.item))
      .catch((err) => console.log(err));
  }, [foundId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true); // Disable button
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setProofImage(url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false); // Re-enable button (Make it Blue again)
    }
  };

  const submitClaim = async () => {
    if (isUploading) return;

    if (!proof.trim()) {
      alert("Please provide a description of proof.");
      return;
    }

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
        return;
      }

      navigate("/ReportSuccessPage?type=claim");
    } catch (err) {
      console.error(err);
      alert("Error submitting claim.");
    }
  };

  if (!foundItem) return null;

  return (
    <>
      <Header />
      <div style={styles.page}>
        <h1 style={styles.title}>Claim Found Item</h1>
        <p style={styles.subtitle}>Provide proof to verify ownership.</p>

        <div style={styles.card}>
          <h2 style={styles.itemTitle}>Found Item: {foundItem.name}</h2>
          <p style={styles.itemDesc}>{foundItem.description}</p>
          {foundItem.image_url && (
            <img src={foundItem.image_url} alt="Item" style={styles.itemImage} />
          )}
        </div>

        <div style={styles.form}>
          <label style={styles.label}>Proof of Ownership (Description)*</label>
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            style={styles.textarea}
            placeholder="Describe unique markings, contents, wallpapers, or specific details..."
            required
          />

          <label style={styles.label}>Upload Proof Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.input}
          />
          
          {proofImage && (
            <div style={styles.previewContainer}>
              <p style={styles.previewLabel}>Proof Preview:</p>
              <img src={proofImage} alt="Proof" style={styles.previewImage} />
            </div>
          )}

          {/* FIXED BUTTON LOGIC */}
          <button 
            onClick={submitClaim} 
            style={isUploading ? styles.disabledBtn : styles.submitBtn}
            disabled={isUploading}
          >
            {isUploading ? "Uploading Image..." : "Submit Claim"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: { padding: "40px 120px", minHeight: "70vh" },
  title: { fontSize: 32, fontWeight: "bold", color: "#1A1851" },
  subtitle: { color: "#666", marginBottom: 30 },
  
  card: { 
    background: "#f8f9fa", 
    padding: 25, 
    borderRadius: 12, 
    marginBottom: 30, 
    border: "1px solid #e2e8f0" 
  },
  itemTitle: { fontSize: 20, marginBottom: 10, color: "#1A1851" },
  itemDesc: { fontSize: 16, color: "#4b5563", marginBottom: 15 },
  itemImage: { maxWidth: "200px", borderRadius: 8, marginTop: 10, border: "1px solid #ddd" },

  form: { maxWidth: 600, display: "flex", flexDirection: "column", gap: 15 },
  label: { fontWeight: "600", color: "#333", fontSize: 15 },
  textarea: { 
    padding: 12, 
    minHeight: 120, 
    borderRadius: 8, 
    border: "1px solid #ccc", 
    background: "#fff", 
    fontSize: 15,
    fontFamily: "inherit"
  },
  input: { 
    padding: 10, 
    background: "#fff", 
    borderRadius: 8, 
    border: "1px solid #ccc" 
  },
  
  // SEPARATE STYLES TO PREVENT OVERWRITE ISSUES
  submitBtn: { 
    backgroundColor: "#1A1851", // Dark Blue
    padding: "14px", 
    color: "white", 
    fontWeight: "bold", 
    borderRadius: 8, 
    cursor: "pointer", 
    border: "none", 
    fontSize: 16,
    marginTop: 10,
    transition: "background-color 0.3s"
  },
  
  disabledBtn: {
    backgroundColor: "#cccccc", // Grey
    padding: "14px", 
    color: "white", 
    fontWeight: "bold", 
    borderRadius: 8, 
    cursor: "not-allowed", 
    border: "none", 
    fontSize: 16,
    marginTop: 10
  },

  previewContainer: { marginTop: 5, padding: 10, border: "1px dashed #ccc", borderRadius: 8 },
  previewLabel: { fontSize: 13, color: '#666', marginBottom: 5 },
  previewImage: { width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: 4 }
};

export default ClaimFoundItemPage;
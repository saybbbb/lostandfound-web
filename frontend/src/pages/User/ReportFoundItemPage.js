import React, { useState, useEffect } from "react";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../utils/uploadImage";
import api from "../../services/api";
import { IoCloudUploadOutline } from "react-icons/io5"; 

function ReportFoundItemPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    found_location: "",
    description: "",
    date_found: "",
    image_url: "",
    contact_info: "",
    posted_by: localStorage.getItem("userId"),
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null); 

  useEffect(() => {
    api
      .get("/api/auth/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.log("Error loading categories:", err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitFoundItem = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 

    setIsSubmitting(true); 

    try {
      const res = await api.post(
        "/api/auth/found-items",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        navigate("/ReportSuccessPage?type=found");
      }
    } catch (err) {
      console.log("Submit Found Item ERROR:", err.response?.data || err.message);
      alert("Error submitting found item");
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <Header />

      <div style={styles.page}>
        <div style={styles.headerBlock}>
            <h1 style={styles.title}>Found an Item</h1>
            <p style={styles.subtitle}>
            Please provide as much detail as possible to help with identification.
            </p>
        </div>

        {/* Toggle */}
        <div style={styles.toggleContainer}>
          <button
            style={styles.inactiveToggle}
            onClick={() => navigate("/ReportLostItemPage")}
          >
            I Lost an Item
          </button>

          <button style={styles.activeToggle}>I Found an Item</button>
        </div>

        {/* FORM - SPLIT LAYOUT */}
        <form onSubmit={submitFoundItem} style={styles.splitLayout}>
          
          {/* LEFT COLUMN: TEXT INPUTS */}
          <div style={styles.leftColumn}>
            <label style={styles.label}>Item Name*</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <label style={styles.label}>Category*</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Location*</label>
                <input
                  name="found_location"
                  value={form.found_location}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Date*</label>
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
              required
            />

            <label style={styles.label}>Contact Information*</label>
            <input
              name="contact_info"
              value={form.contact_info}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* RIGHT COLUMN: IMAGE UPLOAD & BUTTONS */}
          <div style={styles.rightColumn}>
            
            {/* BIG STATIC UPLOAD BOX */}
            <div style={styles.uploadContainer}>
                <input
                    type="file"
                    accept="image/*"
                    id="file-upload"
                    style={{ display: "none" }} 
                    onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setPreview(URL.createObjectURL(file));
                    setIsUploading(true);
                    try {
                        const url = await uploadToCloudinary(file);
                        if (url) {
                        setForm({ ...form, image_url: url });
                        }
                    } catch (error) {
                        console.error("Upload failed:", error);
                        alert("Image upload failed. Please try again.");
                    } finally {
                        setIsUploading(false);
                    }
                    }}
                />
                
                <label htmlFor="file-upload" style={styles.uploadLabel}>
                    {preview ? (
                        <img src={preview} alt="Preview" style={styles.imagePreview} />
                    ) : (
                        <div style={styles.uploadPlaceholder}>
                            <IoCloudUploadOutline size={48} color="#1A1851" style={{ marginBottom: 10 }} />
                            <span style={{color: "#555"}}>Click to Upload Image</span>
                        </div>
                    )}
                    {isUploading && (
                        <div style={styles.uploadingOverlay}>
                            <span>Uploading...</span>
                        </div>
                    )}
                </label>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={() => navigate("/Dashboard")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={
                  isUploading || isSubmitting
                    ? { ...styles.submitBtn, backgroundColor: "#ccc", cursor: "not-allowed" }
                    : styles.submitBtn
                }
                disabled={isUploading || isSubmitting}
              >
                {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>

        </form>
      </div>

      <Footer />
    </>
  );
}

// ============================= STYLES =============================

const styles = {
  page: {
    padding: "40px 100px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  headerBlock: {
      marginBottom: "20px",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1A1851",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 25,
  },

  // Toggle Buttons
  toggleContainer: {
    display: "flex",
    gap: "0", 
    marginBottom: "40px",
  },
  activeToggle: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: "10px",
  },
  inactiveToggle: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#F5F6FA",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: "10px",
    cursor: "pointer",
  },

  // LAYOUT STYLES
  splitLayout: {
    display: "flex",
    gap: "50px", 
    alignItems: "flex-start", // Changed to flex-start so Text doesn't stretch to match image height
  },
  leftColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  label: {
    marginTop: "15px", 
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    marginBottom: "5px",
  },

  input: {
    padding: "12px",
    fontSize: 16,
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    width: "100%", 
    boxSizing: "border-box",
  },

  textarea: {
    padding: "12px",
    fontSize: 16,
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "120px",
    backgroundColor: "#f8f8f8",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  row: {
    display: "flex",
    gap: "20px",
  },

  col: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  // STATIC UPLOAD BOX STYLES
  uploadContainer: {
      width: "100%", 
      height: "500px", // FIXED STATIC HEIGHT
      border: "2px dashed #ccc",
      borderRadius: "10px",
      backgroundColor: "#f8f8f8",
      display: "flex",
      position: "relative",
      overflow: "hidden",
  },
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
      objectFit: "contain", // AUTO ADJUST: Fits whole image inside the static box
      backgroundColor: "#e5e7eb", // Light background to show padding if aspect ratio differs
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

  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "auto", 
  },
  cancelBtn: {
    padding: "12px 22px",
    backgroundColor: "#f2f2f2",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: 16,
    cursor: "pointer",
  },
  submitBtn: {
    padding: "12px 22px",
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ReportFoundItemPage;
// ============================= 1. IMPORTS =============================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { uploadToCloudinary } from "../../utils/uploadImage";
import api from "../../services/api";
import usePageMetadata from "../../hooks/usePageMetadata";

// ============================= 2. COMPONENT =============================
function LostReportPage() {
  usePageMetadata("Lost Report", "/images/LAFLogo.png");

  const navigate = useNavigate();
  const { id } = useParams();

  const [lostItem, setLostItem] = useState(null);
  const [form, setForm] = useState({
    found_location: "",
    description: "",
    date_found: "",
    image_url: "",
    contact_info: "",
  });

  // LOAD SINGLE LOST ITEM SAFELY
  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await api.get(`/api/auth/lost-items/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

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

  // SUBMIT FOUND REPORT
  const submitFoundReport = async (e) => {
    e.preventDefault();

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
        return;
      }

      navigate("/ReportSuccessPage?type=found");
    } catch (err) {
      console.log(err);
      alert("Error submitting found item report.");
    }
  };

  if (!lostItem) return null;

  // ============================= 3. RENDER =============================
  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Found Item Report</h1>

        <p>
          You are reporting that you found: <strong>{lostItem.name}</strong>
        </p>

        <form onSubmit={submitFoundReport} style={styles.form}>
          <label>Found Location*</label>
          <input name="found_location" required onChange={handleChange} />

          <label>Date Found*</label>
          <input
            type="date"
            name="date_found"
            required
            onChange={handleChange}
          />

          <label>Description*</label>
          <textarea
            name="description"
            required
            onChange={handleChange}
          ></textarea>

          <label>Contact Info*</label>
          <input name="contact_info" required onChange={handleChange} />

          {/* CLOUDINARY UPLOAD */}
          <label>Upload Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const url = await uploadToCloudinary(file);
              if (url) {
                setForm({ ...form, image_url: url });
              }
            }}
          />

          <button type="submit" style={styles.submitBtn}>
            Submit Found Item Report
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}

// ============================= 4. STYLES =============================
const styles = {
  container: {
    padding: "40px 120px",
  },
  title: {
    fontSize: 32,
    color: "#1A1851",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "700px",
  },
  submitBtn: {
    marginTop: 15,
    padding: "12px",
    backgroundColor: "#1A1851",
    color: "white",
    fontWeight: "bold",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
};

export default LostReportPage;

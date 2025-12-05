import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useNavigate } from "react-router-dom";

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

  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/categories")
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

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/found-items",
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
  }
};


  return (
    <>
      <Header />

      <div style={styles.page}>
        <h1 style={styles.title}>Found an Item</h1>
        <p style={styles.subtitle}>
          Please provide as much detail as possible to help with identification.
        </p>

        {/* Toggle Buttons */}
        <div style={styles.toggleContainer}>
          <button
            style={styles.inactiveToggle}
            onClick={() => navigate("/ReportLostItemPage")}
          >
            I Lost an Item
          </button>

          <button style={styles.activeToggle}>I Found an Item</button>
        </div>

        {/* FORM */}
        <form onSubmit={submitFoundItem} style={styles.form}>
          {/* ITEM NAME */}
          <label style={styles.label}>Item Name*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* CATEGORY */}
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

          {/* LOCATION + DATE */}
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

          {/* DESCRIPTION */}
          <label style={styles.label}>Description*</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={styles.textarea}
            required
          />

          {/* CONTACT INFO */}
          <label style={styles.label}>Contact Information*</label>
          <input
            name="contact_info"
            placeholder="Your email or phone number"
            value={form.contact_info}
            onChange={handleChange}
            style={styles.input}
            required
          />

          {/* BUTTON ROW */}
          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() => navigate("/Dashboard")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>

            <button type="submit" style={styles.submitBtn}>
              Submit Report
            </button>
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
    padding: "40px 120px",
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
    gap: "20px",
    marginBottom: "30px",
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
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "700px",
  },

  label: {
    marginTop: "10px",
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },

  input: {
    padding: "12px",
    fontSize: 16,
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
  },

  textarea: {
    padding: "12px",
    fontSize: 16,
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "120px",
    backgroundColor: "#f8f8f8",
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

  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "12px 22px",
    backgroundColor: "#f2f2f2",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: 16,
  },
  submitBtn: {
    padding: "12px 22px",
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: 16,
    fontWeight: "bold",
  },
};

export default ReportFoundItemPage;

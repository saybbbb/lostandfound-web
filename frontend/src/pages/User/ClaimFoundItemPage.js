import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useParams, useNavigate } from "react-router-dom";

function ClaimFoundItemPage() {
  const { foundId } = useParams();
  const navigate = useNavigate();

  const [foundItem, setFoundItem] = useState(null);
  const [proof, setProof] = useState("");

  // Load FOUND item only
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/found-items/${foundId}`)
      .then((res) => setFoundItem(res.data.item))
      .catch((err) => console.log(err));
  }, [foundId]);

  const submitClaim = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/claims",
        {
          found_item: foundId,
          proof_description: proof,
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
          <h2>Found Item</h2>
          <p><b>{foundItem.name}</b></p>
          <p>{foundItem.description}</p>
        </div>

        <div style={styles.form}>
          <label>Proof of Ownership*</label>
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={submitClaim} style={styles.submitBtn}>
            Submit Claim
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: { padding: "40px 120px" },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { color: "#666", marginBottom: 30 },

  card: {
    background: "#f2f2f2",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },

  form: { maxWidth: 600, display: "flex", flexDirection: "column", gap: 15 },

  textarea: {
    padding: 12,
    minHeight: 100,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f8f8f8",
  },

  submitBtn: {
    backgroundColor: "#1A1851",
    padding: 12,
    color: "white",
    fontWeight: "bold",
    borderRadius: 6,
    cursor: "pointer",
    border: "none",
  },
};

export default ClaimFoundItemPage;

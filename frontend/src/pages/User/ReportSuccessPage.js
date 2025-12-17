// ============================= 1. IMPORTS =============================
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import usePageMetadata from "../../hooks/usePageMetadata";

// ============================= 2. COMPONENT =============================
function ReportSuccessPage() {
  usePageMetadata("Report Success", "/images/LAFLogo.png");

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");

  const title =
    type === "claim"
      ? "Claim Submitted Successfully"
      : type === "found"
      ? "Found Item Submitted Successfully"
      : "Lost Item Submitted Successfully";

  const subtitle =
    type === "claim"
      ? "A staff member will review your claim shortly."
      : type === "found"
      ? "Thank you for reporting a found item!"
      : "Thank you for reporting a lost item!";

  // ============================= 3. RENDER =============================
  return (
    <div style={styles.wrapper}>
      <Header />

      <div style={styles.container}>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>

        <button style={styles.button} onClick={() => navigate("/Dashboard")}>
          Go Back
        </button>
      </div>

      <Footer />
    </div>
  );
}

// ============================= 4. STYLES =============================
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  container: {
    textAlign: "center",
    marginTop: "120px",
    flex: 1,
  },
  title: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "20px",
    color: "#777",
    marginBottom: "30px",
  },
  button: {
    backgroundColor: "#1A1851",
    padding: "12px 28px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
  },
};

export default ReportSuccessPage;

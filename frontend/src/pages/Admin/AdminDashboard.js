import React, { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";
import Footer from "../../components/NavigationBars/Footer";
import usePageMetadata from "../../hooks/usePageMetadata";

function AdminDashboard() {
  usePageMetadata("Admin Dashboard", "/images/LAFLogo.png");

  const [adminName, setAdminName] = useState("");
  const [counts, setCounts] = useState({
    lost: 0,
    found: 0,
    claimed: 0,
    pendingToday: 0,
    verifiedToday: 0,
    totalUsers: 0,
    totalStaff: 0,
    totalAdmin: 0,
    totalUnverified: 0,
  });

  const [time, setTime] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const adminNameFromStorage = localStorage.getItem("adminName");
    if (adminNameFromStorage) {
      setAdminName(adminNameFromStorage);
    }

    fetchDashboardData();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/auth/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      setCounts({
        lost: data.lost,
        found: data.found,
        claimed: data.claimed,
        pendingToday: data.pendingToday,
        verifiedToday: data.verifiedToday,
        totalUsers: data.totalStudents,
        totalStaff: data.totalStaff,
        totalAdmin: data.totalAdmin,
        totalUnverified: data.totalUnverified,
      });

      setError(null);
    } catch (err) {
      setError("Failed to load dashboard.");
    }
  };

  // formatted date
  const formattedDate = time.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.main}>
        <div style={styles.mainContent}>
          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.greeting}>Good day, {adminName || "Admin"}!</h1>
              <p style={styles.subtext}>System Overview & Analytics</p>
            </div>

            <div style={styles.timeBox}>
              <div style={styles.timeIcon}>☀️</div>
              <div style={styles.timeText}>
                <strong>{formattedTime}</strong>
                <br />
                <span style={{ fontSize: 13 }}>TODAY:</span> <br />
                <strong>{formattedDate.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* TOP STAT CARDS */}
          <div style={styles.cardRow}>
            <div style={styles.card}>
              Total Lost Items
              <br />
              <b>{counts.lost}</b>
            </div>
            <div style={styles.card}>
              Total Found Items
              <br />
              <b>{counts.found}</b>
            </div>
            <div style={styles.card}>
              Pending Claims
              <br />
              <b>{counts.pendingToday}</b>
            </div>
            <div style={styles.card}>
              Active Users Today
              <br />
              <b>{counts.verifiedToday}</b>
            </div>
          </div>

          {/* USERS */}
          <div style={styles.cardRow}>
            <div style={styles.bigCard}>
              TOTAL STUDENTS
              <br />
              <span style={styles.bigNum}>{counts.totalUsers}</span>
            </div>
            <div style={styles.bigCard}>
              TOTAL STAFF
              <br />
              <span style={styles.bigNum}>{counts.totalStaff}</span>
            </div>
            <div style={styles.bigCard}>
              TOTAL ADMIN
              <br />
              <span style={styles.bigNum}>{counts.totalAdmin}</span>
            </div>
            <div style={styles.bigCard}>
              TOTAL UNVERIFIED
              <br />
              <span style={styles.bigNum}>{counts.totalUnverified}</span>
            </div>
          </div>

          {/* CIRCLES SECTION */}
          <div style={styles.circleSection}>
            {circle("Lost Item", counts.lost, "#F65164")}
            {circle("Found Item", counts.found, "#F8C22E")}
            {circle("Claimed Item", counts.claimed, "#6A5ACD")}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* CIRCLE COMPONENT */
const circle = (label, value, color) => (
  <div style={styles.circleBox}>
    <div style={{ ...styles.circle, borderColor: color }}>
      <span style={styles.circleNum}>{value}</span>
    </div>
    <p style={styles.circleLabel}>{label}</p>
  </div>
);

/* ========== STYLES ========== */
const styles = {
  container: {
    display: "flex",
    backgroundColor: "#F5F5F5",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  main: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: "100vh",
    overflowY: "auto",
    paddingLeft: "230px", // Match StaffNavBar width
  },
  mainContent: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    padding: "30px 40px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  greeting: {
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    color: "#1A1851",
  },

  subtext: { marginTop: -5, color: "#555" },

  timeBox: {
    background: "white",
    padding: "15px 20px",
    borderRadius: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  timeIcon: { fontSize: 32 },
  timeText: { fontSize: 15 },

  errorBox: {
    background: "#ffe5e5",
    padding: 10,
    borderRadius: 6,
    color: "#900",
    marginBottom: 10,
  },

  cardRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },

  card: {
    flex: "1 1 200px",
    background: "white",
    padding: 20,
    textAlign: "center",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: 15,
  },

  bigCard: {
    flex: "1 1 250px",
    background: "#fff",
    padding: 25,
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: 17,
  },

  bigNum: {
    fontSize: 42,
    fontWeight: 900,
    display: "block",
    marginTop: 10,
  },

  circleSection: {
    background: "#efefef",
    padding: 25,
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 30,
  },

  circleBox: { textAlign: "center" },

  circle: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    border: "10px solid",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    margin: "0 auto",
  },

  circleNum: {
    fontSize: 32,
    fontWeight: 700,
    color: "#333",
  },

  circleLabel: {
    marginTop: 8,
    fontWeight: 600,
    color: "#444",
  },
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";
import Footer from "../../components/NavigationBars/Footer";

function AdminDashboard() {
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
  });

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (admin?.name) setAdminName(admin.name);

    // If a token exists, set it as the default Authorization header for axios
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    updateTime();
    fetchDashboardData();
  }, []);

  const updateTime = () => {
    const now = new Date();

    setTime(
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    setDate(
      now.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/auth/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      });

      setError(null);
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err?.response?.data || err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Admin dashboard failed."
      );
    }
  };


  const [error, setError] = useState(null);

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>
              Good day, {adminName || "Admin"}!
            </h1>
            <p style={styles.subtext}>System Overview & Analytics</p>
          </div>

          <div style={styles.timeBox}>
            <div style={styles.timeIcon}>☀️</div>
            <div style={styles.timeText}>
              <strong>{time}</strong>
              <br />
              <span style={{ fontSize: 13 }}>TODAY:</span>
              <br />
              <strong>{date.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ margin: '10px 0', padding: 12, backgroundColor: '#ffe6e6', color: '#900', borderRadius: 6 }}>
            Error loading dashboard: {String(error)}
          </div>
        )}

        {/* TOP STAT CARDS */}
        <div style={styles.cardGrid}>
          <div style={styles.card}>Total Lost Items<br /><b>{counts.lost}</b></div>
          <div style={styles.card}>Total Found Items<br /><b>{counts.found}</b></div>
          <div style={styles.card}>Total Claimed Items<br /><b>{counts.claimed}</b></div>
          <div style={styles.card}>Pending Today<br /><b>{counts.pendingToday}</b></div>
          <div style={styles.card}>Verified Today<br /><b>{counts.verifiedToday}</b></div>
        </div>

        {/* USER COUNTS */}
        <div style={styles.cardGrid}>
          <div style={styles.bigCard}>TOTAL USERS<br /><span style={styles.bigNumber}>{counts.totalUsers}</span></div>
          <div style={styles.bigCard}>TOTAL STAFF<br /><span style={styles.bigNumber}>{counts.totalStaff}</span></div>
          <div style={styles.bigCard}>TOTAL ADMIN<br /><span style={styles.bigNumber}>{counts.totalAdmin}</span></div>
        </div>

        {/* POST ACTIVITY */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Post Statistics Overview</h3>

          <div style={styles.cardGrid}>
            <div style={styles.chartCard}>Lost<br /><b>{counts.lost}</b></div>
            <div style={styles.chartCard}>Found<br /><b>{counts.found}</b></div>
            <div style={styles.chartCard}>Claimed<br /><b>{counts.claimed}</b></div>
            <div style={styles.chartCard}>Pending Today<br /><b>{counts.pendingToday}</b></div>
            <div style={styles.chartCard}>Verified Today<br /><b>{counts.verifiedToday}</b></div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* ===========================================
   💄 RESPONSIVE, NON-COMPRESSING, CLEAN STYLES
=========================================== */

const styles = {
  container: {
    display: "flex",
    backgroundColor: "#F5F5F5",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  main: {
    flexGrow: 1,
    paddingLeft: "230px",    // match your AdminNavBar width
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 25,
  },

  greeting: {
    margin: 0,
    fontSize: 30,
    fontWeight: "bold",
    color: "#1B1B3A",
  },

  subtext: {
    marginTop: -5,
    color: "#6A6A6A",
  },

  timeBox: {
    display: "flex",
    gap: 10,
    padding: "15px 20px",
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    minWidth: 160,
    justifyContent: "center",
  },

  timeIcon: { fontSize: 32 },
  timeText: { fontSize: 16, lineHeight: "20px" },

  /** RESPONSIVE CARD GRID */
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 20,
  },

  card: {
    flex: "1 1 200px",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },

  bigCard: {
    flex: "1 1 250px",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },

  bigNumber: {
    fontSize: 40,
    fontWeight: "bold",
  },

  section: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },

  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 18,
  },

  chartCard: {
    flex: "1 1 180px",
    padding: 15,
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    textAlign: "center",
  },
};

export default AdminDashboard;

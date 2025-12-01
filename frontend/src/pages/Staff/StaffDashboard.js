import React, { useEffect, useState } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoNotificationsOutline } from "react-icons/io5";
import axios from "axios";

/* -------------------- STYLES -------------------- */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    background: "#FFFFFF",
    padding: "10px 40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topIcons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  greeting: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#1A1851",
  },
  row: {
    display: "flex",
    gap: "20px",
    marginTop: "10px",
  },
  statsContainer: {
    flex: 2,
    background: "#0F0E3E",
    borderRadius: "20px",
    padding: "20px",
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-around",
  },
  statBox: {
    textAlign: "center",
    color: "white",
  },
  circle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    border: "10px solid #F8C22E",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
  },
  circleNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  circleLabel: {
    margin: 0,
    fontSize: "14px",
  },
  statText: {
    marginTop: "10px",
    fontSize: "16px",
  },

  dateBox: {
    flex: 1,
    background: "#0F0E3E",
    borderRadius: "20px",
    padding: "25px",
    color: "#FFFFFF",
  },
  dateContent: {
    textAlign: "left",
  },
  time: {
    fontSize: "28px",
    fontWeight: "bold",
  },
  todayLabel: {
    marginTop: "15px",
    fontSize: "18px",
  },
  todayDate: {
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "-5px",
  },

  recentBox: {
    background: "#0F0E3E",
    color: "white",
    padding: "20px",
    borderRadius: "20px",
    marginTop: "20px",
  },
  recentTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  recentList: {
    marginTop: "10px",
    paddingLeft: "20px",
  },

  actionButtons: {
    marginTop: "20px",
    display: "flex",
    gap: "20px",
  },
  btn: {
    background: "#0F0E3E",
    color: "white",
    padding: "15px 25px",
    borderRadius: "10px",
    fontSize: "18px",
    cursor: "pointer",
    border: "none",
    fontWeight: "bold",
  },
};

/* -------------------- COMPONENT -------------------- */

function StaffDashboard() {
  const [counts, setCounts] = useState({
    lost: 0,
    found: 0,
    claims: 0,
  });

  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const lost = res.data.lost || [];
        const found = res.data.found || [];

        setCounts({
          lost: lost.length,
          found: found.length,
          claims: 0,
        });

        // Merge + sort by date for "Recent Activity"
        const combined = [...lost, ...found]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5); // TOP 5 RECENT ITEMS

        setRecentItems(combined);
      })
      .catch((err) => console.log("Dashboard error:", err));
  }, []);

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.greeting}>Good Day, Staff</h1>
          <div style={styles.topIcons}>
            <IoNotificationsOutline size={28} color="#1A1851" />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.statsContainer}>
            <div style={styles.statsRow}>

              <div style={styles.statBox}>
                <div style={styles.circle}>
                  <p style={styles.circleNumber}>{counts.claims}</p>
                  <p style={styles.circleLabel}>Claim Reviews</p>
                </div>
                <p style={styles.statText}>New Claim Request</p>
              </div>

              <div style={styles.statBox}>
                <div style={{ ...styles.circle, borderColor: "#F65164" }}>
                  <p style={styles.circleNumber}>{counts.lost}</p>
                  <p style={styles.circleLabel}>Lost Report</p>
                </div>
                <p style={styles.statText}>New Lost Reports</p>
              </div>

              <div style={styles.statBox}>
                <div style={{ ...styles.circle, borderColor: "#4ECB71" }}>
                  <p style={styles.circleNumber}>{counts.found}</p>
                  <p style={styles.circleLabel}>Found Report</p>
                </div>
                <p style={styles.statText}>New Found Items</p>
              </div>

            </div>
          </div>

          <div style={styles.dateBox}>
            <div style={styles.dateContent}>
              <p style={styles.time}>{new Date().toLocaleTimeString()}</p>
              <p style={styles.todayLabel}>Today:</p>
              <p style={styles.todayDate}>
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* REAL Recent Activity */}
        <div style={styles.recentBox}>
          <h3 style={styles.recentTitle}>Recent Pending Activity:</h3>

          <ul style={styles.recentList}>
            {recentItems.length === 0 ? (
              <li>No recent reports.</li>
            ) : (
              recentItems.map((item) => (
                <li key={item._id}>
                  {item.name} — submitted on{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </li>
              ))
            )}
          </ul>
        </div>

        <div style={styles.actionButtons}>
          <button style={styles.btn}>Add Announcement</button>
          <button style={styles.btn}>View Pending Post</button>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default StaffDashboard;

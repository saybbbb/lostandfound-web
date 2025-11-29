import React from "react";
import StaffNavBar from "./StaffNavBar";
import Footer from "./Footer";
import { IoNotificationsOutline } from "react-icons/io5";

function StaffDashboard() {
  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR */}
      <StaffNavBar />

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
            {/* GREETING */}
            <h1 style={styles.greeting}>Good Day, Staff PAKYU!</h1> 

            {/* TOP RIGHT ICONS */}
            <div style={styles.topIcons}>
                <IoNotificationsOutline size={28} color="#1A1851" />
            </div>
        </div>
        
        {/* MAIN ROW */}
        <div style={styles.row}>

          {/* --- LEFT: STAT CARDS --- */}
          <div style={styles.statsContainer}>
            <div style={styles.statsRow}>

              {/* Claim Reviews */}
              <div style={styles.statBox}>
                <div style={styles.circle}>
                  <p style={styles.circleNumber}>50</p>
                  <p style={styles.circleLabel}>Claim Reviews</p>
                </div>
                <p style={styles.statText}>New Claim Request</p>
              </div>

              {/* Lost Report */}
              <div style={styles.statBox}>
                <div style={{ ...styles.circle, borderColor: "#F65164" }}>
                  <p style={styles.circleNumber}>50</p>
                  <p style={styles.circleLabel}>Lost Report</p>
                </div>
                <p style={styles.statText}>New Lost Report</p>
              </div>

              {/* Found Report */}
              <div style={styles.statBox}>
                <div style={{ ...styles.circle, borderColor: "#4ECB71" }}>
                  <p style={styles.circleNumber}>50</p>
                  <p style={styles.circleLabel}>Found Report</p>
                </div>
                <p style={styles.statText}>New Found Item</p>
              </div>

            </div>
          </div>

          {/* --- RIGHT: TIME & DATE --- */}
          <div style={styles.dateBox}>
            <div style={styles.dateContent}>
              <p style={styles.time}>06:07 AM</p>
              <p style={styles.todayLabel}>Today:</p>
              <p style={styles.todayDate}>28th November 2025</p>
            </div>
          </div>

        </div>

        {/* --- RECENT ACTIVITY --- */}
        <div style={styles.recentBox}>
          <h3 style={styles.recentTitle}>Recent Activity:</h3>

          <ul style={styles.recentList}>
            <li>You approved a lost item post.</li>
            <li>You approved a claim request.</li>
            <li>You approved a found item post.</li>
          </ul>
        </div>

        {/* --- BUTTONS SECTION --- */}
        <div style={styles.actionButtons}>
          <button style={styles.btn}>Add Announcement</button>
          <button style={styles.btn}>View Pending Post</button>
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}

export default StaffDashboard;

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

  /* TOP RIGHT ICONS */
  topIcons: {
    display: "flex",
    justifyContent: "flex-end",
  },

  /* GREETING */
  greeting: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#1A1851",
  },

  /* MAIN ROW */
  row: {
    display: "flex",
    gap: "20px",
    marginTop: "10px",
  },

  /* LEFT STAT BOXES */
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

  /* DATE BOX */
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

  /* RECENT ACTIVITY */
  recentBox: {
    background: "#0F0E3E",
    color: "white",
    padding: "20px",
    borderRadius: "20px",
    marginTop: "10px",
  },
  recentTitle: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  recentList: {
    marginTop: "10px",
  },

  /* ACTION BUTTONS */
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

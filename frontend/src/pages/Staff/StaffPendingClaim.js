import React, { useState, useEffect } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoSearchOutline } from "react-icons/io5";
import axios from "axios";

function StaffPendingClaim() {
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/auth/staff/pending-claims", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setClaims(res.data.claims || []))
      .catch((err) => console.log(err));
  }, []);

  const filtered = claims.filter((row) =>
    row.claimant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        <h1 style={styles.title}>Pending Claim Request</h1>

        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search Student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.iconBox}>
            <IoSearchOutline size={22} color="#ffffff" />
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Date Requested</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.td}>No pending claims</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row._id}>
                    <td style={styles.td}>{row.item_name}</td>
                    <td style={styles.td}>{row.claimant?.name}</td>
                    <td style={styles.td}>{row.date_claimed?.substring(0, 10)}</td>

                    <td style={styles.actionTd}>
                      <button style={styles.viewBtn}>VIEW</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default StaffPendingClaim;

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "20px 40px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1A1851",
    marginBottom: "20px",
  },
  searchRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  searchInput: {
    width: "300px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px 0 0 6px",
  },
  iconBox: {
    backgroundColor: "#1A1851",
    padding: "12px 15px",
    borderRadius: "0 6px 6px 0",
    cursor: "pointer",
  },
  tableWrapper: {
    backgroundColor: "#f8f8f8",
    borderRadius: "8px",
    padding: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f0f0f0",
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },
  actionTd: {
    padding: "12px",
  },
  viewBtn: {
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    padding: "6px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
    
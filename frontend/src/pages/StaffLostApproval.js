import React, { useState } from "react";
import StaffNavBar from "./StaffNavBar";
import Footer from "./Footer";
import { IoSearchOutline } from "react-icons/io5";

function LostItemPostApproval() {
  const [search, setSearch] = useState("");

  // Sample static data (replace with API later)
  const data = [
    { type: "Lost", item: "Black Wallet", user: "Tiger Nixon", date: "2025/01/20", status: "Pending" },
    { type: "Lost", item: "Water Bottle", user: "Sonya Frost", date: "2025/01/20", status: "Pending" },
    { type: "Lost", item: "USB Flash Drive (64GB)", user: "Rhona Davidson", date: "2025/01/20", status: "Pending" },
    { type: "Lost", item: "USTP Student ID", user: "Quinn Flynn", date: "2025/01/20", status: "Pending" },
    { type: "Lost", item: "Umbrella (Gray)", user: "Colleen Hurst", date: "2025/01/20", status: "Pending" },
  ];

  const filtered = data.filter((row) =>
    row.item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      
      {/* LEFT SIDEBAR */}
      <StaffNavBar />

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* PAGE TITLE */}
        <h1 style={styles.title}>Lost Item Post Approval</h1>

        {/* SEARCH BAR */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search User Here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.iconBox}>
            <IoSearchOutline size={22} color="#ffffff" />
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Posted By</th>
                <th style={styles.th}>Date Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, index) => (
                <tr key={index}>
                  <td style={styles.td}>{row.type}</td>
                  <td style={styles.td}>{row.item}</td>
                  <td style={styles.td}>{row.user}</td>
                  <td style={styles.td}>{row.date}</td>
                  <td style={styles.td}>{row.status}</td>
                  <td style={styles.actionTd}>
                    <button style={styles.approveBtn}>APPROVE</button>
                    <button style={styles.rejectBtn}>REJECT</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}

export default LostItemPostApproval;


/* -------------------------------- STYLES -------------------------------- */

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

  searchWrapper: {
    display: "flex",
    marginBottom: "20px",
  },

  searchInput: {
    flex: 1,
    fontSize: "16px",
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
    textAlign: "left",
    backgroundColor: "#f0f0f0",
    padding: "12px",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },

  actionTd: {
    padding: "12px",
    display: "flex",
    gap: "8px",
  },

  approveBtn: {
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  rejectBtn: {
    backgroundColor: "#E53935",
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

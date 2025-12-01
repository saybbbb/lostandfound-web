import React, { useState, useEffect } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoSearchOutline } from "react-icons/io5";
import axios from "axios";

function StaffLostApproval() {
  const [search, setSearch] = useState("");
  const [lostItems, setLostItems] = useState([]);
  const token = localStorage.getItem("token");

  // LOAD PENDING LOST ITEMS
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setLostItems(res.data.lost || []))
      .catch((err) => console.log(err));
  }, [token]);

  // APPROVE LOST ITEM
  const approveItem = async (itemId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/approve",
        { itemId, type: "lost" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove approved item from UI
      setLostItems((prev) => prev.filter((item) => item._id !== itemId));

      alert("Lost item approved!");
    } catch (err) {
      console.log(err);
      alert("Approval failed.");
    }
  };

  // REJECT LOST ITEM
  const rejectItem = async (itemId) => {
    const reason = prompt("Enter a reason for rejecting this lost item:");

    if (!reason) return;

    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/reject",
        { itemId, type: "lost", reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove rejected item from UI
      setLostItems((prev) => prev.filter((item) => item._id !== itemId));

      alert("Lost item rejected.");
    } catch (err) {
      console.log(err);
      alert("Rejection failed.");
    }
  };

  // SEARCH FILTER
  const filtered = lostItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        <h1 style={styles.title}>Lost Item Post Approval</h1>

        {/* SEARCH BAR */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search Item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.iconBox}>
            <IoSearchOutline size={22} color="#fff" />
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Reported By</th>
                <th style={styles.th}>Date Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row._id}>
                  <td style={styles.td}>{row.name}</td>
                  <td style={styles.td}>{row.reported_by?.name || "Unknown"}</td>
                  <td style={styles.td}>{row.date_lost?.substring(0, 10)}</td>
                  <td style={styles.td}>{row.approval_status}</td>

                  <td style={styles.actionTd}>
                    <button
                      style={styles.approveBtn}
                      onClick={() => approveItem(row._id)}
                    >
                      APPROVE
                    </button>

                    <button
                      style={styles.rejectBtn}
                      onClick={() => rejectItem(row._id)}
                    >
                      REJECT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default StaffLostApproval;

/* ------------------ STYLES ------------------ */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#fff",
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
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px 0 0 6px",
  },
  iconBox: {
    backgroundColor: "#1A1851",
    padding: "12px 15px",
    borderRadius: "0 6px 6px 0",
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
    fontWeight: "bold",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },
  actionTd: {
    display: "flex",
    gap: "8px",
    padding: "12px",
  },
  approveBtn: {
    backgroundColor: "#1A1851",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  rejectBtn: {
    backgroundColor: "#E53935",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

import React, { useState, useEffect } from "react";
import StaffNavBar from "../../components/NavigationBars/StaffNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoSearchOutline } from "react-icons/io5";
import axios from "axios";

function StaffFoundApproval() {
  const [search, setSearch] = useState("");
  const [foundItems, setFoundItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/staff/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFoundItems(res.data.found || []))
      .catch((err) => console.log(err));
  }, [token]);

  // APPROVE FOUND ITEM
  const approveItem = async (itemId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/approve",
        { itemId, type: "found" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove from UI
      setFoundItems((prev) => prev.filter((i) => i._id !== itemId));

      alert("Found item approved!");
    } catch (err) {
      console.log(err);
      alert("Approval failed.");
    }
  };

  // REJECT FOUND ITEM
  const rejectItem = async (itemId) => {
    const reason = prompt("Enter a reason for rejection:");

    if (!reason) return;

    try {
      await axios.post(
        "http://localhost:5000/api/auth/staff/reject",
        { itemId, type: "found", reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove from UI
      setFoundItems((prev) => prev.filter((i) => i._id !== itemId));

      alert("Found item rejected.");
    } catch (err) {
      console.log(err);
      alert("Rejection failed.");
    }
  };

  const filtered = foundItems.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <StaffNavBar />

      <div style={styles.mainContent}>
        <h1 style={styles.title}>Found Item Post Approval</h1>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search Item..."
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
                <th style={styles.th}>Posted By</th>
                <th style={styles.th}>Date Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row) => (
                <tr key={row._id}>
                  <td style={styles.td}>{row.name}</td>
                  <td style={styles.td}>{row.posted_by?.name || "Unknown"}</td>
                  <td style={styles.td}>{row.date_found?.substring(0, 10)}</td>
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

export default StaffFoundApproval;

/* ------------ STYLES (same as LostApproval for consistency) ----------- */
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

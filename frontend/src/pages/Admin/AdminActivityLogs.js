import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoSearchOutline } from "react-icons/io5";

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/activity-logs",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLogs(res.data.logs || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // FILTERING
  const filtered = logs
    .filter((log) => (filter === "all" ? true : log.type === filter))
    .filter((log) =>
      (log.name + log.verifier)
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <p>Activity Logs</p>

          <div style={styles.buttonContainer}>
            <button onClick={() => setFilter("all")} style={styles.button}>All</button>
            <button onClick={() => setFilter("found")} style={styles.button}>Found</button>
            <button onClick={() => setFilter("lost")} style={styles.button}>Lost</button>
            <button onClick={() => setFilter("claim")} style={styles.button}>Claimed</button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={styles.body}>
          <div style={styles.searchbar}>
            <input
              placeholder="Search by name or verifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchinput}
            />
            <IoSearchOutline size={20} color="#fff" style={styles.searchicon} />
          </div>

          {/* TABLE */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.theadSticky}>
                <tr>
                  <th style={styles.th}>Index</th>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Activity</th>
                  <th style={styles.th}>Verifier</th>
                  <th style={styles.th}>Result</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((log, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={styles.td}>{log.name}</td>
                      <td style={styles.td}>{log.activity}</td>
                      <td style={styles.td}>{log.verifier}</td>
                      <td style={styles.td}>{log.result}</td>

                      <td style={styles.td}>
                        {log.action === "Claimed" ? (
                          <button style={styles.greenBtn}>Claimed</button>
                        ) : (
                          <button style={styles.blueBtn}>Posted</button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={styles.noData}>No activities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh" },
  
  mainContent: {
    flexGrow: 1,
    paddingLeft: "220px",    // match your AdminNavBar width
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  header: { padding: 20, background: "#fff" },

  buttonContainer: { display: "flex", gap: 10 },
  button: {
    padding: "8px 16px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  body: { padding: 20, background: "#fff" },

  searchbar: { display: "flex", marginBottom: 15 },
  searchinput: {
    flex: 1,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: "6px 0 0 6px",
  },
  searchicon: {
    padding: 10,
    background: "#1A1851",
    borderRadius: "0 6px 6px 0",
  },

  tableWrapper: { maxHeight: 400, overflowY: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  theadSticky: {
    position: "sticky",
    top: 0,
    background: "#f4f4f4",
  },

  th: { padding: 10, borderBottom: "2px solid #ccc" },
  td: { padding: 10, borderBottom: "1px solid #ddd" },

  greenBtn: {
    padding: "6px 12px",
    background: "green",
    color: "#fff",
    borderRadius: 6,
    border: "none",
  },
  blueBtn: {
    padding: "6px 12px",
    background: "#1A73E8",
    color: "#fff",
    borderRadius: 6,
    border: "none",
  },

  noData: { textAlign: "center", padding: 20 },
};

export default AdminActivityLogs;

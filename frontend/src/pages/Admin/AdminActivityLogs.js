import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";
import Footer from "../../components/NavigationBars/Footer";
import { IoSearchOutline, IoRefreshOutline } from "react-icons/io5";

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState(0); // 0 = All
  const [loading, setLoading] = useState(false);

  // FETCH LOGS
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/auth/admin/activity-logs",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ensure logs is an array
      setLogs(res.data.logs || []);
    } catch (err) {
      console.log("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load + Auto Refresh (every 30s to keep 15-min window fresh)
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // FILTER LOGIC
  const filteredLogs = logs.filter((log) => {
    // 1. Time Filter
    if (timeFilter > 0) {
      const logTime = new Date(log.timestamp).getTime();
      const now = Date.now();
      const diffMinutes = (now - logTime) / 1000 / 60;
      
      if (diffMinutes > timeFilter) return false;
    }

    // 2. Search Filter (Name, Activity, Verifier)
    const term = search.toLowerCase();
    const match =
      (log.name && log.name.toLowerCase().includes(term)) ||
      (log.activity && log.activity.toLowerCase().includes(term)) ||
      (log.verifier && log.verifier.toLowerCase().includes(term));

    return match;
  });

  const getResultStyle = (result) => {
    const r = result ? result.toLowerCase() : "";
    if (r === "verified" || r === "approved") return styles.tagGreen;
    if (r === "rejected" || r === "deleted") return styles.tagRed;
    return styles.tagBlue;
  };

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>System Activity Logs</h2>
          <p style={styles.subtitle}>
            Monitoring recent system actions (Auto-clears &gt; 15 mins) {/* &gt = ">"*/}
          </p>
        </div>

        <div style={styles.body}>
          {/* CONTROLS */}
          <div style={styles.controlsRow}>
            {/* SEARCH */}
            <div style={styles.searchContainer}>
              <IoSearchOutline size={20} color="#64748b" style={styles.searchIcon} />
              <input
                placeholder="Search Name, Activity, or Verifier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* TIME FILTERS */}
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Show Last:</span>
              {[
                { label: "All", value: 0 },
                { label: "3 mins", value: 3 },
                { label: "5 mins", value: 5 },
                { label: "10 mins", value: 10 },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setTimeFilter(btn.value)}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: timeFilter === btn.value ? "#1A1851" : "#F1F5F9",
                    color: timeFilter === btn.value ? "#fff" : "#64748B",
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button 
                onClick={fetchLogs} 
                style={styles.refreshBtn} 
                title="Refresh Data"
              >
                <IoRefreshOutline size={20} />
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>Index</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Activity</th>
                    <th style={styles.th}>Activity Name/Details</th>
                    <th style={styles.th}>Verifier</th>
                    <th style={styles.th}>Result</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={styles.centerText}>Loading logs...</td>
                    </tr>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <tr key={log._id || idx} style={styles.tr}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>
                          <div style={styles.dateTime}>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span style={styles.dateSub}>{new Date(log.timestamp).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td style={{...styles.td, fontWeight: "600"}}>{log.name}</td>
                        <td style={styles.td}>{log.activity}</td>
                        <td style={styles.td}>{log.details}</td>
                        <td style={styles.td}>{log.verifier}</td>
                        <td style={styles.td}>
                          <span style={getResultStyle(log.result)}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={styles.centerText}>
                        No activities found in this time range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'Inter', sans-serif",
  },
  mainContent: {
    flexGrow: 1,
    paddingLeft: "220px", // Match AdminNavBar width
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  header: {
    padding: "30px 40px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #E5E7EB",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#1E293B",
    fontWeight: "700",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748B",
    fontSize: "14px",
  },
  body: {
    padding: "30px 40px",
    flexGrow: 1,
  },
  controlsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  searchContainer: {
    position: "relative",
    width: "320px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  searchInput: {
    width: "100%",
    padding: "12px 12px 12px 44px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#334155",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748B",
    marginRight: "4px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #E5E7EB",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  refreshBtn: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#fff",
    color: "#1A1851",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginLeft: "10px",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
    maxHeight: "65vh",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  thead: {
    backgroundColor: "#F8FAFC",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  th: {
    padding: "16px 20px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #E5E7EB",
  },
  tr: {
    borderBottom: "1px solid #F1F5F9",
    transition: "background 0.2s",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  dateTime: {
    display: "flex",
    flexDirection: "column",
  },
  dateSub: {
    fontSize: "12px",
    color: "#94A3B8",
    marginTop: "2px",
  },
  centerText: {
    padding: "40px",
    textAlign: "center",
    color: "#94A3B8",
  },
  tagGreen: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  tagRed: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  tagBlue: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default AdminActivityLogs;
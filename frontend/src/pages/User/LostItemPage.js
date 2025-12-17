// ============================= 1. IMPORTS =============================
import React, { useEffect, useState } from "react";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// ============================= 2. COMPONENT =============================
function LostItemPage() {
  const [myLostItems, setMyLostItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  // Load user's lost items
  useEffect(() => {
    api
      .get("/api/auth/lost-items/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setMyLostItems(res.data.items || []))
      .catch((err) => console.log(err));
  }, []);

  // Load all items
  useEffect(() => {
    fetchLostItemsWithStatus();
    fetchCategories();
  }, []);

  const fetchLostItemsWithStatus = async () => {
    try {
      const res = await api.get("/api/auth/lost-items-with-status");
      setLostItems(res.data.lost || []);
      setFoundReports(res.data.foundReports || []);
    } catch (err) {
      console.log("Error fetching lost items with status:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/auth/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Error fetching categories:", err);
    }
  };

  const handleCancel = async (itemId) => {
    if (window.confirm("Are you sure you want to cancel this report?")) {
      try {
        await api.delete(`/api/auth/lost-items/${itemId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMyLostItems(myLostItems.filter((item) => item._id !== itemId));
        setLostItems(lostItems.filter((item) => item._id !== itemId));
      } catch (err) {
        console.error("Error cancelling item:", err);
        alert(err.response?.data?.message || "Failed to cancel report.");
      }
    }
  };

  // Merge items
  const combinedItems = [
    ...lostItems,
    ...myLostItems.filter((i) => i.approval_status === "pending"),
  ];

  const uniqueItems = Object.values(
    combinedItems.reduce((acc, item) => {
      acc[item._id] = item;
      return acc;
    }, {})
  );

  // Filter items
  const filteredItems = uniqueItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filter === "All" ||
      item.category?.name?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const finalItems = filteredItems.filter((item) => {
    const found = foundReports.find(
      (f) => String(f.lost_item_id) === String(item._id)
    );
    if (found && found.approval_status === "approved") {
      return false;
    }
    return true;
  });

  // ============================= 3. RENDER =============================
  return (
    <div>
      <Header />

      <div style={styles.pageContainer}>
        {/* Title */}
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Lost Items</h1>
          <button
            style={styles.reportBtn}
            onClick={() => navigate("/ReportLostItemPage")}
          >
            + Report Lost Item
          </button>
        </div>

        {/* Search + Filters */}
        <div style={styles.searchFilterRow}>
          <div style={styles.searchBox}>
            <input
              style={styles.searchInput}
              placeholder="Search lost items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>

          <div style={styles.filterRow}>
            <button
              onClick={() => setFilter("All")}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === "All" ? "#1A1851" : "#F5F6FA",
                color: filter === "All" ? "#fff" : "#333",
              }}
            >
              All Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setFilter(cat.name)}
                style={{
                  ...styles.filterBtn,
                  backgroundColor:
                    filter === cat.name ? "#1A1851" : "#F5F6FA",
                  color: filter === cat.name ? "#fff" : "#333",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lost Item Grid */}
        <div style={styles.grid}>
          {finalItems.map((item) => {
            const found = foundReports.find(
              (f) => String(f.lost_item_id) === String(item._id)
            );

            const isPendingFoundReport =
              found && found.approval_status === "pending";

            const myLost = myLostItems.find((m) => m._id === item._id);
            const isPendingLostApproval =
              myLost && myLost.approval_status === "pending";

            return (
              <div key={item._id} style={styles.card}>
                <img
                  src={item.image_url || "/images/no-image.png"}
                  alt="Lost"
                  style={styles.image}
                />

                <div style={styles.cardBody}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemDate}>
                    {new Date(item.date_lost).toISOString().split("T")[0]}
                  </p>

                  <p style={styles.itemLocation}>{item.lost_location}</p>
                  <p style={styles.itemDesc}>{item.description}</p>

                  {/* DISPLAY RULES */}
                  <div style={styles.cardActions}>
                    {isPendingLostApproval ? (
                      <p style={styles.badgePending}>Pending Verification...</p>
                    ) : isPendingFoundReport ? (
                      <p style={styles.badgePending}>Found Report Pending...</p>
                    ) : (
                      <button
                        style={styles.contactBtn}
                        onClick={() => navigate(`/LostReportPage/${item._id}`)}
                      >
                        Found This Item
                      </button>
                    )}

                    {myLost && (
                      <button
                        style={{ ...styles.contactBtn, color: "red" }}
                        onClick={() => handleCancel(item._id)}
                      >
                        Cancel Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ============================= 4. STYLES =============================
const styles = {
  pageContainer: { padding: "40px 80px", minHeight: "65vh" },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: 40, fontWeight: "bold", color: "#1A1851" },
  reportBtn: {
    padding: "12px 20px",
    backgroundColor: "#1A1851",
    color: "white",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  searchFilterRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    width: "40%",
    borderRadius: "8px",
    border: "1px solid #ddd",
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none",
    fontSize: 16,
  },
  searchBtn: {
    padding: "12px 20px",
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  filterRow: { display: "flex", gap: "10px" },
  filterBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    backgroundColor: "#eee",
  },
  cardBody: { padding: "20px" },
  itemName: { fontSize: 20, fontWeight: "bold" },
  itemDate: { fontSize: 14, color: "#777", marginBottom: "10px" },
  itemLocation: { fontSize: 16, fontWeight: "500", color: "#333" },
  itemDesc: { fontSize: 14, color: "#555", margin: "10px 0px" },
  cardActions: { 
    marginTop: "15px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  contactBtn: {
    color: "#1A1851",
    fontWeight: "bold",
    fontSize: 14,
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: 0,
  },
  badgePending: { color: "orange", fontWeight: "bold", marginTop: 10 },
  badgeFound: { color: "green", fontWeight: "bold", marginTop: 10 },
};

export default LostItemPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { useNavigate } from "react-router-dom";

function FoundItemPage() {
  const [foundItems, setFoundItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoundItems();
    fetchCategories();
  }, []);


const [myLostItems, setMyLostItems] = useState([]);

useEffect(() => {
  axios.get("http://localhost:5000/api/auth/lost-items/my", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
  .then(res => setMyLostItems(res.data.items || []))
  .catch(err => console.log(err));
}, []);

  // Load found items
  const fetchFoundItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/found-items");
      setFoundItems(res.data.items || []);
    } catch (err) {
      console.log("Error fetching found items:", err);
    }
  };

  // Load categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Error loading categories:", err);
    }
  };

  // Filter Logic
  const filteredItems = foundItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filter === "All" ||
      item.category?.name?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  

  // Same style object as LostItemPage
  const styles = {
    pageContainer: {
      padding: "40px 80px",
      minHeight: "65vh",
    },
    titleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: 40,
      fontWeight: "bold",
      color: "#1A1851",
    },
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
    filterRow: {
      display: "flex",
      gap: "10px",
    },
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
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
    },
    image: {
      width: "100%",
      height: "220px",
      objectFit: "cover",
      backgroundColor: "#eee",
    },
    cardBody: {
      padding: "20px",
    },
    itemName: {
      fontSize: 20,
      fontWeight: "bold",
    },
    itemDate: {
      fontSize: 14,
      color: "#777",
      marginBottom: "10px",
    },
    itemLocation: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
    },
    itemDesc: {
      fontSize: 14,
      color: "#555",
      margin: "10px 0px",
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
  };

  return (
    <div>
      <Header />

      <div style={styles.pageContainer}>
        {/* Title + Report Button */}
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Found Items</h1>
          <button
            style={styles.reportBtn}
            onClick={() => navigate("/ReportFoundItemPage")}
          >
            + Report Found Item
          </button>
        </div>

        {/* Search + Filters */}
        <div style={styles.searchFilterRow}>
          {/* Search Input */}
          <div style={styles.searchBox}>
            <input
              style={styles.searchInput}
              placeholder="Search found items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>

          {/* Category Filters */}
          <div style={styles.filterRow}>
            {/* All Items */}
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

            {/* Real Categories */}
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

        {/* Found Items Grid */}
        <div style={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item._id} style={styles.card}>
              <img
                src={item.image_url || "/images/no-image.png"}
                alt="Found"
                style={styles.image}
              />

              <div style={styles.cardBody}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemDate}>
                  {new Date(item.date_found).toISOString().split("T")[0]}
                </p>

                <p style={styles.itemLocation}>{item.found_location}</p>
                <p style={styles.itemDesc}>{item.description}</p>

                <button
  disabled={item.claim_status === "claimed"}
  onClick={() => navigate(`/ClaimFoundItemPage/${item._id}`)}
  style={{
    opacity: item.claim_status === "claimed" ? 0.5 : 1,
    cursor: item.claim_status === "claimed" ? "not-allowed" : "pointer"
  }}
>
  {item.claim_status === "claimed" ? "Pending Verification" : "Claim Item"}
</button>

              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default FoundItemPage;

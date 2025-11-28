import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";
import AdminNavBar from "./AdminNavBar";
import { IoSearchOutline } from "react-icons/io5";

function AdminDashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [adminName, setAdminName] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const usersRes = await axios.get(
        "http://localhost:5000/api/auth/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // Validate token
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        
        setAdminName(res.data.user?.name || "Admin");

        fetchUsers();
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/admin");
      }
    };

    load();
  }, [navigate]);

  // Update role
  const updateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/auth/admin/set-role/${userId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Role updated successfully!");
      fetchUsers();
    } catch (err) {
      alert("Failed to update role.");
      console.error(err);
    }
  };

  // Search filter
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>

      {/* ⬇️ LEFT SIDEBAR */}
      <AdminNavBar />

      {/* ⬇️ MAIN CONTENT */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <p>MANAGE USER ACCOUNTS</p>
          <div style={styles.buttonContainer}>
            <button style={styles.button}>User</button>
            <button style={styles.button}>Admin</button>
            <button style={styles.button}>Unverified</button>
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.searchbar}>
            <input
              type="text"
              placeholder="Search User Here..."
              style={styles.searchinput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IoSearchOutline size={20} color="#ffffff" style={styles.searchicon} />
          </div>

          <div style={styles.userList}>
            {filteredUsers.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Index</th>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Birthday</th>
                    <th style={styles.th}>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u._id || index}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.birthday ? new Date(u.birthday).toISOString().split("T")[0] : "—"}</td>

                      <td style={styles.td}>
                        <select
                          value={u.role?.toLowerCase() || ""}
                          style={styles.select}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

// Styles (same as before)
const styles = {
  container: {
    fontFamily: "Arial",
    display: "flex",
    minHeight: "100vh",
  },
  mainContent: {
    flex: 6,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: "#1A1851",
    backgroundColor: "#FFFFFF",
    padding: "20px",
    minHeight: "15vh",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#1A1851",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "6px",
  },
  body: {
    backgroundColor: "#ffffff",
    padding: "20px",
    minHeight: "65vh",
    marginBottom: "20px",
  },
  searchbar: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  searchinput: {
    flex: 1,
    fontSize: 16,
    padding: "10px",
    width: "90%",
    border: "1px solid #ccc",
    borderRadius: "6px 0px 6px 6px",
  },
  searchicon: {
    backgroundColor: "#1A1851",
    alignSelf: "center",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "0px 6px 6px 0px",
  },
  userList: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "2px solid #ccc",
    padding: "10px",
  },
  th: {
    border: "1px solid #ccc",
    padding: "10px",
    backgroundColor: "#f4f4f4",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px",
  },
  select: {
    padding: "4px",
  },
};

export default AdminDashboard;
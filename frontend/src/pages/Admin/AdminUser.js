import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/NavigationBars/Footer";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";

import { IoSearchOutline } from "react-icons/io5";

function AdminUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Delete Modal
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersRes = await axios.get(
        "http://localhost:5000/api/auth/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const validate = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/admin");
      }
    };
    validate();
  }, [navigate]);

  // Update role API
  const saveRoleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/auth/admin/set-role/${selectedUser._id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Role updated successfully.");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert("Failed to update role.");
      console.error(err);
    }
  };

  // Delete API
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/auth/admin/delete/${deleteUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("User deleted.");
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // Filter + Search
  const filteredUsers = users
    .filter((u) =>
      filterRole === "all" ? true : u.role?.toLowerCase() === filterRole
    )
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1>MANAGE USER ACCOUNTS</h1>

          <div style={styles.buttonContainer}>
            {["all", "user", "admin", "staff"].map((role) => (
              <button
                key={role}
                style={styles.button}
                onClick={() => setFilterRole(role)}
              >
                {role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          {/* SEARCH BAR */}
          <div style={styles.searchbar}>
            <input
              type="text"
              placeholder="Search User Here..."
              style={styles.searchinput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IoSearchOutline size={20} color="#fff" style={styles.searchicon} />
          </div>

          {/* TABLE */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.theadSticky}>
                <tr>
                  <th style={styles.th}>Index</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Birthday</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, index) => (
                    <tr key={u._id}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        {u.birthday
                          ? new Date(u.birthday).toISOString().split("T")[0]
                          : "—"}
                      </td>
                      <td style={styles.td}>{u.role}</td>

                      {/* ACTION BUTTONS */}
                      <td style={{ ...styles.td, display: "flex", gap: 10 }}>
                        <button
                          style={styles.editActionBtn}
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                          }}
                        >
                          EDIT
                        </button>

                        <button
                          style={styles.deleteActionBtn}
                          onClick={() => setDeleteUser(u)}
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={styles.noData}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>

      {/* ROLE EDIT MODAL */}
      {selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Edit Role</h3>
            <p>{selectedUser.name}</p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={styles.modalSelect}
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={saveRoleUpdate}>
                Save
              </button>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Delete User</h3>
            <p>
              Are you sure you want to delete:{" "}
              <strong>{deleteUser.name}</strong>?
            </p>

            <div style={styles.modalBtns}>
              <button style={styles.deleteBtn} onClick={confirmDelete}>
                Delete
              </button>
              <button
                style={styles.closeBtn}
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- STYLES -------------------- */

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F5F5F5",
    overflow: "hidden"
  },

  // FIXED: ensure main content starts AFTER the sidebar
  mainContent: {
    flexGrow: 1,
    paddingLeft: "230px",    // match your AdminNavBar width
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },

  header: {
    color: "#1A1851",
    padding: "25px 40px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
  },

  body: {
    flexGrow: 1,
    background: "#fff",
    padding: "20px 40px",
    overflowY: "auto",
  },

  buttonContainer: {
    display: "flex",
    gap: 10,
    marginTop: 10
  },

  button: {
    padding: "8px 16px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none"
  },

  /* SEARCH BAR */
  searchbar: {
    display: "flex",
    alignItems: "center",
    marginBottom: 15
  },
  searchinput: {
    flex: 1,
    padding: 10,
    borderRadius: "6px 0 0 6px",
    border: "1px solid #ccc",
  },
  searchicon: {
    background: "#1A1851",
    padding: 10,
    borderRadius: "0 6px 6px 0",
    cursor: "pointer",
  },

  /* TABLE */
  tableWrapper: {
    maxHeight: "500px",
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: 6,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  theadSticky: {
    position: "sticky",
    top: 0,
    background: "#f4f4f4",
    zIndex: 5,
  },

  th: {
    padding: 12,
    borderBottom: "2px solid #ccc",
    fontWeight: "bold",
    background: "#f4f4f4"
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #ddd",
  },

  noData: {
    padding: 20,
    textAlign: "center",
    color: "#777",
  },

  editActionBtn: {
    padding: "8px 16px",
    background: "#28a745",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
  },

  deleteActionBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
  },

  /* MODALS */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  modal: {
    background: "#fff",
    padding: 25,
    borderRadius: 10,
    width: 350,
    textAlign: "center",
  },

  modalSelect: {
    width: "100%",
    padding: 8,
    marginTop: 15,
    borderRadius: 6,
  },

  modalBtns: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
  },

  saveBtn: {
    padding: "8px 14px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  closeBtn: {
    padding: "8px 14px",
    background: "#ccc",
    borderRadius: 6,
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "8px 14px",
    background: "red",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
};


export default AdminUser;

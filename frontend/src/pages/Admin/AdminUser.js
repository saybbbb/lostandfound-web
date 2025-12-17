import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/NavigationBars/Footer";
import AdminNavBar from "../../components/NavigationBars/AdminNavBar";
import { IoSearchOutline } from "react-icons/io5";
import api from "../../services/api";
import usePageMetadata from "../../hooks/usePageMetadata";

function AdminUser() {
  usePageMetadata("Admin User", "/images/LAFLogo.png");

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Delete Modal
  const [deleteUser, setDeleteUser] = useState(null);

  // ============================
  // FETCH USERS
  // ============================
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersRes = await api.get("/api/auth/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const validate = async () => {
      try {
        const token = localStorage.getItem("token");
        await api.get("/api/auth/protected", {
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

  // ============================
  // VERIFY USER
  // ============================
  const verifyUserById = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/auth/admin/verify/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("User verified successfully.");
      fetchUsers();
    } catch (err) {
      alert("Failed to verify user.");
      console.error(err);
    }
  };

  // ============================
  // REJECT USER
  // ============================
  const rejectUserById = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/api/auth/admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User rejected and deleted.");
      fetchUsers();
    } catch (err) {
      alert("Failed to reject user.");
      console.error(err);
    }
  };

  // ============================
  // UPDATE ROLE
  // ============================
  const saveRoleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/api/auth/admin/set-role/${selectedUser._id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Role updated successfully.");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      // Backend now returns specific errors (e.g. "Cannot change main admin role")
      const errMsg = err.response?.data?.message || "Failed to update role.";
      alert(errMsg);
      console.error(err);
    }
  };

  // ============================
  // DELETE USER
  // ============================
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/api/auth/admin/delete/${deleteUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted.");
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Delete failed.";
      alert(errMsg);
    }
  };

  // ============================
  // FILTER USERS
  // ============================
  const filteredUsers = users
    .filter((u) => {
      // Logic:
      // 1. "unverified" tab shows ONLY users with verified: false
      // 2. "all" tab shows ONLY users with verified: true (Active Users)
      // 3. "user"/"staff"/"admin" tabs show verified users of that role

      if (filterRole === "unverified") return u.verified === false;

      // For all other tabs, we only show VERIFIED users
      if (u.verified === false) return false;

      if (filterRole === "all") return true;

      return u.role?.toLowerCase() === filterRole;
    })
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div style={styles.container}>
      <AdminNavBar />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1>MANAGE USER ACCOUNTS</h1>

          <div style={styles.buttonContainer}>
            {["all", "user", "admin", "staff", "unverified"].map((role) => (
              <button
                key={role}
                style={{
                  ...styles.button,
                  backgroundColor: filterRole === role ? "#0F0E3E" : "#1A1851",
                }}
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
              placeholder="Search User by Name or Email..."
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

                      {/* ROLE + UNVERIFIED BADGE */}
                      <td style={styles.td}>
                        {u.role}
                        {u.verified === false && (
                          <span style={styles.unverifiedTag}>UNVERIFIED</span>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td style={{ ...styles.td, display: "flex", gap: 10 }}>
                        {/* SHOW ONLY WHEN UNVERIFIED */}
                        {u.verified === false ? (
                          <>
                            <button
                              style={styles.verifyActionBtn}
                              onClick={() => verifyUserById(u._id)}
                            >
                              VERIFY
                            </button>

                            <button
                              style={styles.rejectActionBtn}
                              onClick={() => rejectUserById(u._id)}
                            >
                              REJECT
                            </button>
                          </>
                        ) : (
                          /* SHOW ONLY WHEN VERIFIED */
                          <>
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
                          </>
                        )}
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
    overflow: "hidden",
  },

  mainContent: {
    flexGrow: 1,
    paddingLeft: "230px", // match your AdminNavBar width
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
    marginTop: 10,
  },

  button: {
    padding: "8px 16px",
    background: "#1A1851",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
  },

  searchbar: {
    display: "flex",
    alignItems: "center",
    marginBottom: 15,
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
    background: "#f4f4f4",
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

  unverifiedTag: {
    background: "#FF4D4D",
    color: "white",
    padding: "3px 7px",
    marginLeft: 8,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: "bold",
  },

  verifyActionBtn: {
    padding: "8px 16px",
    background: "#007bff",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
  },

  rejectActionBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
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

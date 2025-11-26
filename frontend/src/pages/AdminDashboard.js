import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // Check protected route
        const res = await axios.get(
          "http://localhost:5000/api/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessage(res.data.message);

        fetchUsers();
      } catch (err) {
        alert("Unauthorized. Please login again.");
        navigate("/admin");
      }
    };

    fetchData();
  }, [navigate]);

  // Update user role
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

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>
      <p>{message}</p>

      <button onClick={logout} style={styles.logoutBtn}>
        Logout
      </button>

      <h2>User Role Management</h2>

      <div style={styles.userList}>
        {users.length > 0 ? (
          users.map((u) => (
            <div key={u.id} style={styles.userCard}>
              <p><strong>{u.name}</strong></p>
              <p>Email: {u.email}</p>

              <label>Role:</label>
              <select
  value={u.role.toLowerCase()}
  style={styles.select}
  onChange={(e) => updateRole(u._id, e.target.value)}
>
  <option value="student">Student</option>
  <option value="staff">Staff</option>
  <option value="admin">Admin</option>
</select>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial",
  },
  logoutBtn: {
    padding: "8px 16px",
    marginBottom: "20px",
    cursor: "pointer",
  },
  userList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
  },
  userCard: {
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f7f7f7",
  },
  select: {
    marginTop: "5px",
    padding: "5px",
    width: "150px",
  },
};

export default AdminDashboard;

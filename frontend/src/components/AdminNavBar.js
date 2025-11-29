import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoHomeOutline, IoPersonOutline, IoCubeOutline, IoCheckmarkDoneCircleOutline } from "react-icons/io5";

function AdminNavBar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  // Fetch Admin Info
  const fetchAdminInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await axios.get(
        "http://localhost:5000/api/auth/protected",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminName(res.data.user?.name || "Admin");
    } catch (err) {
      alert("Unauthorized. Please login again.");
      navigate("/admin");
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={styles.navbar}>
      <div style={styles.logonavigation}>
        <img src="/images/LAF Logo.png" alt="Logo" style={styles.logo} />

        <div style={styles.navlink}>
          <div style={styles.navitem}>
            <IoHomeOutline size={25} color="#ffffff" />
            <p>Home</p>
          </div>

          <div style={styles.navitem}>
            <IoPersonOutline size={25} color="#ffffff" />
            <p>User</p>
          </div>

          <div style={styles.navitem}>
            <IoCubeOutline size={25} color="#ffffff" />
            <p>Post Approval</p>
          </div>

          <div style={styles.navitem}>
            <IoCheckmarkDoneCircleOutline size={25} color="#ffffff" />
            <p>Claim Request</p>
          </div>
        </div>
      </div>

      {/* ACCOUNT + DROPDOWN */}
      <div style={styles.accountWrapper} ref={dropdownRef}>
        <div 
          style={styles.account}
          onClick={() => setOpenDropdown(!openDropdown)}
        >
          <IoPersonOutline size={30} color="#ffffff" style={{ cursor: "pointer" }} />
          <p>{adminName}</p>
        </div>

        {/* DROPDOWN MENU */}
        {openDropdown && (
          <div style={styles.dropdown}>
            <p style={styles.dropdownItem} onClick={() => navigate("/admin/profile")}>
              Profile
            </p>
            <p style={styles.dropdownItem} onClick={logout}>
              Logout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    flexDirection: "column",
    width: "250px",
    backgroundColor: "#1A1851",
    justifyContent: "space-between",
    minHeight: "100vh",
    color: "#FFFFFF",
    paddingLeft: "20px",
  },
  logonavigation: {
    display: "flex",
    flexDirection: "column",
    gap: "50px",
  },
  logo: {
    width: 150,
    height: 150,
    paddingTop: "20px",
    alignSelf: "center",
  },
  navlink: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navitem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },

  /* ACCOUNT + DROPDOWN */
  accountWrapper: {
    position: "relative",
    marginBottom: "20px",
  },
  account: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "20px",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    bottom: "60px",
    left: "20px",
    backgroundColor: "#ffffff",
    color: "#000",
    width: "150px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    padding: "10px 0",
    zIndex: 999,
  },
  dropdownItem: {
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default AdminNavBar;

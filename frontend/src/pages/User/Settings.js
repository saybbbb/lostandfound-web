// ============================= 1. IMPORTS =============================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/NavigationBars/Header";
import Footer from "../../components/NavigationBars/Footer";
import { uploadToCloudinary } from "../../utils/uploadImage";
import api from "../../services/api";

// ============================= 2. COMPONENT =============================
function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profile_photo: "",
  });

  const [initials, setInitials] = useState("");

  // Load User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          profile_photo: user.profile_photo || "",
        });

        // Generate initials for avatar if no photo
        if (user.name) {
          const names = user.name.split(" ");
          const init =
            names.length > 1
              ? `${names[0][0]}${names[names.length - 1][0]}`
              : names[0][0];
          setInitials(init.toUpperCase());
        }
      } catch (err) {
        console.log("Error loading profile", err);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/auth/profile/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================= 3. RENDER =============================
  return (
    <div style={styles.wrapper}>
      <Header />

      <div style={styles.container}>
        {/* Page Title */}
        <div style={styles.headerSection}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.pageSubtitle}>
            Manage your account preferences and settings
          </p>
        </div>

        <div style={styles.contentRow}>
          {/* LEFT SIDEBAR */}
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarItemActive}>Profile</div>
            
            <div 
              style={styles.sidebarItem} 
              onClick={() => navigate("/Notifications")}
            >
              Notifications
            </div>

            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* RIGHT CONTENT (PROFILE SETTINGS) */}
          <div style={styles.mainCard}>
            <h2 style={styles.cardTitle}>Profile Settings</h2>

            {/* Photo Section */}
            <div style={styles.photoSection}>
              <div style={styles.avatarCircle}>
                {formData.profile_photo ? (
                  <img
                    src={formData.profile_photo}
                    alt="Profile"
                    style={styles.avatarImg}
                  />
                ) : (
                  <span style={styles.avatarText}>{initials}</span>
                )}
              </div>
              <input
                type="file"
                id="profile-photo-upload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setLoading(true);
                  try {
                    const url = await uploadToCloudinary(file);
                    if (url) {
                      setFormData({ ...formData, profile_photo: url });
                    }
                  } catch (err) {
                    alert("Image upload failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <button
                style={styles.changePhotoBtn}
                onClick={() =>
                  document.getElementById("profile-photo-upload").click()
                }
                disabled={loading}
              >
                {loading ? "Uploading..." : "Change Photo"}
              </button>
            </div>

            {/* Inputs */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                disabled 
              />
            </div>

            <div style={styles.footerRow}>
              <button
                style={styles.saveButton}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ============================= 4. STYLES =============================
const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    flex: 1,
    padding: "40px 10%",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  headerSection: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#0F172A",
    margin: "0 0 10px 0",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#64748B",
    margin: 0,
  },
  contentRow: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  },
  sidebarCard: {
    flex: "1 1 250px",
    maxWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  sidebarItem: {
    padding: "15px 20px",
    fontSize: "16px",
    color: "#64748B",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "0.2s",
  },
  sidebarItemActive: {
    padding: "15px 20px",
    fontSize: "16px",
    color: "white",
    backgroundColor: "#1A1851",
    borderRadius: "8px",
    fontWeight: "500",
    cursor: "default",
  },
  logoutButton: {
    marginTop: "20px",
    backgroundColor: "#F8C22E",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "120px",
  },
  mainCard: {
    flex: "3 1 600px",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "40px",
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#0F172A",
  },
  photoSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  avatarCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#F8C22E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarText: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
  },
  changePhotoBtn: {
    backgroundColor: "white",
    border: "1px solid #E2E8F0",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "#64748B",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#64748B",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "16px",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  },
  footerRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "30px",
  },
  saveButton: {
    backgroundColor: "#1A1851",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Settings;
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline, IoPersonCircleOutline } from "react-icons/io5";

function Header() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const styles = {
        header: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 80px",
            backgroundColor: "#1a1851",
        },
        logo: {
            fontWeight: "bold",
            fontSize: 24,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            color: "white",
        },
        headerLogo: {
            resizeMode: "contain",
            height: 60,
            width: 60,
            marginRight: 20,
        },
        headerIcon: {
            alignSelf: "center",
        },
        links: {
            display: "flex",
            gap: "25px",
            fontWeight: "bold",
            fontSize: 24,
            color: "white",
        },
    };

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.logo}>
          <img
            src="/images/LAF Logo.png"
            alt="Logo"
            style={styles.headerLogo}
          />
          <p>USTP LOST AND FOUND</p>
        </div>

        <div style={styles.links}>
          <p>Home</p>
          <p>Lost Items</p>
          <p>Found Items </p>
          <p>Report Item</p>
          <IoNotificationsOutline size={30} color="white" style={styles.headerIcon}/>
          <IoPersonCircleOutline size={30} color="white" style={styles.headerIcon} onClick={logout}/>
        </div>        
      </div>
    </div>
  );
}

export default Header;
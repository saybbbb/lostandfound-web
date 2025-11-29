import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline, IoNotificationsOutline, IoPersonCircleOutline,IoPersonOutline } from "react-icons/io5";

function Header() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const dashboard = () => {
        navigate("/dashboard");
    };

    const lostitem = () => {
        navigate("/lostitem");
    };

    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        navlinks:{
          fontSize:24,
          fontWeight:"bold",
          color:"white",
          cursor:"pointer",
        },
        wrapper:{
          position: "relative",
        },
        dropdown: {
          position: "absolute",
          top: "80px",      
          right: 0,         
          backgroundColor: "#ffffff",
          color: "#",
          width: "130px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          padding: "10px 20px",
          zIndex: 1,
        },
        dropdownrow: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          cursor: "pointer",
        },
        dropdownItem: {
          padding: "5px 5px",
          fontWeight: "500",
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

        <div style={styles.wrapper} ref={dropdownRef}>
          <div style={styles.links}>
            <p style={styles.navlink} onClick={dashboard}>Home</p>
            <p style={styles.navlink} onClick={lostitem}>Lost Items</p>
            <p style={styles.navlink}>Found Items </p>
            <p style={styles.navlink}>Report Item</p>
            <IoNotificationsOutline size={35} color="white" style={styles.headerIcon}/>
            <IoPersonOutline size={35} color="white" 
              style={styles.headerIcon}
              onClick={() => setOpenDropdown(!openDropdown)} />
          </div> 
          {openDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownrow}>
                <IoPersonCircleOutline size={20} color="#1a1851" style={{marginRight:"10px"}}/>
                <p style={styles.dropdownItem} onClick={() => navigate("/user/profile")}>
                  Profile
                </p>
              </div>
              <div style={styles.dropdownrow}>
                <IoLogOutOutline size={20} color="#1a1851" style={{marginRight:"10px"}}/>
                <p style={styles.dropdownItem} onClick={logout}>
                  Logout
                </p>   
              </div>
              
            </div>
          )} 
        </div> 
      </div>
    </div>
  );
}

export default Header;
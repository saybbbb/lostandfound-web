import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { IoCloseCircleOutline, IoSearchOutline,IoFileTrayFullOutline, IoAlertCircle } from "react-icons/io5";

function Dashboard() {

  // ✅ MOVE styles ABOVE return
  const styles = {
    dashboardcontainer: {
      alignItems: "center",
      padding: "20px 40px",
      margin:"0px 20px",
      minHeight: "65vh",
    },
    logOutButton:{
      padding: "10px 20px",
      cursor: "pointer",
      alignSelf:"center",
    },
    text: {
      textAlign: "center",
      color: "#64748B",
      margin:"0px 0px 40px 0px",
    },
    systemName: {
      fontSize: 50,
      fontWeight: "bold",
      color: "#0F172A",
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      gap: "10px",
      margin: "10px 0px"
    },
    buttonBlue: {
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      gap: "10px",
      padding: "20px 20px",
      backgroundColor: "#1A1851",
      color: "white",
      border: "1px solid #1a1851",
      borderRadius: "15px",
      cursor: "pointer",
      fontSize: "16px",
      shadowColor:"#000",
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation:5,
    },
    button: {
      display:"flex",
      justifyContent:"center",
      alignItems:"center",  
      gap: "10px",
      padding: "20px 20px",
      backgroundColor: "#FFFFFF",
      color: "#64748B",
      border: "1px solid #FCB315 ",
      borderRadius: "15px",
      cursor: "pointer",
      fontSize: "16px",
      shadowColor:"#000",
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation:5,
    },
    cardContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: "30px",
      margin: "10px 40px",
      padding: "0px 20px",
    },
    card: {
      backgroundColor: "#F3EDED",
      borderRadius: "15px",
      padding: "40px 20px 20px 20px",
      margin: "20px 0px 40px 40px",
      width: "30%",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    cardTitle:{
      fontWight:"bold",
      fontSize:25,
    },
    cardText:{
      fontSize:20,
      color:"#64748B",
      margin: "0px 10px",
    },
  };

  return (
    <div>

     <Header />
     
      <div style={styles.dashboardcontainer}>
        <div style={{ flex: 5 }}>
          <div style={styles.text}>
            <p style={styles.systemName}>USTP LOST AND FOUND</p>
            <p>The community platform that connects people who lost</p>
            <p>with those who have found them</p>
          </div>

          <div style={styles.buttonContainer}>
            <button style={styles.buttonBlue}>
              <IoAlertCircle size={40} color="#EF4444" />
              Report an Item
            </button>
            <button style={styles.button}>
              <IoFileTrayFullOutline size={40} color="#64748B" />
              Search Found Items</button>
          </div>

          <div style={styles.cardContainer}>
            <div style={styles.card}>
              <IoAlertCircle size={50} color="#EF4444" />
              <h5 style={styles.cardTitle}>Report Lost Items</h5>
              <p style={styles.cardText}>Quickly report your lost items with details and damages to increase your chances of finding them.</p>
            </div>
            <div style={styles.card}>
              <IoSearchOutline size={50} color="black" />
              <h5 style={styles.cardTitle}>Find Items</h5>
              <p style={styles.cardText}>Search for items by category, location, and date.</p>
            </div>
            <div style={styles.card}>
              <IoCloseCircleOutline size={50} color="black" />
              <h5 style={styles.cardTitle}>Lost Item</h5>
              <p style={styles.cardText}>Ensures that items are returned to their rightful owners.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

    </div>
  );

  
}

export default Dashboard;
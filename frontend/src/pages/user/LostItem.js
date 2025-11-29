import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function LostItem () {
  return (
    <div>
        <Header />
      <p style={styles.p}>LostItem</p>
        <Footer />
    </div>
  )
}

const styles = {
    p:{
        fontSize:30,
        fontWeight:"bold",
        marginLeft:20,
        marginTop:20,
    }
};


export default LostItem;
import React from "react";

function Footer () {

  // ✅ MOVE styles ABOVE return
  const styles = {
    footer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minheight: "10vh",
      padding: "0px 20px",
      color: "#1d1f22ff",
      borderTop: "1px solid #E5E7EB",       
    },
    footerLinks: {
      display: "flex",
      gap: "30px",
    },
  };

  return (
    <div style={styles.footer}>
      <div>
        <p>© 2025 ULAF. All rights reserved.</p>
      </div>
      <div style={styles.footerLinks}>
        <p>Privacy Policy</p>
        <p>Terms of Service</p>
        <p>Contact</p>
      </div>
    </div>
  );
}

export default Footer;
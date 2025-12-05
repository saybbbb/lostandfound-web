function Footer() {
  const currentYear = new Date().getFullYear();
  
  const styles = {
    footer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "10vh",
      padding: "0px 20px",
      color: "#1d1f22",
      borderTop: "1px solid #E5E7EB",
      backgroundColor: "#f8fafc",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
    },
    copyright: {
      opacity: 0.8,
      fontSize: "14px",
      transition: "opacity 0.2s ease",
    },
    footerLinks: {
      display: "flex",
      gap: "30px",
    },
    link: {
      position: "relative",
      cursor: "pointer",
      fontSize: "14px",
      opacity: 0.8,
      transition: "all 0.3s ease",
      padding: "8px 0",
    },
    linkHoverLine: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "0%",
      height: "2px",
      backgroundColor: "#1A1851",
      transition: "width 0.3s ease",
    }
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.querySelector('.hover-line').style.width = "100%";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.opacity = "0.8";
    e.currentTarget.querySelector('.hover-line').style.width = "0%";
  };

  return (
    <div style={styles.footer}>
      <div>
        <p style={styles.copyright}>© {currentYear} ULAF. All rights reserved.</p>
      </div>
      <div style={styles.footerLinks}>
        {["Privacy Policy", "Terms of Service", "Contact"].map((text) => (
          <div
            key={text}
            style={styles.link}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {text}
            <div className="hover-line" style={styles.linkHoverLine} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Footer;
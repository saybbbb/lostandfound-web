/* =========================
   IMPORTS
========================= */
import React from "react";

/* =========================
   COMPONENT
========================= */
function Footer() {
  const currentYear = new Date().getFullYear();

  /* =========================
     HANDLERS
  ========================= */
  const handleMouseEnter = (e) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.querySelector(".hover-line").style.width = "100%";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.opacity = "0.8";
    e.currentTarget.querySelector(".hover-line").style.width = "0%";
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div style={styles.footer}>
      <p style={styles.copyright}>
        © {currentYear} ULAF. All rights reserved.
      </p>

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

/* =========================
   STYLES
========================= */
const styles = {
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "5vh",
    padding: "0 20px",
    color: "#1d1f22",
    borderTop: "1px solid #E5E7EB",
    backgroundColor: "#f8fafc",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },

  copyright: {
    fontSize: "14px",
    opacity: 0.8,
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
    padding: "8px 0",
    transition: "all 0.3s ease",
  },

  linkHoverLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "0%",
    height: "2px",
    backgroundColor: "#1A1851",
    transition: "width 0.3s ease",
  },
};

export default Footer;

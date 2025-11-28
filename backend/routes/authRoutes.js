const express = require("express");
const router = express.Router();
const { register, login, protected } = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// =====================
// Middleware to verify JWT
// =====================
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// =====================
// Inline role check middleware
// =====================
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// =====================
// Routes
// =====================
router.post("/register", register);
router.post("/login", login);



// Protected test route
router.get("/protected", authMiddleware, protected);

// Staff routes
router.post("/staff/approve", authMiddleware, authorizeRole("staff"), staffController.approveItem);
router.post("/staff/validate-return", authMiddleware, authorizeRole("staff"), staffController.validateReturn);

// Admin routes
router.get("/admin/users", authMiddleware, authorizeRole("admin"), adminController.getUsers);





router.put("/admin/set-role/:id", authMiddleware, authorizeRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd"; // example MongoDB _id

    if (req.params.id === MAIN_ADMIN_ID) {
      return res.status(403).json({ message: "Cannot change main admin role" });
    }

    if (!["student", "staff", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await User.findByIdAndUpdate(req.params.id, { role: role.toLowerCase() });
    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

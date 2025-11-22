const express = require("express");
const router = express.Router();
const { register, login, protected } = require("../controllers/authController");
const jwt = require("jsonwebtoken");


// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Routes
router.post("/register", register);
router.post("/login", login);
router.get("/protected", authMiddleware, protected);

module.exports = router;

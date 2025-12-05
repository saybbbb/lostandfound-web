const express = require("express");
const router = express.Router();
const { register, login, protected } = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Category = require("../models/Category");
const jwt = require("jsonwebtoken");


/* ======================================================
   AUTH & ROLE MIDDLEWARE
======================================================*/

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

/* ======================================================
   AUTH ROUTES
======================================================*/

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authMiddleware, protected);

/* ======================================================
 FORGOT PASSWORD ROUTES
======================================================*/
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

/* ======================================================
   ADMIN ROUTES
======================================================*/

router.get("/admin/users", authMiddleware, authorizeRole("admin"), adminController.getUsers);

router.put("/admin/set-role/:id", authMiddleware, authorizeRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd";

    if (req.params.id === MAIN_ADMIN_ID) {
      return res.status(403).json({ message: "Cannot change main admin role" });
    }

    if (!["user", "staff", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await User.findByIdAndUpdate(req.params.id, { role: role.toLowerCase() });
    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ======================================================
  Staff Approval Controller 
======================================================*/

router.get("/staff/pending", authMiddleware, authorizeRole("staff"), staffController.getPendingPosts);

router.post("/staff/approve", authMiddleware, authorizeRole("staff"), staffController.approveItem);

router.post("/staff/reject", authMiddleware, authorizeRole("staff"), staffController.rejectItem);

router.get(
  "/staff/claims/pending",
  authMiddleware,
  authorizeRole("staff"),
  staffController.getPendingClaims
);

router.post(
  "/staff/claims/verify",
  authMiddleware,
  authorizeRole("staff"),
  staffController.verifyClaim
);

router.post(
  "/staff/claims/reject",
  authMiddleware,
  authorizeRole("staff"),
  staffController.rejectClaim
);






/* ======================================================
   LOST & FOUND API ROUTES
======================================================*/

// CREATE LOST ITEM
router.post("/lost-items", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      lost_location,
      description,
      date_lost,
      image_url,
      reported_by,
      contact_info
    } = req.body;

    const newItem = await LostItem.create({
      name,
      category,
      lost_location,
      description,
      date_lost,
      image_url,
      reported_by,
      contact_info,
      approval_status: "pending"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL LOST ITEMS
router.get("/lost-items", async (req, res) => {
  try {
    const items = await LostItem.find({ approval_status: "approved" })
      .populate("category", "name")
      .populate("reported_by", "name email");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ALL FOUND ITEMS
router.get("/found-items", async (req, res) => {
  try {
    const items = await FoundItem.find({ approval_status: "approved" })
      .populate("category", "name")
      .populate("posted_by", "name email");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/found-items/:id", async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate("category", "name")
      .populate("posted_by", "name email");

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// GET ALL CATEGORIES
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// CREATE FOUND ITEM
router.post("/found-items", async (req, res) => {
  try {
    const {
      name,
      category,
      found_location,
      description,
      date_found,
      image_url,
      posted_by,
      contact_info
    } = req.body;

    const newItem = await FoundItem.create({
      name,
      category,
      found_location,
      description,
      date_found,
      image_url,
      posted_by,
      contact_info,
      approval_status: "pending"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================
   USER CLAIMS FOUND ITEM
============================= */


router.post(
  "/claims",
  authMiddleware,
  async (req, res) => {
    try {
      const { found_item, proof_description } = req.body;

      const item = await FoundItem.findById(found_item);

      if (!item)
        return res.status(404).json({ message: "Item not found" });

      if (item.approval_status !== "approved") {
        return res.json({
          success: false,
          message: "Item is waiting for staff approval"
        });
      }

      if (item.claim_status === "claimed") {
        return res.json({
          success: false,
          message: "Item already claimed"
        });
      }

      // 🔥 SAVE CLAIM DETAILS (What you were missing)
      item.claim_status = "claimed";
      item.claimed_by = req.user.id;
      item.claimed_at = new Date();
      item.proof_description = proof_description;
      item.verified_claim = false; // IMPORTANT for staff filter

      await item.save();

      res.json({
        success: true,
        message: "Item successfully claimed"
      });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);




module.exports = router;

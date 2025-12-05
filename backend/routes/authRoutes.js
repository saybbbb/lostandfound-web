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

router.get(
  "/admin/users",
  authMiddleware,
  authorizeRole("admin"),
  adminController.getUsers
);

router.put(
  "/admin/set-role/:id",
  authMiddleware,
  authorizeRole("admin"),
  async (req, res) => {
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
  }
);

/* ======================================================
   STAFF APPROVAL ROUTES
======================================================*/

router.get(
  "/staff/pending",
  authMiddleware,
  authorizeRole("staff"),
  staffController.getPendingPosts
);

router.post(
  "/staff/approve",
  authMiddleware,
  authorizeRole("staff"),
  staffController.approveItem
);

router.post(
  "/staff/reject",
  authMiddleware,
  authorizeRole("staff"),
  staffController.rejectItem
);

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
   CATEGORY ROUTES
======================================================*/

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ======================================================
   LOST ITEM ROUTES
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
      reported_by: req.user.id,
      contact_info,
      approval_status: "pending"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL APPROVED LOST ITEMS
router.get("/lost-items", async (req, res) => {
  try {
    const foundReports = await FoundItem.find().select("lost_item_id");
    const foundIDs = foundReports.map(f => f.lost_item_id);
    const items = await LostItem.find({ approval_status: "approved", _id: { $nin: foundIDs  }})
      .populate("category", "name")
      .populate("reported_by", "name email");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/lost-items/my", authMiddleware, async (req, res) => {
  try {
    const items = await LostItem.find({ reported_by: req.user.id })
      .populate("category", "name");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/lost-items-with-status", async (req, res) => {
  try {
    const lost = await LostItem.find()
      .populate("category", "name")
      .populate("reported_by", "name email");

    const foundReports = await FoundItem.find()
      .select("lost_item_id approval_status");

    res.json({
      success: true,
      lost,
      foundReports
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✅ FIXED: GET SINGLE LOST ITEM — correct placement
router.get("/lost-items/:id", async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate("category", "name")
      .populate("reported_by", "name email");

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================================================
   FOUND ITEM ROUTES
======================================================*/

// GET ALL APPROVED & UNCLAIMED FOUND ITEMS
router.get("/found-items", async (req, res) => {
  try {
    const items = await FoundItem.find({
      approval_status: "approved",
      verified_claim: false
    })
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

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/found-reports/all", async (req, res) => {
  try {
    const reports = await FoundItem.find()  // <-- return ALL found reports (approved + pending)
      .select("lost_item_id approval_status");

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// CREATE FOUND ITEM
router.post("/found-items", authMiddleware, async (req, res) => {
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
      posted_by: req.user.id,
      contact_info,
      approval_status: "pending"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// REPORT FOUND FROM LOST ITEM
router.post("/lost-items/report-found", authMiddleware, async (req, res) => {
  try {
    const {
      lost_item_id,
      found_location,
      description,
      date_found,
      image_url,
      contact_info
    } = req.body;

    const lostItem = await LostItem.findById(lost_item_id);
    if (!lostItem)
      return res.status(404).json({ success: false, message: "Lost item not found" });

    const foundItem = await FoundItem.create({
      lost_item_id: lost_item_id,
      name: lostItem.name,
      category: lostItem.category,
      found_location,
      description,
      date_found,
      image_url,
      posted_by: req.user.id,
      contact_info,
      approval_status: "pending",
    });

    res.json({ success: true, item: foundItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================================================
   USER CLAIM FOUND ITEM
======================================================*/

router.post("/claims", authMiddleware, async (req, res) => {
  try {
    const { found_item, proof_description } = req.body;

    const item = await FoundItem.findById(found_item);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Prevent double claiming
    if (item.claim_status === "claimed") {
      return res.json({ success: false, message: "Item already claimed" });
    }

    // Create the claim
    item.claim_status = "claimed";
    item.claimed_by = req.user.id;
    item.claimed_at = new Date();
    item.proof_description = proof_description;
    item.verified_claim = false;  // pending staff decision

    await item.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Item successfully claimed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

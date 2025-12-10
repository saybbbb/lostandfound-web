const express = require("express");
const router = express.Router();

const { register, login, protected } = require("../controllers/authController");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  getUserNotifications,
  markAllAsRead,
} = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");

const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Category = require("../models/Category");
const Notification = require("../models/Notification");

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

// Register a new user
router.post("/register", register);

// Login user and get token
router.post("/login", login);

// Get current user information
router.get("/protected", authMiddleware, protected);

// Update user profile information
router.put("/profile/update", authMiddleware, async (req, res) => {
  try {
    const { name, phone, profile_photo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profile_photo },
      { new: true }
    );

    res.json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ======================================================
   FORGOT PASSWORD ROUTES
======================================================*/

// Initiate password reset email
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password/:token", resetPassword);

/* ======================================================
   ADMIN ROUTES
======================================================*/

// Get list of all users
router.get(
  "/admin/users",
  authMiddleware,
  authorizeRole("admin"),
  adminController.getUsers
);

// Get admin dashboard statistics
router.get(
  "/admin/dashboard",
  authMiddleware,
  authorizeRole("admin"),
  adminController.getDashboardStats
);

// Get system activity logs
router.get(
  "/admin/activity-logs",
  authMiddleware,
  authorizeRole("admin"),
  adminController.getActivityLogs
);

// Update a user's role
router.put(
  "/admin/set-role/:id",
  authMiddleware,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd";

      if (req.params.id === MAIN_ADMIN_ID) {
        return res
          .status(403)
          .json({ message: "Cannot change main admin role" });
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

// Delete a user account
router.delete(
  "/admin/delete/:id",
  authMiddleware,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd";
      if (userId === MAIN_ADMIN_ID) {
        return res.status(403).json({ message: "Cannot delete main admin" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await User.findByIdAndDelete(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ======================================================
   STAFF ROUTES
======================================================*/

// Get pending posts
router.get(
  "/staff/pending",
  authMiddleware,
  authorizeRole("staff"),
  staffController.getPendingPosts
);

// Approve an item
router.post(
  "/staff/approve",
  authMiddleware,
  authorizeRole("staff"),
  staffController.approveItem
);

// Reject an item
router.post(
  "/staff/reject",
  authMiddleware,
  authorizeRole("staff"),
  staffController.rejectItem
);

// Get pending claims
router.get(
  "/staff/claims/pending",
  authMiddleware,
  authorizeRole("staff"),
  staffController.getPendingClaims
);

// Verify a claim
router.post(
  "/staff/claims/verify",
  authMiddleware,
  authorizeRole("staff"),
  staffController.verifyClaim
);

// Reject a claim
router.post(
  "/staff/claims/reject",
  authMiddleware,
  authorizeRole("staff"),
  staffController.rejectClaim
);

/* ======================================================
   CATEGORY ROUTES
======================================================*/

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ======================================================
   LOST ITEMS ROUTES
======================================================*/

// Create a new lost item report
router.post("/lost-items", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      lost_location,
      description,
      date_lost,
      image_url,
      contact_info,
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
      approval_status: "pending",
    });

    await Notification.create({
        user_id: req.user.id,
        message: `You reported a lost "${name}". It is currently pending approval.`,
        type: "report_submitted"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all approved lost items
router.get("/lost-items", async (req, res) => {
  try {
    const foundReports = await FoundItem.find().select("lost_item_id");
    const foundIDs = foundReports.map((f) => f.lost_item_id);
    const items = await LostItem.find({
      approval_status: "approved",
      _id: { $nin: foundIDs },
    })
      .populate("category", "name")
      .populate("reported_by", "name email");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get lost items reported by current user
router.get("/lost-items/my", authMiddleware, async (req, res) => {
  try {
    const items = await LostItem.find({ reported_by: req.user.id }).populate(
      "category",
      "name"
    );
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get lost items with status
router.get("/lost-items-with-status", async (req, res) => {
  try {
    const lost = await LostItem.find({ approval_status: "approved" })
      .populate("category", "name")
      .populate("reported_by", "name email");

    const foundReports = await FoundItem.find().select(
      "lost_item_id approval_status"
    );

    res.json({
      success: true,
      lost,
      foundReports,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single lost item
router.get("/lost-items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate("category", "name")
      .populate("reported_by", "name email");

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const isOwner = item.reported_by._id.toString() === req.user.id;
    const isStaffOrAdmin =
      req.user.role === "staff" || req.user.role === "admin";

    if (item.approval_status !== "approved" && !isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete lost item
router.delete("/lost-items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    if (item.reported_by.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied: You are not the owner of this item.",
        });
    }

    await LostItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Lost item report cancelled successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================================================
   FOUND ITEM ROUTES
======================================================*/

// Get all approved found items
router.get("/found-items", async (req, res) => {
  try {
    const items = await FoundItem.find({
      approval_status: "approved",
      verified_claim: false,
    })
      .populate("category", "name")
      .populate("posted_by", "name email");

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get single found item
router.get("/found-items/:id", async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate("category", "name")
      .populate("posted_by", "name email");

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all found reports
router.get("/found-reports/all", async (req, res) => {
  try {
    const reports = await FoundItem.find()
      .select("lost_item_id approval_status");

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create found item report
router.post("/found-items", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      found_location,
      description,
      date_found,
      image_url,
      contact_info,
    } = req.body;

    const newItem = await FoundItem.create({
      name,
      category,
      found_location,
      description,
      date_found,
      image_url,
      contact_info,
      posted_by: req.user.id,
      approval_status: "pending",
    });

    await Notification.create({
        user_id: req.user.id,
        message: `Please bring the found "${name}" in the Lost and Found office, thank you.`,
        type: "system"
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Report found from lost item
router.post("/lost-items/report-found", authMiddleware, async (req, res) => {
  try {
    const {
      lost_item_id,
      found_location,
      description,
      date_found,
      image_url,
      contact_info,
    } = req.body;

    const lostItem = await LostItem.findById(lost_item_id);
    if (!lostItem)
      return res
        .status(404)
        .json({ success: false, message: "Lost item not found" });

    if (lostItem.reported_by.toString() === req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot report your own lost item as found.",
        });
    }

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

    await Notification.create({
        user_id: req.user.id,
        message: `Please bring the found "${lostItem.name}" in the Lost and Found office, thank you.`,
        type: "system"
    });

    res.json({ success: true, item: foundItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================================================
   CLAIM ROUTES
======================================================*/

// Submit a claim
router.post("/claims", authMiddleware, async (req, res) => {
  try {
    // FIX: Added claim_proof_image destructuring
    const { found_item, proof_description, claim_proof_image } = req.body;

    const item = await FoundItem.findById(found_item).populate("posted_by");
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    if (item.posted_by._id.toString() === req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot claim an item you reported.",
        });
    }

    if (item.claim_status === "claimed") {
      return res.json({ success: false, message: "Item already claimed" });
    }

    item.claim_status = "claimed";
    item.claimed_by = req.user.id;
    item.claimed_at = new Date();
    item.proof_description = proof_description;
    item.claim_proof_image = claim_proof_image || null; // <--- Save image here
    item.verified_claim = false;

    await item.save({ validateBeforeSave: false });

    await Notification.create({
        user_id: req.user.id,
        message: `Please come to the Lost and Found office for verification of "${item.name}", thank you.`,
        type: "system"
    });

    if (item.posted_by) {
        await Notification.create({
            user_id: item.posted_by._id, 
            message: `${req.user.name || "Someone"} has claimed the "${item.name}". Staff are reviewing it.`,
            type: "claim_request"
        });
    }

    res.json({ success: true, message: "Item successfully claimed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================================================
   NOTIFICATION ROUTES
======================================================*/

// Get notifications
router.get("/notifications", authMiddleware, getUserNotifications);

// Read all notifications
router.put("/notifications/read-all", authMiddleware, markAllAsRead);

module.exports = router;
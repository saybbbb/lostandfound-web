const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const ClaimItem = require("../models/ClaimItem");
const ActivityLog = require("../models/ActivityLog");
const logActivity = require("../utils/activityLogger");

// =========================================
// GET ALL USERS (ADMIN ONLY)
// =========================================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================================
// ADMIN DASHBOARD SUMMARY
// =========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [lost, found, claimed, pendingToday, verifiedToday, users] =
      await Promise.all([
        LostItem.countDocuments(),
        FoundItem.countDocuments(),
        ClaimItem.countDocuments(),
        FoundItem.countDocuments({
          approval_status: "pending",
          createdAt: { $gte: todayStart },
        }),
        FoundItem.countDocuments({
          verified_claim: true,
          verified_at: { $gte: todayStart },
        }),
        User.find({}, "role"),
      ]);

    const roles = users.map((u) => (u.role || "").toLowerCase());

    const totalStudents = roles.filter((r) => r === "user").length;
    const totalStaff = roles.filter((r) => r === "staff").length;
    const totalAdmin = roles.filter((r) => r === "admin").length;

    res.json({
      success: true,
      lost,
      found,
      claimed,
      pendingToday,
      verifiedToday,
      totalStudents,
      totalStaff,
      totalAdmin,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =========================================
// UPDATE USER ROLE (MOVED FROM ROUTES)
// =========================================
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // 1. Prevent changing Main Admin
    const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd"; 
    if (userId === MAIN_ADMIN_ID) {
      return res.status(403).json({ message: "Cannot change main admin role" });
    }

    // 2. Validate Role
    if (!["user", "staff", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 3. Find User (Need name for logging)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const previousRole = user.role; // Capture old role for details

    // 4. Update Role
    user.role = role.toLowerCase();
    await user.save();

    // 5. LOG ACTIVITY
    await logActivity(
      user.name,                        // Name: The User being changed (e.g., "Ggll")
      "Role Change",                    // Activity
      `Changed from ${previousRole} to ${role}`, // Details
      req.user.name,                    // Verifier: The Admin doing the change
      "Changed"                         // Result
    );

    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    console.error("ROLE UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================================
// DELETE USER (MOVED FROM ROUTES)
// =========================================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Prevent deleting Main Admin
    const MAIN_ADMIN_ID = "64f5e9b8c1234567890abcd";
    if (userId === MAIN_ADMIN_ID) {
      return res.status(403).json({ message: "Cannot delete main admin" });
    }

    // 2. Find User (Need name for logging)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Delete User
    await User.findByIdAndDelete(userId);

    // 4. LOG ACTIVITY
    await logActivity(
      user.name,                        // Name: The User who was deleted
      "User Deletion",                  // Activity
      "Account deleted by Admin",       // Details
      req.user.name,                    // Verifier: The Admin
      "Deleted"                         // Result
    );

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =========================================
// ADMIN ACTIVITY LOGS
// =========================================
exports.getActivityLogs = async (req, res) => {
  try {
    // Simply fetch the logs. MongoDB handles the 15-min deletion automatically.
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading logs" });
  }
};

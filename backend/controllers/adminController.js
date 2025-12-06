const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const ClaimItem = require("../models/ClaimItem");

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
// ADMIN ACTIVITY LOGS
// =========================================
exports.getActivityLogs = async (req, res) => {
  try {
    const lost = await LostItem.find()
      .populate("reported_by")
      .populate("reviewed_by");

    const found = await FoundItem.find()
      .populate("posted_by")
      .populate("reviewed_by")
      .populate("verified_by");

    const claims = await ClaimItem.find()
      .populate("claimant")
      .populate("reviewed_by");

    const logs = [];

    // LOST
    lost.forEach((item) =>
      logs.push({
        type: "lost",
        timestamp: item.createdAt,
        name: item.name,
        activity: "Lost",
        verifier: item.reviewed_by ? item.reviewed_by.name : "None",
        result: item.approval_status,
        action: "Posted",
      })
    );

    // FOUND
    found.forEach((item) =>
      logs.push({
        type: "found",
        timestamp: item.createdAt,
        name: item.name,
        activity: "Found",
        verifier: item.reviewed_by ? item.reviewed_by.name : "None",
        result: item.approval_status,
        action: "Posted",
      })
    );

    // CLAIMS
    claims.forEach((item) =>
      logs.push({
        type: "claim",
        timestamp: item.date_claimed,
        name: item.claimant?.name,
        activity: "Claimed",
        verifier: item.reviewed_by ? item.reviewed_by.name : "None",
        result: item.claim_status,
        action: "Claimed",
      })
    );

    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ logs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading logs" });
  }
};

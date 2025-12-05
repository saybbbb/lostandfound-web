const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Notification = require("../models/Notification");


// GET all pending posts (lost & found)
exports.getPendingPosts = async (req, res) => {
  try {
    const lost = await LostItem.find({ approval_status: "pending" })
      .populate("reported_by", "name email");

    const found = await FoundItem.find({ approval_status: "pending" })
      .populate("posted_by", "name email");

    res.json({ success: true, lost, found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// APPROVE item
exports.approveItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;  // type: "lost" or "found"

    const Model = type === "lost" ? LostItem : FoundItem;

    const item = await Model.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.approval_status = "approved";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save();

    res.json({ success: true, message: "Item approved" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// REJECT item WITH REASON
exports.rejectItem = async (req, res) => {
  try {
    const { itemId, type, reason } = req.body;

    const Model = type === "lost" ? LostItem : FoundItem;
    const item = await Model.findById(itemId);

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.approval_status = "rejected";
    item.rejection_reason = reason;
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();
    await item.save();

    await Notification.create({
    user_id: item.reported_by || item.posted_by,
    message: `Your ${type} item post was rejected. Reason: ${reason}`,
    type: "status_update"
  });

    res.json({ success: true, message: "Item rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET ALL PENDING CLAIMS
exports.getPendingClaims = async (req, res) => {
  try {
    const claims = await FoundItem.find({
      claim_status: "claimed",
      // Only show claims not yet verified by staff
      verified_claim: { $ne: true }
    })
    .populate("claimed_by", "name email")
    .populate("posted_by", "name email");

    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// STAFF APPROVES CLAIM
exports.verifyClaim = async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await FoundItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Must already be claimed
    if (item.claim_status !== "claimed") {
      return res.status(400).json({ message: "Item has no active claim" });
    }

    // Mark claim as verified
    item.verified_claim = true;
    item.verified_by = req.user.id;
    item.verified_at = new Date();

    // OPTIONAL: mark item as returned
    item.status = "returned";

    await item.save();

    res.json({ success: true, message: "Claim verified successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// STAFF REJECTS CLAIM
exports.rejectClaim = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    const item = await FoundItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.claim_status !== "claimed") {
      return res.status(400).json({ message: "No active claim to reject" });
    }

    // Reset claim
    item.claim_status = "none";
    item.claimed_by = null;
    item.claimed_at = null;
    item.proof_description = null;
    item.verified_claim = false;

    // Save rejection metadata
    item.claim_rejection_reason = reason;
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save();

    res.json({ success: true, message: "Claim rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





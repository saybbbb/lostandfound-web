const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const ClaimItem = require("../models/ClaimItem");
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



exports.approveItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;

    const Model = type === "lost" ? LostItem : FoundItem;
    const item = await Model.findById(itemId);

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // APPROVE
    item.approval_status = "approved";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();
    item.rejection_reason = null;

    await item.save({ validateBeforeSave: false }); // ← IMPORTANT FIX

    res.json({ success: true, message: "Item approved" });
  } catch (err) {
    console.log("APPROVAL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.rejectItem = async (req, res) => {
  try {
    const { itemId, type, reason } = req.body;

    const Model = type === "lost" ? LostItem : FoundItem;
    const item = await Model.findById(itemId);

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.approval_status = "rejected";
    item.rejection_reason = reason || "No reason provided";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save({ validateBeforeSave: false }); // ← IMPORTANT FIX

    res.json({ success: true, message: "Item rejected" });
  } catch (err) {
    console.log("REJECTION ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET ALL PENDING CLAIMS
exports.getPendingClaims = async (req, res) => {
  try {
    const claims = await FoundItem.find({
      claim_status: "claimed",
      verified_claim: false
    })
    .populate("claimed_by", "name email")
    .populate("posted_by", "name email");

    res.json({ success: true, claims });
  } catch (err) {
    console.log("GET PENDING CLAIMS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STAFF APPROVES CLAIM
exports.verifyClaim = async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await FoundItem.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Must already be claimed
    if (item.claim_status !== "claimed") {
      return res.status(400).json({ success: false, message: "Item has no active claim" });
    }

    // Approve claim
    item.verified_claim = true;
    item.verified_by = req.user.id;
    item.verified_at = new Date();
    item.status = "returned"; // Optional but consistent with your earlier logic

    await item.save({ validateBeforeSave: false });

    // Create a new ClaimItem
    await ClaimItem.create({
      lost_item: item.lost_item_id,
      found_item: item._id,
      claimant: item.claimed_by,
      reviewed_by: req.user.id,
      proof_description: item.proof_description,
      claim_status: "approved",
      date_reviewed: new Date(),
    });

    // Delete the FoundItem
    await FoundItem.findByIdAndDelete(itemId);

    // If there was a matching LostItem, delete it as well
    if (item.lost_item_id) {
      await LostItem.findByIdAndDelete(item.lost_item_id);
    }

    // Send notification
    try {
      await Notification.create({
        user_id: item.claimed_by,
        message: `Your claim for "${item.name}" was approved.`,
        type: "claim_update",
      });
    } catch (notifyErr) {
      console.log("Notify error:", notifyErr);
    }

    res.json({ success: true, message: "Claim verified successfully" });

  } catch (err) {
    console.log("VERIFY CLAIM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// STAFF REJECTS CLAIM
exports.rejectClaim = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    const item = await FoundItem.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Must be an active claim
    if (item.claim_status !== "claimed") {
      return res.status(400).json({ success: false, message: "No active claim to reject" });
    }

    // Reset claim fields
    const claimantId = item.claimed_by; // Save before clearing

    item.claim_status = "none";
    item.claimed_by = null;
    item.claimed_at = null;
    item.proof_description = null;
    item.verified_claim = false;

    // Save review data
    item.claim_rejection_reason = reason || "Claim rejected";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save({ validateBeforeSave: false });

    // Send notification
    try {
      await Notification.create({
        user_id: claimantId,
        message: `Your claim for "${item.name}" was rejected. Reason: ${reason}`,
        type: "claim_update",
      });
    } catch (notifyErr) {
      console.log("Notify error:", notifyErr);
    }

    res.json({ success: true, message: "Claim rejected successfully" });

  } catch (err) {
    console.log("REJECT CLAIM ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const ClaimItem = require("../models/ClaimItem");
const Notification = require("../models/Notification");
const logActivity = require("../utils/activityLogger"); // <--- Import Logger

// GET all pending posts (lost & found)
exports.getPendingPosts = async (req, res) => {
  try {
    const lost = await LostItem.find({ approval_status: "pending" })
      .populate("reported_by", "name email")
      .populate("category", "name");

    const found = await FoundItem.find({ approval_status: "pending" })
      .populate("posted_by", "name email")
      .populate("category", "name");

    res.json({ success: true, lost, found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE ITEM
exports.approveItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;

    const Model = type === "lost" ? LostItem : FoundItem;
    // Populate owner so we can log their name
    const item = await Model.findById(itemId).populate(type === "lost" ? "reported_by" : "posted_by");

    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // APPROVE
    item.approval_status = "approved";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();
    item.rejection_reason = null;

    await item.save({ validateBeforeSave: false }); 

    // --- ACTIVITY LOGGING ---
    const ownerName = type === "lost" ? item.reported_by?.name : item.posted_by?.name;
    
    await logActivity(
      ownerName || "Unknown User", // Name (The User)
      "Verification",              // Activity
      item.name,                   // Details (Item Name)
      req.user.name,               // Verifier (The Staff)
      "Verified"                   // Result
    );
    // ------------------------

    // 🔔 1. NOTIFICATION: Report Verified
    if (type === "found") {
        // Specific message for Finder of a Found Item (Office Workflow)
        await Notification.create({
            user_id: item.posted_by._id, 
            message: `Thank you for reporting the found item, rest assure we will give it to the owner.`,
            type: "status_update"
        });
    } else {
        // Standard message for Lost Item report approval
        await Notification.create({
            user_id: item.reported_by._id,
            message: `Your lost item report for "${item.name}" has been verified and published.`,
            type: "status_update"
        });
    }

    await Notification.create({
        user_id: ownerId,
        message: `Your ${type} item report for "${item.name}" has been verified and published.`,
        type: "report_verified"
    });

    // 🔔 2. AUTOMATIC MATCHING LOGIC
    if (type === "lost") {
        const potentialMatches = await FoundItem.find({
            category: item.category, // Same category
            approval_status: "approved", // Must be public
            claim_status: "none" // Not yet taken
        });

        if (potentialMatches.length > 0) {
            await Notification.create({
                user_id: item.reported_by._id,
                message: `Potential Match Found: Someone found an item matching your lost "${item.name}".`,
                type: "match"
            });
        }
    }

    if (type === "found") {
        const matchingLostItems = await LostItem.find({
            category: item.category,
            approval_status: "approved",
            status: "open"
        });

        for (const lostItem of matchingLostItems) {
            await Notification.create({
                user_id: lostItem.reported_by,
                message: `Potential Match Found: An item matching your lost "${lostItem.name}" was just reported found.`,
                type: "match"
            });
        }
    }

    res.json({ success: true, message: "Item approved" });
  } catch (err) {
    console.log("APPROVAL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// REJECT ITEM
exports.rejectItem = async (req, res) => {
  try {
    const { itemId, type, reason } = req.body;

    const Model = type === "lost" ? LostItem : FoundItem;
    // Populate owner
    const item = await Model.findById(itemId).populate(type === "lost" ? "reported_by" : "posted_by");

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.approval_status = "rejected";
    item.rejection_reason = reason || "No reason provided";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save({ validateBeforeSave: false }); 

    // Notify user of rejection
    const userId = type === "lost" ? item.reported_by : item.posted_by;
    await Notification.create({
      user_id: userId,
      message: `Your report for "${item.name}" was rejected. Reason: ${reason}`,
      type: "status_update"
    });

    // --- ACTIVITY LOGGING ---
    const ownerName = type === "lost" ? item.reported_by?.name : item.posted_by?.name;

    await logActivity(
      ownerName || "Unknown User",
      "Verification",
      item.name,
      req.user.name, // Staff Verifier
      "Rejected"
    );
    // ------------------------

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
    .populate("posted_by", "name email")
    .populate("category", "name"); // <--- ADDED THIS

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

    // Populate claimed_by so we can log the name
    const item = await FoundItem.findById(itemId).populate("claimed_by");
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Must already be claimed
    if (item.claim_status !== "claimed") {
      return res.status(400).json({ success: false, message: "Item has no active claim" });
    }

    // Approve claim
    item.verified_claim = true;
    item.verified_by = req.user.id;
    item.verified_at = new Date();
    item.status = "returned"; 

    await item.save({ validateBeforeSave: false });

    // Create a new ClaimItem
    await ClaimItem.create({
      lost_item: item.lost_item_id,
      found_item: item._id,
      claimant: item.claimed_by._id, // Use ID for reference
      reviewed_by: req.user.id,
      proof_description: item.proof_description,
      claim_proof_image: item.claim_proof_image,
      claim_status: "approved",
      date_reviewed: new Date(),
    });

    // Delete the FoundItem
    await FoundItem.findByIdAndDelete(itemId);

    // If there was a matching LostItem, delete it as well
    if (item.lost_item_id) {
      await LostItem.findByIdAndDelete(item.lost_item_id);
    }

    // --- ACTIVITY LOGGING ---
    await logActivity(
      item.claimed_by?.name || "Unknown Claimant", // Name
      "Claim Verification",                        // Activity
      item.name,                                   // Details
      req.user.name,                               // Verifier (Staff)
      "Verified"                                   // Result
    );
    // ------------------------

    // Send notification
    try {
      await Notification.create({
        user_id: item.claimed_by._id,
        message: `Your claim for "${item.name}" was approved and verified. The item has been returned.`,
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

    // Populate claimed_by so we can log the name
    const item = await FoundItem.findById(itemId).populate("claimed_by");
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Must be an active claim
    if (item.claim_status !== "claimed") {
      return res.status(400).json({ success: false, message: "No active claim to reject" });
    }

    // Save claimant details before resetting
    const claimantId = item.claimed_by._id;
    const claimantName = item.claimed_by?.name; 

    // Reset claim fields
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

    // --- ACTIVITY LOGGING ---
    await logActivity(
      claimantName || "Unknown Claimant",
      "Claim Verification",
      item.name,
      req.user.name, // Staff Verifier
      "Rejected"
    );
    // ------------------------

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
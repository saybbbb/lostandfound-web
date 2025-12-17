const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const ClaimItem = require("../models/ClaimItem");
const Notification = require("../models/Notification");
const logActivity = require("../utils/activityLogger");

/* -------------------------------------------------------------------------- */
/* GET ALL PENDING POSTS */
/* -------------------------------------------------------------------------- */
exports.getPendingPosts = async (req, res) => {
  try {
    const [lost, found] = await Promise.all([
      LostItem.find({ approval_status: "pending" })
        .populate("reported_by", "name email")
        .populate("category", "name"),
      FoundItem.find({ approval_status: "pending" })
        .populate("posted_by", "name email")
        .populate("category", "name"),
    ]);

    return res.json({ success: true, lost, found });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* APPROVE ITEM */
/* -------------------------------------------------------------------------- */
exports.approveItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const Model = type === "lost" ? LostItem : FoundItem;

    const item = await Model.findById(itemId).populate(
      type === "lost" ? "reported_by" : "posted_by"
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    item.approval_status = "approved";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();
    item.rejection_reason = null;

    await item.save({ validateBeforeSave: false });

    const owner = type === "lost" ? item.reported_by : item.posted_by;
    const ownerName = owner?.name || "Unknown User";

    // Respond immediately
    res.status(200).json({ success: true, message: "Item approved" });

    // ---- SIDE EFFECTS (NON-BLOCKING) ----
    logActivity(
      ownerName,
      "Verification",
      item.name,
      req.user.name,
      "Verified"
    ).catch(console.error);

    Notification.create({
      user_id: owner._id,
      message:
        type === "found"
          ? "Thank you for reporting the found item. We will return it to the owner."
          : `Your lost item report for "${item.name}" has been verified and published.`,
      type: "status_update",
    }).catch(console.error);

    // Matching logic
    if (type === "lost") {
      FoundItem.find({
        category: item.category,
        approval_status: "approved",
        claim_status: "none",
      })
        .then((matches) => {
          if (matches.length) {
            return Notification.create({
              user_id: owner._id,
              message: `Potential Match Found for your lost "${item.name}".`,
              type: "match",
            });
          }
        })
        .catch(console.error);
    } else {
      LostItem.find({
        category: item.category,
        approval_status: "approved",
        status: "open",
      })
        .then((lostItems) =>
          Promise.all(
            lostItems.map((lost) =>
              Notification.create({
                user_id: lost.reported_by,
                message: `Potential Match Found for your lost "${lost.name}".`,
                type: "match",
              })
            )
          )
        )
        .catch(console.error);
    }
  } catch (err) {
    console.error("APPROVAL ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* REJECT ITEM */
/* -------------------------------------------------------------------------- */
exports.rejectItem = async (req, res) => {
  try {
    const { itemId, type, reason } = req.body;
    const Model = type === "lost" ? LostItem : FoundItem;

    const item = await Model.findById(itemId).populate(
      type === "lost" ? "reported_by" : "posted_by"
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    item.approval_status = "rejected";
    item.rejection_reason = reason || "No reason provided";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save({ validateBeforeSave: false });

    const owner = type === "lost" ? item.reported_by : item.posted_by;

    res.status(200).json({ success: true, message: "Item rejected" });

    logActivity(
      owner?.name || "Unknown User",
      "Verification",
      item.name,
      req.user.name,
      "Rejected"
    ).catch(console.error);

    Notification.create({
      user_id: owner._id,
      message: `Your report for "${item.name}" was rejected. Reason: ${reason}`,
      type: "status_update",
    }).catch(console.error);
  } catch (err) {
    console.error("REJECTION ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* GET ALL PENDING CLAIMS */
/* -------------------------------------------------------------------------- */
exports.getPendingClaims = async (req, res) => {
  try {
    const claims = await FoundItem.find({
      claim_status: "claimed",
      verified_claim: false,
    })
      .populate("claimed_by", "name email")
      .populate("posted_by", "name email")
      .populate("category", "name");

    return res.json({ success: true, claims });
  } catch (err) {
    console.error("GET PENDING CLAIMS ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* VERIFY CLAIM */
/* -------------------------------------------------------------------------- */
exports.verifyClaim = async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = await FoundItem.findById(itemId).populate("claimed_by");
    if (!item || item.claim_status !== "claimed") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or inactive claim" });
    }

    item.verified_claim = true;
    item.verified_by = req.user.id;
    item.verified_at = new Date();
    item.status = "returned";

    await item.save({ validateBeforeSave: false });

    await ClaimItem.create({
      lost_item: item.lost_item_id,
      found_item: item._id,
      claimant: item.claimed_by._id,
      reviewed_by: req.user.id,
      proof_description: item.proof_description,
      claim_proof_image: item.claim_proof_image,
      claim_status: "approved",
      date_reviewed: new Date(),
    });

    await FoundItem.findByIdAndDelete(itemId);
    if (item.lost_item_id) {
      await LostItem.findByIdAndDelete(item.lost_item_id);
    }

    res
      .status(200)
      .json({ success: true, message: "Claim verified successfully" });

    logActivity(
      item.claimed_by?.name || "Unknown Claimant",
      "Claim Verification",
      item.name,
      req.user.name,
      "Verified"
    ).catch(console.error);

    Notification.create({
      user_id: item.claimed_by._id,
      message: `Your claim for "${item.name}" was approved and verified.`,
      type: "claim_update",
    }).catch(console.error);
  } catch (err) {
    console.error("VERIFY CLAIM ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* REJECT CLAIM */
/* -------------------------------------------------------------------------- */
exports.rejectClaim = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    const item = await FoundItem.findById(itemId).populate("claimed_by");
    if (!item || item.claim_status !== "claimed") {
      return res
        .status(400)
        .json({ success: false, message: "No active claim to reject" });
    }

    const claimant = item.claimed_by;

    item.claim_status = "none";
    item.claimed_by = null;
    item.claimed_at = null;
    item.proof_description = null;
    item.verified_claim = false;
    item.claim_rejection_reason = reason || "Claim rejected";
    item.reviewed_by = req.user.id;
    item.reviewed_at = new Date();

    await item.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ success: true, message: "Claim rejected successfully" });

    logActivity(
      claimant?.name || "Unknown Claimant",
      "Claim Verification",
      item.name,
      req.user.name,
      "Rejected"
    ).catch(console.error);

    Notification.create({
      user_id: claimant._id,
      message: `Your claim for "${item.name}" was rejected. Reason: ${reason}`,
      type: "claim_update",
    }).catch(console.error);
  } catch (err) {
    console.error("REJECT CLAIM ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

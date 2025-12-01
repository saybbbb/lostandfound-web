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
      user: item.reported_by || item.posted_by,
      message: `Your ${type} item post was rejected. Reason: ${reason}`,
      type: "status_update"
    });

    res.json({ success: true, message: "Item rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

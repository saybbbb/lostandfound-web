const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Actor (User/Staff/Admin)
  activity: { type: String, required: true }, // e.g., "Post", "Role Change"
  details: { type: String, default: "N/A" }, // Item Name or Previous Role
  verifier: { type: String, default: "System" }, // Who approved it or "Self"
  result: { type: String, required: true }, // "Verified", "posted", "Changed"
  timestamp: { type: Date, default: Date.now }
});

// TTL Index: Documents expire 900 seconds (15 minutes) after the 'timestamp'
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
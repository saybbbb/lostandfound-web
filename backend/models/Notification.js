const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["match","status_update","system","claim_update"], default: "status_update" },
    is_read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);

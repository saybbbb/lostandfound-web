const mongoose = require("mongoose");

const ClaimItemSchema = new mongoose.Schema(
{
    // ERD: The lost item being claimed
    lost_item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LostItem",
    },

    // ERD: The found item matched with the claim
    found_item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoundItem",
        required: true,
    },

    // ERD: The user claiming ownership (extracted via JWT)
    claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // ERD: Admin / Staff reviewing the claim
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    // User-submitted proof
    proof_description: {
        type: String,
        required: true,
        trim: true,
    },

    // ERD: Claim status (approval state)
    claim_status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },

    // ERD: When claim was initiated
    date_claimed: {
        type: Date,
        default: Date.now,
    },

    // ERD: When staff/admin reviewed the claim
    date_reviewed: {
        type: Date,
        default: null,
    },

    // Reason for rejection (if any)
    rejection_reason: {
        type: String,
        default: null,
    },

},
{ timestamps: true }
);

module.exports = mongoose.model("ClaimItem", ClaimItemSchema);

const mongoose = require("mongoose");

const FoundItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    found_location: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    date_found: {
        type: Date,
        required: true
    },

    image_url: {
        type: String,
        default: null
    },

    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "claimed"],
        default: "pending"
    },

    claimed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    claimed_at: {
        type: Date,
        default: null
    },

    approval_status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
},
reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},
reviewed_at: {
    type: Date,
    default: null
},
rejection_reason: {
    type: String,
    default: null
}


}, { timestamps: true });

module.exports = mongoose.model("FoundItem", FoundItemSchema);

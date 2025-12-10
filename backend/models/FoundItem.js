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

    contact_info: {
        type: String,
        required: false
    },

    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
},

claim_status: {
    type: String,
    enum: ["none", "claimed"],
    default: "none"
},

proof_description: {
    type: String,
    default: null,
},

claim_proof_image: {
        type: String,
        default: null
    },

verified_claim: {
    type: Boolean,
    default: false,
},

verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
},

verified_at: {
    type: Date,
    default: null
},

lost_item_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "LostItem",
  required: null
},



}, { timestamps: true });

module.exports = mongoose.model("FoundItem", FoundItemSchema);

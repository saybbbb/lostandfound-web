const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema(

  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    lost_location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    date_lost: {
      type: Date,
      required: true,
    },

    image_url: {
      type: String,
      default: null,
    },

    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For "Contact Owner"
    contact_info: {
      type: String, // email or phone
      required: false,
    },

    // Status for future expansion
    status: {
      type: String,
      enum: ["open", "found", "closed"],
      default: "open",
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
verified_claim: {
  type: Boolean,
  default: false
},
claim_status: {
  type: String,
  enum: ["none", "claimed"],
  default: "none"
},
proof_description: {
  type: String,
  default: null
},

lost_item_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "LostItem",
  default: null
},

  },

  { timestamps: true }
);

module.exports = mongoose.model("LostItem", LostItemSchema);

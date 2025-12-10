const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true },

  role: {
    type: String,
    enum: ["user", "staff", "admin"],
    default: "user"
  },

  profile_photo: {
    type: String,
    default: null
  },

  // ⬇⬇ ADD THIS FIELD for Admin Approval System
  verified: {
    type: Boolean,
    default: false   // NEW USERS ARE UNVERIFIED
  },

  // Forgot Password fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Generate reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
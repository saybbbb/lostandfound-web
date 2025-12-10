const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/* ======================================================
   REGISTER (User starts as UNVERIFIED)
======================================================*/
exports.register = async (req, res) => {
  try {
    const { name, email, password, birthday } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // AUTO-VERIFY ADMIN ACCOUNT
    const isAdminEmail = email === process.env.MAIN_ADMIN_EMAIL;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      birthday,
      role: isAdminEmail ? "admin" : "user",
      verified: isAdminEmail ? true : false   // 👈 AUTO-VERIFY ADMIN
    });

    res.json({
      success: true,
      message: isAdminEmail
        ? "Admin account created and auto-verified."
        : "Registration successful. Awaiting admin approval.",
      user
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ======================================================
   LOGIN (Blocked if NOT verified)
======================================================*/
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password try again" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // BLOCK UNVERIFIED ACCOUNTS
    if (!user.verified) {
      return res.status(403).json({
        message: "Your account has not been verified by an admin."
      });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ======================================================
   FORGOT PASSWORD
======================================================*/
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Click this link to reset your password:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.json({ message: "Reset link sent to email." });

  } catch (error) {
    console.log("EMAIL ERROR:", error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: "Email send failed." });
  }
};

/* ======================================================
   RESET PASSWORD
======================================================*/
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password has been reset successfully." });
};

/* ======================================================
   NOTIFICATIONS
======================================================*/
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

/* ======================================================
   PROTECTED USER INFO
======================================================*/
exports.protected = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ======================================================
   ADMIN VERIFICATION SYSTEM
======================================================*/

// PATCH — approve a user and send email
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update verification status
    user.verified = true;
    await user.save();

    // Create system notification for user
    await Notification.create({
      user_id: user._id,
      message: "Your account has been approved by an administrator.",
      type: "account_verified"
    });

    // Prepare email message
    const message = `
      Hello ${user.name},

      Good news! Your Lost & Found account has been APPROVED by an administrator.

      You may now log in using your registered email:
      ${user.email}

      Thank you for using the Lost & Found System.
    `;

    // Send the email
    await sendEmail({
      email: user.email,
      subject: "Your Account Has Been Approved",
      message,
    });

    res.json({
      success: true,
      message: "User verified successfully, email notification sent."
    });

  } catch (err) {
    console.error("VERIFY USER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE — reject & remove a user
exports.rejectUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User rejected and deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
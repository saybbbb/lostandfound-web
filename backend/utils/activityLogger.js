const ActivityLog = require("../models/ActivityLog");

const logActivity = async (name, activity, details, verifier, result) => {
  try {
    await ActivityLog.create({
      name,
      activity,
      details,
      verifier,
      result
    });
  } catch (err) {
    console.error("Logging Error:", err);
  }
};

module.exports = logActivity;
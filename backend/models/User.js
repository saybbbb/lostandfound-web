const mongoose = require("mongoose");

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

});

module.exports = mongoose.model("User", userSchema);

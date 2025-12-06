// createAdmin.js (CommonJS)
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // adjust path

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      birthday: new Date("2000-01-01"),
      role: "admin",
    });

    await admin.save();
    console.log("Admin account created!");
    process.exit();
  })
  .catch(err => console.error(err));

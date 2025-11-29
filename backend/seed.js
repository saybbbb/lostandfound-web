const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");
const FoundItem = require("./models/FoundItem");
const User = require("./models/User");

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // create a category
        const category = await Category.create({ name: "Bags" });

        // use first user in database
        const user = await User.findOne();
        if (!user) {
            throw new Error("No user found. Insert a user first.");
        }

        // create a found item
        const item = await FoundItem.create({
            name: "Test Wallet",
            category: category._id,
            posted_by: user._id,
            found_location: "Main Gate",
            description: "Test seed item",
            date_found: new Date()
        });

        console.log("Seeded:", { category, item });
        process.exit();
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seed();

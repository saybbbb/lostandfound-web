const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");

async function seedCategories() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Category list
        const categories = [
            "Electronics",
            "Personal Items",
            "Clothing & Accessories",
            "Documents",
            "Medical Items",
            "Miscellaneous"
        ];

        console.log("Seeding categories...");

        for (const name of categories) {
            await Category.findOneAndUpdate(
                { name },
                { name },
                { upsert: true, new: true }
            );
        }

        console.log("✅ Categories successfully seeded:");
        categories.forEach(c => console.log(" - " + c));

        process.exit();
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
}

seedCategories();

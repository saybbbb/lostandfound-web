const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

/* ======================================================
   TRUST PROXY (REQUIRED FOR RENDER)
====================================================== */
app.set("trust proxy", 1);

/* ======================================================
   CORS CONFIGURATION
====================================================== */
const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(null, false); // ❗ DO NOT throw Error
    },
    credentials: true,
  })
);

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   DATABASE
====================================================== */
connectDB();

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", require("./routes/authRoutes"));

/* ======================================================
   HEALTH CHECK (IMPORTANT FOR RENDER)
====================================================== */
app.get("/api/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
    uptime: process.uptime(),
  });
});

/* ======================================================
   ERROR HANDLER (PRODUCTION SAFE)
====================================================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

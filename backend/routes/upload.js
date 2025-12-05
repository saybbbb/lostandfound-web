const router = require("express").Router();
const { upload } = require("../config/cloudinary");

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    res.json({
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;

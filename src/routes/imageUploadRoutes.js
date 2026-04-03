const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
});
const { uploadSingle } = require("../utils/uploadImage");

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          message: "Image is required",
        });
      }

      const imageUrl = await uploadSingle(req.file.path, "my_uploads");

      return res.status(200).json({
        status: true,
        message: "Image uploaded successfully",
        image_url: imageUrl,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
);

module.exports = router;

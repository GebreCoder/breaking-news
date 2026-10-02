const express = require("express");
const {
  getMedia,
  uploadMedia,
  deleteMedia,
} = require("../controllers/mediaController");
const { handleMediaUpload } = require("../services/mediaUploadService");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// ROUTES
// =========================

// Get all media
router.get("/", authenticateToken, getMedia);

// Upload image
router.post("/upload", authenticateToken, handleMediaUpload, uploadMedia);

// Delete image
router.delete("/:id", authenticateToken, deleteMedia);

module.exports = router;

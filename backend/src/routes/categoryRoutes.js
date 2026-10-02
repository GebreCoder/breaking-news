const express = require("express");

const {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/admin", authenticateToken, getAdminCategories);
router.get("/:slug", getCategoryBySlug);

// Admin
router.post("/", authenticateToken, createCategory);
router.put("/:id", authenticateToken, updateCategory);
router.delete("/:id", authenticateToken, deleteCategory);
router.patch("/:id/status", authenticateToken, setCategoryStatus);

module.exports = router;

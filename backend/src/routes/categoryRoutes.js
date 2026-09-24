const express = require("express");

const {
    getCategories,
    getCategoryBySlug,
    createCategory
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin
router.post("/", authenticateToken, createCategory);

module.exports = router;
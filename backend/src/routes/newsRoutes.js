const express = require("express");

const {
    getNews,
    getNewsBySlug,
    getAdminNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} = require("../controllers/newsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// PUBLIC
// ============================================================

router.get("/", getNews);

router.get("/:slug", getNewsBySlug);


// ============================================================
// ADMIN
// ============================================================

// Get all news for admin
router.get("/admin/all", authenticateToken, getAdminNews);

// Get one article for editing
router.get("/admin/:id", authenticateToken, getNewsById);

// Create
router.post("/", authenticateToken, createNews);

// Update
router.put("/:id", authenticateToken, updateNews);

// Delete
router.delete("/:id", authenticateToken, deleteNews);


module.exports = router;
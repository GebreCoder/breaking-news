
const express = require("express");

const {
    getBreakingNews,
    getActiveBreakingNews,
    createBreakingNews,
    updateBreakingNews,
    deleteBreakingNews
} = require("../controllers/breakingNewsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/active", getActiveBreakingNews);

// Admin
router.get(
    "/",
    authenticateToken,
    getBreakingNews
);

router.post(
    "/",
    authenticateToken,
    createBreakingNews
);

router.patch(
    "/:id",
    authenticateToken,
    updateBreakingNews
);

router.delete(
    "/:id",
    authenticateToken,
    deleteBreakingNews
);

module.exports = router;


const express = require("express");

const {
    getSiteSettings,
    updateSiteSetting
} = require("../controllers/siteSettingsController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// Admin: get settings
router.get(
    "/",
    authenticateToken,
    getSiteSettings
);


// Admin: update setting
router.patch(
    "/:key",
    authenticateToken,
    updateSiteSetting
);


module.exports = router;
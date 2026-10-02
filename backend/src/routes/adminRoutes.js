const express = require("express");

const {
    login,
    getAdmins,
    createAdmin,
    updateAdminStatus,
    getAuditLogs
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// ADMIN LOGIN
// ============================================================

router.post("/login", login);


// ============================================================
// USER MANAGEMENT
// ============================================================

// Get all admin users
router.get(
    "/users",
    authenticateToken,
    getAdmins
);

// Create admin user
router.post(
    "/users",
    authenticateToken,
    createAdmin
);

// Activate / deactivate admin
router.patch(
    "/users/:id/status",
    authenticateToken,
    updateAdminStatus
);


// ============================================================
// AUDIT LOGS
// ============================================================

// Get audit logs
router.get(
    "/audit-logs",
    authenticateToken,
    getAuditLogs
);


module.exports = router;
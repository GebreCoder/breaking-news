const pool = require("../config/db");

// ============================================================
// CREATE AUDIT LOG
// ============================================================

const createAuditLog = async ({
    adminId,
    action,
    entityType = null,
    entityId = null,
    description = null,
    ipAddress = null
}) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (
                admin_id,
                action,
                entity_type,
                entity_id,
                description,
                ip_address
            )
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                adminId,
                action,
                entityType,
                entityId,
                description,
                ipAddress
            ]
        );
    } catch (error) {
        // Audit logging should never break the main action.
        console.error("Audit log error:", error);
    }
};

module.exports = {
    createAuditLog
};
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { createAuditLog } = require("../services/auditLogService");

// ============================================================
// ADMIN LOGIN
// ============================================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT 
                admin_id,
                full_name,
                email,
                password_hash,
                is_active
             FROM admins
             WHERE LOWER(BTRIM(email)) = $1
             LIMIT 1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const admin = result.rows[0];

        if (!admin.is_active) {
            return res.status(403).json({
                message: "This admin account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                adminId: admin.admin_id,
                email: admin.email,
                fullName: admin.full_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        await createAuditLog({
            adminId: admin.admin_id,
            action: "LOGIN",
            entityType: "Admin",
            entityId: admin.admin_id,
            description: `Admin ${admin.email} logged in`,
            ipAddress: req.ip
        });

        res.json({
            message: "Login successful",
            token,
            admin: {
                adminId: admin.admin_id,
                fullName: admin.full_name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};


// ============================================================
// GET ALL ADMIN USERS
// ============================================================

const getAdmins = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                admin_id,
                full_name,
                email,
                is_active,
                created_at,
                updated_at
             FROM admins
             ORDER BY created_at DESC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get admins error:", error);

        res.status(500).json({
            message: "Failed to load admin users"
        });
    }
};


// ============================================================
// CREATE ADMIN USER
// ============================================================

const createAdmin = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Full name, email, and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingAdmin = await pool.query(
            `SELECT admin_id
             FROM admins
             WHERE email = $1
             LIMIT 1`,
            [normalizedEmail]
        );

        if (existingAdmin.rows.length > 0) {
            return res.status(409).json({
                message: "An admin with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO admins
                (full_name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING
                admin_id,
                full_name,
                email,
                is_active,
                created_at`,
            [
                fullName.trim(),
                normalizedEmail,
                passwordHash
            ]
        );

        await createAuditLog({
            adminId: req.admin.adminId,
            action: "CREATE_ADMIN",
            entityType: "Admin",
            entityId: result.rows[0].admin_id,
            description: `Created admin account ${result.rows[0].email}`,
            ipAddress: req.ip
        });

        res.status(201).json({
            message: "Admin account created successfully",
            admin: result.rows[0]
        });

    } catch (error) {
        console.error("Create admin error:", error);

        res.status(500).json({
            message: "Failed to create admin account"
        });
    }
};


// ============================================================
// ACTIVATE / DEACTIVATE ADMIN
// ============================================================

const updateAdminStatus = async (req, res) => {
    try {
        const adminId = Number(req.params.id);
        const { isActive } = req.body;

        if (!Number.isInteger(adminId)) {
            return res.status(400).json({
                message: "Invalid admin ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        // Prevent an admin from deactivating their own account.
        if (
            Number(req.admin.adminId) === adminId &&
            isActive === false
        ) {
            return res.status(400).json({
                message: "You cannot deactivate your own account"
            });
        }

        // Prevent the last active admin from being deactivated.
        if (isActive === false) {
            const activeAdmins = await pool.query(
                `SELECT COUNT(*)::int AS count
                 FROM admins
                 WHERE is_active = TRUE`
            );

            if (activeAdmins.rows[0].count <= 1) {
                return res.status(400).json({
                    message: "The last active admin cannot be deactivated"
                });
            }
        }

        const result = await pool.query(
            `UPDATE admins
             SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE admin_id = $2
             RETURNING
                admin_id,
                full_name,
                email,
                is_active,
                created_at,
                updated_at`,
            [isActive, adminId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Admin account not found"
            });
        }

        await createAuditLog({
            adminId: req.admin.adminId,
            action: isActive
                ? "ACTIVATE_ADMIN"
                : "DEACTIVATE_ADMIN",
            entityType: "Admin",
            entityId: result.rows[0].admin_id,
            description: isActive
                ? `Activated admin account ${result.rows[0].email}`
                : `Deactivated admin account ${result.rows[0].email}`,
            ipAddress: req.ip
        });

        res.json({
            message: isActive
                ? "Admin account activated successfully"
                : "Admin account deactivated successfully",
            admin: result.rows[0]
        });

    } catch (error) {
        console.error("Update admin status error:", error);

        res.status(500).json({
            message: "Failed to update admin status"
        });
    }
};


// ============================================================
// GET AUDIT LOGS
// ============================================================

const getAuditLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                al.audit_log_id,
                al.admin_id,
                a.full_name AS admin_name,
                a.email AS admin_email,
                al.action,
                al.entity_type,
                al.entity_id,
                al.description,
                al.ip_address,
                al.created_at
            FROM audit_logs al
            LEFT JOIN admins a
                ON al.admin_id = a.admin_id
            ORDER BY al.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Get audit logs error:", error);

        res.status(500).json({
            message: "Failed to load audit logs"
        });
    }
};


module.exports = {
    login,
    getAdmins,
    createAdmin,
    updateAdminStatus,
    getAuditLogs
};
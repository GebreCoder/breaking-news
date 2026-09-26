const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await pool.query(
            `SELECT
                admin_id,
                full_name,
                email,
                password_hash,
                is_active
             FROM admins
             WHERE email = $1
             LIMIT 1`,
            [email]
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
            message: "Login failed"
        });
    }
};

module.exports = {
    login
};
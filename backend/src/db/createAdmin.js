require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
    const fullName = process.env.ADMIN_FULL_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
        console.error("Missing admin environment variables.");
        process.exit(1);
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO admins
                (full_name, email, password_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE
             SET full_name = EXCLUDED.full_name,
                 password_hash = EXCLUDED.password_hash`,
            [fullName, email, passwordHash]
        );

        console.log("Admin account saved successfully (created or updated).");
        console.log(`Email: ${email}`);

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await pool.end();
    }
};

createAdmin();
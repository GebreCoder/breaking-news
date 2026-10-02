require("dotenv").config();
const pool = require("./src/config/db");

(async () => {
    try {
        const tables = await pool.query(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' ORDER BY table_name`
        );
        console.log("TABLES:", tables.rows.map(r => r.table_name).join(", ") || "(none)");

        const admins = await pool.query("SELECT admin_id, email, is_active FROM admins");
        console.log("ADMINS:", JSON.stringify(admins.rows));
    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error.message);
    } finally {
        await pool.end();
    }
})();

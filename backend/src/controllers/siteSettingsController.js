const pool = require("../config/db");

// GET all site settings
const getSiteSettings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                setting_id,
                setting_key,
                setting_value,
                updated_at
            FROM site_settings
            ORDER BY setting_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(
            "Error fetching site settings:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch site settings"
        });
    }
};


// UPDATE a site setting
const updateSiteSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (!key) {
            return res.status(400).json({
                message: "Setting key is required"
            });
        }

        const result = await pool.query(
            `UPDATE site_settings
             SET
                setting_value = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE setting_key = $2
             RETURNING *`,
            [
                value || "",
                key
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Setting not found"
            });
        }

        res.json({
            message: "Site setting updated successfully",
            setting: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error updating site setting:",
            error
        );

        res.status(500).json({
            message: "Failed to update site setting"
        });
    }
};


module.exports = {
    getSiteSettings,
    updateSiteSetting
};
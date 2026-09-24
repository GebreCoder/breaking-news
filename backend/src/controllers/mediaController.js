
const pool = require("../config/db");

// GET all media
const getMedia = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                m.media_id,
                m.file_name,
                m.file_url,
                m.file_type,
                m.file_size,
                m.alt_text,
                m.created_at,
                a.full_name AS uploaded_by_name
            FROM media m
            LEFT JOIN admins a
                ON m.uploaded_by = a.admin_id
            ORDER BY m.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching media:", error);

        res.status(500).json({
            message: "Failed to fetch media"
        });
    }
};


// UPLOAD media
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Image file is required"
            });
        }

        const fileUrl =
            `/uploads/${req.file.filename}`;

        const result = await pool.query(
            `INSERT INTO media (
                uploaded_by,
                file_name,
                file_url,
                file_type,
                file_size,
                alt_text
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                req.admin.adminId,
                req.file.originalname,
                fileUrl,
                req.file.mimetype,
                req.file.size,
                req.body.altText || null
            ]
        );

        res.status(201).json({
            message: "Media uploaded successfully",
            media: result.rows[0]
        });

    } catch (error) {
        console.error("Error uploading media:", error);

        res.status(500).json({
            message: "Failed to upload media"
        });
    }
};


// DELETE media
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM media
             WHERE media_id = $1
             RETURNING media_id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Media not found"
            });
        }

        res.json({
            message: "Media deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting media:", error);

        res.status(500).json({
            message: "Failed to delete media"
        });
    }
};


module.exports = {
    getMedia,
    uploadMedia,
    deleteMedia
};


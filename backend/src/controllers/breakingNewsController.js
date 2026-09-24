
const pool = require("../config/db");

// GET all breaking news for admin
const getBreakingNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.breaking_news_id,
                b.news_id,
                b.headline,
                b.link_url,
                b.is_active,
                b.starts_at,
                b.ends_at,
                b.created_at,
                n.title AS news_title,
                n.slug AS news_slug
            FROM breaking_news b
            LEFT JOIN news n
                ON b.news_id = n.news_id
            ORDER BY b.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(
            "Error fetching breaking news:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch breaking news"
        });
    }
};

// GET active breaking news for public website
const getActiveBreakingNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.breaking_news_id,
                b.news_id,
                b.headline,
                b.link_url,
                b.starts_at,
                b.ends_at,
                n.slug AS news_slug
            FROM breaking_news b
            LEFT JOIN news n
                ON b.news_id = n.news_id
            WHERE b.is_active = TRUE
              AND (
                    b.starts_at IS NULL
                    OR b.starts_at <= CURRENT_TIMESTAMP
              )
              AND (
                    b.ends_at IS NULL
                    OR b.ends_at >= CURRENT_TIMESTAMP
              )
            ORDER BY b.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(
            "Error fetching active breaking news:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch active breaking news"
        });
    }
};

// CREATE breaking news
const createBreakingNews = async (req, res) => {
    try {
        const {
            headline,
            newsId,
            linkUrl,
            startsAt,
            endsAt
        } = req.body;

        if (!headline || !headline.trim()) {
            return res.status(400).json({
                message: "Headline is required"
            });
        }

        if (startsAt && endsAt) {
            const start = new Date(startsAt);
            const end = new Date(endsAt);

            if (start >= end) {
                return res.status(400).json({
                    message:
                        "End time must be later than start time"
                });
            }
        }

        const result = await pool.query(
            `INSERT INTO breaking_news (
                news_id,
                headline,
                link_url,
                is_active,
                starts_at,
                ends_at
            )
            VALUES ($1, $2, $3, TRUE, $4, $5)
            RETURNING *`,
            [
                newsId || null,
                headline.trim(),
                linkUrl || null,
                startsAt || null,
                endsAt || null
            ]
        );

        res.status(201).json({
            message:
                "Breaking news created successfully",
            breakingNews: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error creating breaking news:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create breaking news"
        });
    }
};

// UPDATE active status
const updateBreakingNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const result = await pool.query(
            `UPDATE breaking_news
             SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE breaking_news_id = $2
             RETURNING *`,
            [isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Breaking news item not found"
            });
        }

        res.json({
            message:
                "Breaking news updated successfully",
            breakingNews: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error updating breaking news:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update breaking news"
        });
    }
};

// DELETE breaking news
const deleteBreakingNews = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM breaking_news
             WHERE breaking_news_id = $1
             RETURNING breaking_news_id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Breaking news item not found"
            });
        }

        res.json({
            message:
                "Breaking news deleted successfully"
        });

    } catch (error) {
        console.error(
            "Error deleting breaking news:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete breaking news"
        });
    }
};

module.exports = {
    getBreakingNews,
    getActiveBreakingNews,
    createBreakingNews,
    updateBreakingNews,
    deleteBreakingNews
};


const pool = require("../config/db");

// ============================================================
// GET PUBLISHED NEWS - PUBLIC
// ============================================================

const getNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                n.news_id,
                n.title,
                n.slug,
                n.summary,
                n.content,
                n.featured_image,
                n.image_caption,
                n.is_featured,
                n.published_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM news n
            INNER JOIN categories c
                ON n.category_id = c.category_id
            WHERE n.status = 'published'
              AND c.is_active = TRUE
            ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching news:", error);

        res.status(500).json({
            message: "Failed to fetch news"
        });
    }
};


// ============================================================
// GET ONE PUBLISHED ARTICLE BY SLUG - PUBLIC
// ============================================================

const getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const result = await pool.query(`
            SELECT
                n.news_id,
                n.title,
                n.slug,
                n.summary,
                n.content,
                n.featured_image,
                n.image_caption,
                n.is_featured,
                n.published_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM news n
            INNER JOIN categories c
                ON n.category_id = c.category_id
            WHERE n.slug = $1
              AND n.status = 'published'
              AND c.is_active = TRUE
            LIMIT 1
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "News article not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching news article:", error);

        res.status(500).json({
            message: "Failed to fetch news article"
        });
    }
};


// ============================================================
// GET ALL NEWS FOR ADMIN
// ============================================================

const getAdminNews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                n.news_id,
                n.category_id,
                n.title,
                n.slug,
                n.summary,
                n.content,
                n.featured_image,
                n.image_caption,
                n.status,
                n.is_featured,
                n.published_at,
                n.created_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM news n
            INNER JOIN categories c
                ON n.category_id = c.category_id
            ORDER BY n.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching admin news:", error);

        res.status(500).json({
            message: "Failed to fetch news"
        });
    }
};


// ============================================================
// GET ONE NEWS ARTICLE FOR ADMIN EDITING
// ============================================================

const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                n.news_id,
                n.category_id,
                n.title,
                n.slug,
                n.summary,
                n.content,
                n.featured_image,
                n.image_caption,
                n.status,
                n.is_featured,
                n.published_at,
                n.created_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM news n
            INNER JOIN categories c
                ON n.category_id = c.category_id
            WHERE n.news_id = $1
            LIMIT 1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "News article not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching news article:", error);

        res.status(500).json({
            message: "Failed to fetch news article"
        });
    }
};


// ============================================================
// CREATE NEWS ARTICLE
// ============================================================

const createNews = async (req, res) => {
    try {
        const {
            categoryId,
            title,
            summary,
            content,
            featuredImage,
            imageCaption,
            status,
            isFeatured
        } = req.body;

        if (!categoryId || !title || !content) {
            return res.status(400).json({
                message: "Category, title, and content are required"
            });
        }

        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const finalStatus = status || "draft";

        const publishedAt =
            finalStatus === "published"
                ? new Date()
                : null;

        const result = await pool.query(
            `INSERT INTO news (
                category_id,
                author_id,
                title,
                slug,
                summary,
                content,
                featured_image,
                image_caption,
                status,
                is_featured,
                published_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                categoryId,
                req.admin.adminId,
                title,
                slug,
                summary || null,
                content,
                featuredImage || null,
                imageCaption || null,
                finalStatus,
                Boolean(isFeatured),
                publishedAt
            ]
        );

        res.status(201).json({
            message: "News article created successfully",
            news: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating news:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "An article with this title already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create news article"
        });
    }
};


// ============================================================
// UPDATE NEWS ARTICLE
// ============================================================

const updateNews = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            categoryId,
            title,
            summary,
            content,
            featuredImage,
            imageCaption,
            status,
            isFeatured
        } = req.body;

        if (!categoryId || !title || !content) {
            return res.status(400).json({
                message: "Category, title, and content are required"
            });
        }

        const existingResult = await pool.query(
            `
            SELECT
                news_id,
                status,
                published_at
            FROM news
            WHERE news_id = $1
            LIMIT 1
            `,
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                message: "News article not found"
            });
        }

        const existingNews = existingResult.rows[0];

        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const finalStatus = status || "draft";

        let publishedAt = existingNews.published_at;

        if (finalStatus === "published") {
            if (!publishedAt) {
                publishedAt = new Date();
            }
        } else {
            publishedAt = null;
        }

        const result = await pool.query(
            `
            UPDATE news
            SET
                category_id = $1,
                title = $2,
                slug = $3,
                summary = $4,
                content = $5,
                featured_image = $6,
                image_caption = $7,
                status = $8,
                is_featured = $9,
                published_at = $10
            WHERE news_id = $11
            RETURNING *
            `,
            [
                categoryId,
                title.trim(),
                slug,
                summary?.trim() || null,
                content,
                featuredImage?.trim() || null,
                imageCaption?.trim() || null,
                finalStatus,
                Boolean(isFeatured),
                publishedAt,
                id
            ]
        );

        res.json({
            message: "News article updated successfully",
            news: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating news:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "An article with this title already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update news article"
        });
    }
};


// ============================================================
// DELETE NEWS ARTICLE
// ============================================================

const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM news
            WHERE news_id = $1
            RETURNING news_id, title
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "News article not found"
            });
        }

        res.json({
            message: "News article deleted successfully",
            news: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting news:", error);

        res.status(500).json({
            message: "Failed to delete news article"
        });
    }
};


module.exports = {
    getNews,
    getNewsBySlug,
    getAdminNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
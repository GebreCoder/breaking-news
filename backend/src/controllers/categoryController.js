const pool = require("../config/db");

// GET all active categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                category_id,
                name,
                slug,
                description,
                display_order
            FROM categories
            WHERE is_active = TRUE
            ORDER BY display_order ASC, name ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching categories:", error);

        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};

// GET one category by slug
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const result = await pool.query(`
            SELECT
                category_id,
                name,
                slug,
                description,
                display_order
            FROM categories
            WHERE slug = $1
              AND is_active = TRUE
            LIMIT 1
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching category:", error);

        res.status(500).json({
            message: "Failed to fetch category"
        });
    }
};

// CREATE category
const createCategory = async (req, res) => {
    try {
        const {
            name,
            description,
            displayOrder
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const cleanName = name.trim();

        const slug = cleanName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const result = await pool.query(
            `INSERT INTO categories
                (name, slug, description, display_order)
             VALUES ($1, $2, $3, $4)
             RETURNING
                category_id,
                name,
                slug,
                description,
                display_order`,
            [
                cleanName,
                slug,
                description?.trim() || null,
                Number(displayOrder) || 0
            ]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating category:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "A category with this name already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create category"
        });
    }
};

module.exports = {
    getCategories,
    getCategoryBySlug,
    createCategory
};
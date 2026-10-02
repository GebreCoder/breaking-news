const pool = require("../config/db");
const { createAuditLog } = require("../services/auditLogService");

const createCategorySlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

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
      message: "Failed to fetch categories",
    });
  }
};

// GET all categories, including inactive categories, for admin
const getAdminCategories = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                c.category_id,
                c.name,
                c.slug,
                c.description,
                c.display_order,
                c.is_active,
                c.created_at,
                COUNT(n.news_id)::INTEGER AS article_count
            FROM categories c
            LEFT JOIN news n
                ON n.category_id = c.category_id
            GROUP BY c.category_id
            ORDER BY c.display_order ASC, c.name ASC
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching admin categories:", error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

// GET one category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
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
        `,
      [slug],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);

    res.status(500).json({
      message: "Failed to fetch category",
    });
  }
};

// UPDATE category details
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const cleanName = name.trim();
    const slug = createCategorySlug(cleanName);
    const cleanDisplayOrder = Number(displayOrder);

    if (!slug) {
      return res.status(400).json({
        message: "Category name must include letters or numbers",
      });
    }

    if (!Number.isInteger(cleanDisplayOrder) || cleanDisplayOrder < 0) {
      return res.status(400).json({
        message: "Display order must be a non-negative whole number",
      });
    }

    const result = await pool.query(
      `UPDATE categories
             SET name = $1,
                 slug = $2,
                 description = $3,
                 display_order = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE category_id = $5
             RETURNING category_id, name, slug, description, display_order, is_active, created_at`,
      [
        cleanName,
        slug,
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
        cleanDisplayOrder,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name or URL already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// DELETE category permanently when no news references it
const deleteCategory = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM categories
             WHERE category_id = $1
             RETURNING category_id, name`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await createAuditLog({
      adminId: req.admin.adminId,
      action: "DELETE_CATEGORY",
      entityType: "Category",
      entityId: result.rows[0].category_id,
      description: `Permanently deleted category "${result.rows[0].name}"`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error.code === "23503") {
      return res.status(409).json({
        message: "This category has news articles. Reassign or delete those articles before permanently deleting the category.",
      });
    }

    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};

// SET category availability
const setCategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const result = await pool.query(
      `UPDATE categories
             SET is_active = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE category_id = $2
             RETURNING category_id, is_active`,
      [isActive, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category status updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category status:", error);

    res.status(500).json({
      message: "Failed to update category status",
    });
  }
};

// CREATE category
const createCategory = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const cleanName = name.trim();

    const slug = createCategorySlug(cleanName);

    if (!slug) {
      return res.status(400).json({
        message: "Category name must include letters or numbers",
      });
    }

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
      [cleanName, slug, description?.trim() || null, Number(displayOrder) || 0],
    );

    const category = result.rows[0];

    await createAuditLog({
      adminId: req.admin.adminId,
      action: "CREATE_CATEGORY",
      entityType: "Category",
      entityId: category.category_id,
      description: `Created category "${category.name}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "A category with this name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

module.exports = {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
};

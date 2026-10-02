const pool = require("../config/db");
const { createAuditLog } = require("../services/auditLogService");

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
    console.error("Error fetching breaking news:", error);

    res.status(500).json({
      message: "Failed to fetch breaking news",
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
    console.error("Error fetching active breaking news:", error);

    res.status(500).json({
      message: "Failed to fetch active breaking news",
    });
  }
};

// CREATE breaking news
const createBreakingNews = async (req, res) => {
  try {
    const { headline, newsId, linkUrl, startsAt, endsAt } = req.body;

    if (typeof headline !== "string" || !headline.trim()) {
      return res.status(400).json({
        message: "Headline is required",
      });
    }

    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime())) ||
      (start && end && start >= end)
    ) {
      return res.status(400).json({
        message:
          "Start and end times must be valid, and end time must be later than start time",
      });
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
        typeof linkUrl === "string" && linkUrl.trim() ? linkUrl.trim() : null,
        startsAt || null,
        endsAt || null,
      ],
    );

    const breakingNews = result.rows[0];

    await createAuditLog({
      adminId: req.admin.adminId,
      action: "CREATE_BREAKING_NEWS",
      entityType: "BreakingNews",
      entityId: breakingNews.breaking_news_id,
      description: `Created breaking news "${breakingNews.headline}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Breaking news created successfully",
      breakingNews,
    });
  } catch (error) {
    console.error("Error creating breaking news:", error);

    res.status(500).json({
      message: "Failed to create breaking news",
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
        message: "isActive must be true or false",
      });
    }

    const result = await pool.query(
      `UPDATE breaking_news
             SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE breaking_news_id = $2
             RETURNING *`,
      [isActive, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Breaking news item not found",
      });
    }

    const breakingNews = result.rows[0];

    await createAuditLog({
      adminId: req.admin.adminId,
      action: isActive ? "ACTIVATE_BREAKING_NEWS" : "DEACTIVATE_BREAKING_NEWS",
      entityType: "BreakingNews",
      entityId: breakingNews.breaking_news_id,
      description: `${isActive ? "Activated" : "Deactivated"} breaking news "${breakingNews.headline}"`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Breaking news updated successfully",
      breakingNews,
    });
  } catch (error) {
    console.error("Error updating breaking news:", error);

    res.status(500).json({
      message: "Failed to update breaking news",
    });
  }
};

// UPDATE breaking news details without changing its active status
const updateBreakingNewsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { headline, newsId, linkUrl, startsAt, endsAt } = req.body;

    if (typeof headline !== "string" || !headline.trim()) {
      return res.status(400).json({
        message: "Headline is required",
      });
    }

    const start = startsAt ? new Date(startsAt) : null;
    const end = endsAt ? new Date(endsAt) : null;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime())) ||
      (start && end && start >= end)
    ) {
      return res.status(400).json({
        message:
          "Start and end times must be valid, and end time must be later than start time",
      });
    }

    const result = await pool.query(
      `UPDATE breaking_news
             SET news_id = $1,
                 headline = $2,
                 link_url = $3,
                 starts_at = $4,
                 ends_at = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE breaking_news_id = $6
             RETURNING *`,
      [
        newsId || null,
        headline.trim(),
        typeof linkUrl === "string" && linkUrl.trim() ? linkUrl.trim() : null,
        startsAt || null,
        endsAt || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Breaking news item not found",
      });
    }

    const breakingNews = result.rows[0];

    await createAuditLog({
      adminId: req.admin.adminId,
      action: "UPDATE_BREAKING_NEWS_DETAILS",
      entityType: "BreakingNews",
      entityId: breakingNews.breaking_news_id,
      description: `Updated breaking news details for "${breakingNews.headline}"`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Breaking news details updated successfully",
      breakingNews,
    });
  } catch (error) {
    console.error("Error updating breaking news details:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        message: "The selected related article does not exist",
      });
    }

    res.status(500).json({
      message: "Failed to update breaking news details",
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
             RETURNING breaking_news_id, headline`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Breaking news item not found",
      });
    }

    const deletedBreakingNews = result.rows[0];

    await createAuditLog({
      adminId: req.admin.adminId,
      action: "DELETE_BREAKING_NEWS",
      entityType: "BreakingNews",
      entityId: deletedBreakingNews.breaking_news_id,
      description: `Deleted breaking news "${deletedBreakingNews.headline}"`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Breaking news deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting breaking news:", error);

    res.status(500).json({
      message: "Failed to delete breaking news",
    });
  }
};

module.exports = {
  getBreakingNews,
  getActiveBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  updateBreakingNewsDetails,
  deleteBreakingNews,
};

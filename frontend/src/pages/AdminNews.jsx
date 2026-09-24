import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminNews() {
    const navigate = useNavigate();

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadNews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/news/admin/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load news."
                );
            }

            setNews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading news:", error);

            setError(
                error.message ||
                "Unable to load news articles."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleDelete = async (id, title) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");
        setDeletingId(id);

        try {
            const response = await fetch(
                `http://localhost:5000/api/news/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete article."
                );
            }

            setMessage(
                data.message ||
                "News article deleted successfully."
            );

            await loadNews();
        } catch (error) {
            console.error("Error deleting news:", error);

            setError(
                error.message ||
                "Unable to delete the article."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Not published";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Not published";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTime = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    };

    const getStatusClass = (status) => {
        if (status === "published") {
            return "published";
        }

        return "draft";
    };

    return (
        <AdminLayout>
            <div className="admin-news-page">

                {/* PAGE HEADER */}
                <div className="admin-news-header">
                    <div>
                        <span className="admin-news-eyebrow">
                            CONTENT MANAGEMENT
                        </span>

                        <h1>News Articles</h1>

                        <p>
                            Create, edit, publish, and manage
                            your news articles.
                        </p>
                    </div>

                    <Link
                        to="/admin/news/create"
                        className="admin-news-create-button"
                    >
                        <span>+</span>
                        Create Article
                    </Link>
                </div>


                {/* ALERTS */}
                {message && (
                    <div className="admin-news-alert admin-news-alert-success">
                        <span className="admin-news-alert-icon">
                            ✓
                        </span>

                        <span>{message}</span>

                        <button
                            type="button"
                            onClick={() => setMessage("")}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="admin-news-alert admin-news-alert-error">
                        <span className="admin-news-alert-icon">
                            !
                        </span>

                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}


                {/* SUMMARY */}
                <div className="admin-news-summary">
                    <div className="admin-news-summary-card">
                        <div className="admin-news-summary-icon">
                            📰
                        </div>

                        <div>
                            <span>Total Articles</span>
                            <strong>{news.length}</strong>
                        </div>
                    </div>

                    <div className="admin-news-summary-card">
                        <div className="admin-news-summary-icon admin-news-summary-green">
                            ✓
                        </div>

                        <div>
                            <span>Published</span>
                            <strong>
                                {
                                    news.filter(
                                        (item) =>
                                            item.status ===
                                            "published"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="admin-news-summary-card">
                        <div className="admin-news-summary-icon admin-news-summary-yellow">
                            ◷
                        </div>

                        <div>
                            <span>Drafts</span>
                            <strong>
                                {
                                    news.filter(
                                        (item) =>
                                            item.status !==
                                            "published"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>
                </div>


                {/* CONTENT CARD */}
                <div className="admin-news-card">

                    <div className="admin-news-card-header">
                        <div>
                            <h2>All Articles</h2>
                            <p>
                                Manage your published articles
                                and drafts.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-news-refresh-button"
                            onClick={loadNews}
                            disabled={loading}
                        >
                            <span
                                className={
                                    loading
                                        ? "admin-news-refresh-spin"
                                        : ""
                                }
                            >
                                ↻
                            </span>

                            Refresh
                        </button>
                    </div>


                    {loading ? (
                        <div className="admin-news-loading">
                            <div className="admin-news-spinner"></div>

                            <p>
                                Loading articles...
                            </p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="admin-news-empty">
                            <div className="admin-news-empty-icon">
                                📰
                            </div>

                            <h3>
                                No articles yet
                            </h3>

                            <p>
                                Create your first news article
                                to get started.
                            </p>

                            <Link
                                to="/admin/news/create"
                                className="admin-news-empty-button"
                            >
                                Create First Article
                            </Link>
                        </div>
                    ) : (
                        <div className="admin-news-table-wrapper">
                            <table className="admin-news-table">
                                <thead>
                                    <tr>
                                        <th>ARTICLE</th>
                                        <th>CATEGORY</th>
                                        <th>STATUS</th>
                                        <th>PUBLISHED</th>
                                        <th className="admin-news-actions-heading">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {news.map((article) => (
                                        <tr
                                            key={
                                                article.news_id
                                            }
                                        >
                                            <td>
                                                <div className="admin-news-article-cell">

                                                    <div className="admin-news-thumbnail">
                                                        {article.featured_image ? (
                                                            <img
                                                                src={
                                                                    article.featured_image
                                                                }
                                                                alt={
                                                                    article.image_caption ||
                                                                    article.title
                                                                }
                                                                onError={(
                                                                    event
                                                                ) => {
                                                                    event.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>
                                                                📰
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="admin-news-article-info">
                                                        <strong>
                                                            {
                                                                article.title
                                                            }
                                                        </strong>

                                                        {article.summary && (
                                                            <p>
                                                                {
                                                                    article.summary
                                                                }
                                                            </p>
                                                        )}

                                                        {article.is_featured && (
                                                            <span className="admin-news-featured-badge">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="admin-news-category">
                                                    {
                                                        article.category_name
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-news-status ${getStatusClass(
                                                        article.status
                                                    )}`}
                                                >
                                                    <span></span>

                                                    {article.status ||
                                                        "draft"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="admin-news-date">
                                                    <strong>
                                                        {formatDate(
                                                            article.published_at
                                                        )}
                                                    </strong>

                                                    {article.published_at && (
                                                        <span>
                                                            {formatTime(
                                                                article.published_at
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-news-actions">

                                                    <button
                                                        type="button"
                                                        className="admin-news-edit-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/news/edit/${article.news_id}`
                                                            )
                                                        }
                                                    >
                                                        <span>✎</span>
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="admin-news-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                article.news_id,
                                                                article.title
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            article.news_id
                                                        }
                                                    >
                                                        {deletingId ===
                                                        article.news_id ? (
                                                            <>
                                                                <span className="admin-news-button-spinner"></span>
                                                                Deleting
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>⌫</span>
                                                                Delete
                                                            </>
                                                        )}
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminNews;
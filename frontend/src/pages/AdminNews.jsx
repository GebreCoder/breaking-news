import { Fragment, useEffect, useEffectEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import AdminLayout from "../components/AdminLayout";
import ConfirmationDialog from "../components/ConfirmationDialog";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminNews() {
    const navigate = useNavigate();
    const { t, locale } = useLanguage();

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewingNewsId, setViewingNewsId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadNews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/news/admin/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || t("adminNews.loadFailed")
                );
            }

            setNews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading news:", error);

            setError(
                error.message || t("adminNews.loadError")
            );
        } finally {
            setLoading(false);
        }
    };

    const loadNewsOnMount = useEffectEvent(() => {
        loadNews();
    });

    useEffect(() => {
        Promise.resolve().then(loadNewsOnMount);
    }, []);

    const handleDelete = (id, title) => {
        setDeleteTarget({ id, title });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        const { id } = deleteTarget;
        setDeleteTarget(null);

        setMessage("");
        setError("");
        setDeletingId(id);

        try {
            const response = await fetch(
                `${API_URL}/api/news/${id}`,
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
                        t("adminNews.deleteError")
                );
            }

            setMessage(t("adminNews.deleteSuccess"));

            await loadNews();
        } catch (error) {
            console.error("Error deleting news:", error);

            setError(
                error.message || t("adminNews.deleteError")
            );
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return t("adminNews.notPublished");
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return t("adminNews.notPublished");
        }

        return date.toLocaleDateString(locale, {
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

        return date.toLocaleTimeString(locale, {
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

    const getStatusLabel = (status) => {
        if (status === "published") {
            return t("adminNews.statusPublished");
        }

        return t("adminNews.statusDraft");
    };

    return (
        <AdminLayout>
            <div className="admin-news-page">

                {/* PAGE HEADER */}
                <div className="admin-news-header">
                    <div>
                        <span className="admin-news-eyebrow">
                            {t("adminNews.eyebrow")}
                        </span>

                        <h1>
                            {t("adminNews.title")}
                        </h1>

                        <p>
                            {t("adminNews.subtitle")}
                        </p>
                    </div>

                    <LanguageToggle
                        className="lang-toggle-light admin-header-language"
                    />

                    <Link
                        to="/admin/news/create"
                        className="admin-news-create-button"
                    >
                        <span>+</span>
                        {t("adminNews.createArticle")}
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
                            aria-label={t("admin.dismissMessage")}
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
                            aria-label={t("admin.dismissError")}
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
                            <span>
                                {t("adminNews.totalArticles")}
                            </span>

                            <strong>{news.length}</strong>
                        </div>
                    </div>

                    <div className="admin-news-summary-card">
                        <div className="admin-news-summary-icon admin-news-summary-green">
                            ✓
                        </div>

                        <div>
                            <span>
                                {t("adminNews.published")}
                            </span>

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
                            <span>
                                {t("adminNews.drafts")}
                            </span>

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
                            <h2>
                                {t("adminNews.allArticles")}
                            </h2>

                            <p>
                                {t("adminNews.allArticlesText")}
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

                            {t("adminNews.refresh")}
                        </button>
                    </div>

                    {loading ? (
                        <div className="admin-news-loading">
                            <div className="admin-news-spinner"></div>

                            <p>
                                {t("adminNews.loading")}
                            </p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="admin-news-empty">
                            <div className="admin-news-empty-icon">
                                📰
                            </div>

                            <h3>
                                {t("adminNews.emptyTitle")}
                            </h3>

                            <p>
                                {t("adminNews.emptyText")}
                            </p>

                            <Link
                                to="/admin/news/create"
                                className="admin-news-empty-button"
                            >
                                {t("adminNews.emptyAction")}
                            </Link>
                        </div>
                    ) : (
                        <div className="admin-news-table-wrapper">
                            <table className="admin-news-table">
                                <thead>
                                    <tr>
                                        <th>
                                            {t("adminNews.thArticle")}
                                        </th>

                                        <th>
                                            {t("adminNews.thCategory")}
                                        </th>

                                        <th>
                                            {t("adminNews.thStatus")}
                                        </th>

                                        <th>
                                            {t(
                                                "adminNews.thPublished"
                                            )}
                                        </th>

                                        <th className="admin-news-actions-heading">
                                            {t("adminNews.thActions")}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {news.map((article) => (
                                        <Fragment key={article.news_id}>
                                        <tr>
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
                                                                {t(
                                                                    "adminNews.featured"
                                                                )}
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

                                                    {getStatusLabel(
                                                        article.status
                                                    )}
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
                                                        aria-expanded={viewingNewsId === article.news_id}
                                                        onClick={() => setViewingNewsId(
                                                            viewingNewsId === article.news_id
                                                                ? null
                                                                : article.news_id
                                                        )}
                                                    >
                                                        {t(viewingNewsId === article.news_id ? "adminNews.hideDetails" : "adminNews.details")}
                                                    </button>

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
                                                        {t("adminNews.edit")}
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
                                                                {t(
                                                                    "adminNews.deleting"
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>⌫</span>
                                                                {t(
                                                                    "adminNews.delete"
                                                                )}
                                                            </>
                                                        )}
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                        {viewingNewsId === article.news_id && (
                                            <tr className="admin-news-details-row">
                                                <td colSpan="5">
                                                    <div className="admin-news-details">
                                                        <div>
                                                            <strong>{t("adminNews.detailsSlug")}</strong>
                                                            <code>{article.slug}</code>
                                                        </div>
                                                        {article.created_at && (
                                                            <div>
                                                                <strong>{t("adminNews.detailsCreated")}</strong>
                                                                <span>{formatDate(article.created_at)}</span>
                                                            </div>
                                                        )}
                                                        {article.image_caption && (
                                                            <div>
                                                                <strong>{t("adminNews.detailsImageCaption")}</strong>
                                                                <span>{article.image_caption}</span>
                                                            </div>
                                                        )}
                                                        {article.content && (
                                                            <div className="admin-news-details-content">
                                                                <strong>{t("adminNews.detailsContent")}</strong>
                                                                <p>{article.content}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title={t("adminNews.deleteConfirmTitle")}
                description={`${t("adminNews.deleteConfirmText", { title: deleteTarget?.title || "" })}\n\n${t("adminNews.deleteConfirmWarning")}`}
                confirmLabel={t("confirmation.delete")}
                cancelLabel={t("confirmation.cancel")}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}

export default AdminNews;

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminBreakingNews() {
    const { t, locale } = useLanguage();

    const [breakingNews, setBreakingNews] = useState([]);
    const [news, setNews] = useState([]);

    const [headline, setHeadline] = useState("");
    const [newsId, setNewsId] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadData = async () => {
        try {
            const [newsResponse, breakingResponse] =
                await Promise.all([
                    fetch(
                        "http://localhost:5000/api/news"
                    ),

                    fetch(
                        "http://localhost:5000/api/breaking-news",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ]);

            const newsData =
                await newsResponse.json();

            const breakingData =
                await breakingResponse.json();

            if (!newsResponse.ok) {
                throw new Error(
                    newsData.message ||
                        t("adminBreaking.loadNewsError")
                );
            }

            if (!breakingResponse.ok) {
                throw new Error(
                    breakingData.message ||
                        t("adminBreaking.loadError")
                );
            }

            setNews(newsData);
            setBreakingNews(breakingData);
        } catch (error) {
            console.error(
                "Error loading breaking news:",
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!headline.trim()) {
            setError(t("adminBreaking.headlineRequired"));
            return;
        }

        if (
            startsAt &&
            endsAt &&
            new Date(startsAt) >= new Date(endsAt)
        ) {
            setError(t("adminBreaking.timeError"));
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/breaking-news",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        headline: headline.trim(),

                        newsId: newsId
                            ? Number(newsId)
                            : null,

                        linkUrl:
                            linkUrl.trim() || null,

                        startsAt:
                            startsAt || null,

                        endsAt:
                            endsAt || null
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("adminBreaking.createError")
                );
            }

            setMessage(
                t("adminBreaking.createSuccess")
            );

            setHeadline("");
            setNewsId("");
            setLinkUrl("");
            setStartsAt("");
            setEndsAt("");

            await loadData();
        } catch (error) {
            console.error(
                "Error creating breaking news:",
                error
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (
        id,
        currentStatus
    ) => {
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/breaking-news/${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        isActive: !currentStatus
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("adminBreaking.updateError")
                );
            }

            setMessage(
                t("adminBreaking.statusUpdated")
            );

            await loadData();
        } catch (error) {
            console.error(
                "Error updating breaking news:",
                error
            );

            setError(error.message);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            t("adminBreaking.deleteConfirm")
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/breaking-news/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("adminBreaking.deleteError")
                );
            }

            setMessage(
                t("adminBreaking.deleteSuccess")
            );

            await loadData();
        } catch (error) {
            console.error(
                "Error deleting breaking news:",
                error
            );

            setError(error.message);
        }
    };

    return (
        <AdminLayout>
            <header className="admin-topbar admin-breaking-topbar">
                <div>
                    <span className="admin-page-eyebrow">
                        {t("adminBreaking.eyebrow")}
                    </span>

                    <h1>
                        {t("adminBreaking.title")}
                    </h1>

                    <p>
                        {t("adminBreaking.subtitle")}
                    </p>
                </div>

                <div className="admin-breaking-count">
                    <span>
                        {breakingNews.length}
                    </span>

                    <small>
                        {breakingNews.length === 1
                            ? t("adminBreaking.countOne")
                            : t("adminBreaking.countMany")}
                    </small>
                </div>
            </header>

            <main className="admin-content">
                {(message || error) && (
                    <div className="admin-breaking-alerts">
                        {message && (
                            <div className="admin-breaking-alert admin-breaking-alert-success">
                                <span className="admin-breaking-alert-icon">
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        {t(
                                            "adminBreaking.successTitle"
                                        )}
                                    </strong>

                                    <p>{message}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="admin-breaking-alert admin-breaking-alert-error">
                                <span className="admin-breaking-alert-icon">
                                    !
                                </span>

                                <div>
                                    <strong>
                                        {t(
                                            "adminBreaking.errorTitle"
                                        )}
                                    </strong>

                                    <p>{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="admin-breaking-layout">
                    {/* CREATE */}
                    <section className="admin-breaking-create-card">
                        <div className="admin-breaking-section-heading">
                            <div className="admin-section-number">
                                01
                            </div>

                            <div>
                                <h2>
                                    {t("adminBreaking.createTitle")}
                                </h2>

                                <p>
                                    {t("adminBreaking.createText")}
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleCreate}
                            className="admin-breaking-form"
                        >
                            <div className="admin-breaking-field">
                                <label htmlFor="headline">
                                    {t("adminBreaking.headlineLabel")}
                                    <span>*</span>
                                </label>

                                <input
                                    id="headline"
                                    type="text"
                                    value={headline}
                                    onChange={(event) =>
                                        setHeadline(
                                            event.target.value
                                        )
                                    }
                                    placeholder={t(
                                        "adminBreaking.headlinePlaceholder"
                                    )}
                                    maxLength="300"
                                    required
                                />

                                <div className="admin-breaking-field-meta">
                                    <small>
                                        {t(
                                            "adminBreaking.headlineHelp"
                                        )}
                                    </small>

                                    <span>
                                        {headline.length}/300
                                    </span>
                                </div>
                            </div>

                            <div className="admin-breaking-field">
                                <label htmlFor="newsId">
                                    {t("adminBreaking.relatedArticle")}
                                </label>

                                <select
                                    id="newsId"
                                    value={newsId}
                                    onChange={(event) =>
                                        setNewsId(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        {t("adminBreaking.noRelated")}
                                    </option>

                                    {news.map((article) => (
                                        <option
                                            key={
                                                article.news_id
                                            }
                                            value={
                                                article.news_id
                                            }
                                        >
                                            {article.title}
                                        </option>
                                    ))}
                                </select>

                                <small>
                                    {t("adminBreaking.relatedHelp")}
                                </small>
                            </div>

                            <div className="admin-breaking-field">
                                <label htmlFor="linkUrl">
                                    {t("adminBreaking.linkUrl")}
                                </label>

                                <input
                                    id="linkUrl"
                                    type="url"
                                    value={linkUrl}
                                    onChange={(event) =>
                                        setLinkUrl(
                                            event.target.value
                                        )
                                    }
                                    placeholder="https://example.com/story"
                                />

                                <small>
                                    {t("adminBreaking.linkHelp")}
                                </small>
                            </div>

                            <div className="admin-breaking-datetime-grid">
                                <div className="admin-breaking-field">
                                    <label>
                                        {t("adminBreaking.startTime")}
                                    </label>

                                    <div className="admin-breaking-datetime">
                                        <input
                                            id="startsAtDate"
                                            type="date"
                                            value={
                                                startsAt
                                                    ? startsAt.slice(
                                                        0,
                                                        10
                                                    )
                                                    : ""
                                            }
                                            onChange={(event) => {
                                                const date =
                                                    event.target
                                                        .value;

                                                const time =
                                                    startsAt
                                                        ? startsAt.slice(
                                                            11,
                                                            16
                                                        )
                                                        : "00:00";

                                                setStartsAt(
                                                    date
                                                        ? `${date}T${time}`
                                                        : ""
                                                );
                                            }}
                                        />

                                        <input
                                            id="startsAtTime"
                                            type="time"
                                            value={
                                                startsAt
                                                    ? startsAt.slice(
                                                        11,
                                                        16
                                                    )
                                                    : ""
                                            }
                                            onChange={(event) => {
                                                const time =
                                                    event.target
                                                        .value;

                                                const date =
                                                    startsAt
                                                        ? startsAt.slice(
                                                            0,
                                                            10
                                                        )
                                                        : "";

                                                setStartsAt(
                                                    date
                                                        ? `${date}T${time}`
                                                        : ""
                                                );
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="admin-breaking-field">
                                    <label>
                                        {t("adminBreaking.endTime")}
                                    </label>

                                    <div className="admin-breaking-datetime">
                                        <input
                                            id="endsAtDate"
                                            type="date"
                                            value={
                                                endsAt
                                                    ? endsAt.slice(
                                                        0,
                                                        10
                                                    )
                                                    : ""
                                            }
                                            onChange={(event) => {
                                                const date =
                                                    event.target
                                                        .value;

                                                const time =
                                                    endsAt
                                                        ? endsAt.slice(
                                                            11,
                                                            16
                                                        )
                                                        : "00:00";

                                                setEndsAt(
                                                    date
                                                        ? `${date}T${time}`
                                                        : ""
                                                );
                                            }}
                                        />

                                        <input
                                            id="endsAtTime"
                                            type="time"
                                            value={
                                                endsAt
                                                    ? endsAt.slice(
                                                        11,
                                                        16
                                                    )
                                                    : ""
                                            }
                                            onChange={(event) => {
                                                const time =
                                                    event.target
                                                        .value;

                                                const date =
                                                    endsAt
                                                        ? endsAt.slice(
                                                            0,
                                                            10
                                                        )
                                                        : "";

                                                setEndsAt(
                                                    date
                                                        ? `${date}T${time}`
                                                        : ""
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-breaking-form-actions">
                                <button
                                    type="submit"
                                    className="admin-breaking-create-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="admin-breaking-spinner"></span>
                                            {t("adminBreaking.creating")}
                                        </>
                                    ) : (
                                        <>
                                            <span className="admin-breaking-button-icon">
                                                +
                                            </span>
                                            {t("adminBreaking.createAction")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* INFORMATION PANEL */}
                    <aside className="admin-breaking-info-card">
                        <div className="admin-breaking-info-icon">
                            !
                        </div>

                        <h3>
                            {t("adminBreaking.aboutTitle")}
                        </h3>

                        <p>
                            {t("adminBreaking.aboutText")}
                        </p>

                        <div className="admin-breaking-info-list">
                            <div>
                                <span>01</span>

                                <p>
                                    {t("adminBreaking.tip1")}
                                </p>
                            </div>

                            <div>
                                <span>02</span>

                                <p>
                                    {t("adminBreaking.tip2")}
                                </p>
                            </div>

                            <div>
                                <span>03</span>

                                <p>
                                    {t("adminBreaking.tip3")}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* EXISTING ALERTS */}
                <section className="admin-breaking-list-card">
                    <div className="admin-breaking-list-header">
                        <div>
                            <div className="admin-breaking-list-title">
                                <span className="admin-section-number">
                                    02
                                </span>

                                <div>
                                    <h2>
                                        {t("adminBreaking.listTitle")}
                                    </h2>

                                    <p>
                                        {t("adminBreaking.listText")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-breaking-total">
                            <strong>
                                {breakingNews.length}
                            </strong>

                            <span>
                                {breakingNews.length === 1
                                    ? t("adminBreaking.totalOne")
                                    : t("adminBreaking.totalMany")}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-breaking-state">
                            <span className="admin-breaking-large-spinner"></span>

                            <h3>
                                {t("adminBreaking.loading")}
                            </h3>

                            <p>
                                {t("adminBreaking.loadingText")}
                            </p>
                        </div>
                    ) : breakingNews.length === 0 ? (
                        <div className="admin-breaking-state">
                            <div className="admin-breaking-empty-icon">
                                !
                            </div>

                            <h3>
                                {t("adminBreaking.emptyTitle")}
                            </h3>

                            <p>
                                {t("adminBreaking.emptyText")}
                            </p>
                        </div>
                    ) : (
                        <div className="admin-breaking-table-wrapper">
                            <table className="admin-breaking-table">
                                <thead>
                                    <tr>
                                        <th>
                                            {t("adminBreaking.thHeadline")}
                                        </th>

                                        <th>
                                            {t("adminBreaking.thRelated")}
                                        </th>

                                        <th>
                                            {t("adminBreaking.thStatus")}
                                        </th>

                                        <th>
                                            {t("adminBreaking.thSchedule")}
                                        </th>

                                        <th>
                                            {t("adminBreaking.thActions")}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {breakingNews.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.breaking_news_id
                                                }
                                            >
                                                <td>
                                                    <div className="admin-breaking-headline-cell">
                                                        <div className="admin-breaking-live-dot">
                                                            <span></span>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    item.headline
                                                                }
                                                            </strong>

                                                            {item.link_url && (
                                                                <small>
                                                                    {t(
                                                                        "adminBreaking.externalLink"
                                                                    )}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="admin-breaking-related">
                                                        {
                                                            item.news_title ||
                                                            t(
                                                                "adminBreaking.noRelated"
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            item.is_active
                                                                ? "admin-breaking-status active"
                                                                : "admin-breaking-status inactive"
                                                        }
                                                    >
                                                        <span></span>

                                                        {item.is_active
                                                            ? t(
                                                                  "adminBreaking.active"
                                                              )
                                                            : t(
                                                                  "adminBreaking.inactive"
                                                              )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="admin-breaking-schedule">
                                                        <div>
                                                            <span>
                                                                {t(
                                                                    "adminBreaking.scheduleStart"
                                                                )}
                                                            </span>

                                                            <strong>
                                                                {item.starts_at
                                                                    ? new Date(
                                                                          item.starts_at
                                                                      ).toLocaleString(
                                                                          locale
                                                                      )
                                                                    : t(
                                                                          "adminBreaking.immediately"
                                                                      )}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                {t(
                                                                    "adminBreaking.scheduleEnd"
                                                                )}
                                                            </span>

                                                            <strong>
                                                                {item.ends_at
                                                                    ? new Date(
                                                                          item.ends_at
                                                                      ).toLocaleString(
                                                                          locale
                                                                      )
                                                                    : t(
                                                                          "adminBreaking.noEndTime"
                                                                      )}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-breaking-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-breaking-action-button"
                                                            onClick={() =>
                                                                handleToggle(
                                                                    item.breaking_news_id,
                                                                    item.is_active
                                                                )
                                                            }
                                                        >
                                                            {item.is_active
                                                                ? t(
                                                                      "adminBreaking.deactivate"
                                                                  )
                                                                : t(
                                                                      "adminBreaking.activate"
                                                                  )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-breaking-action-button danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.breaking_news_id
                                                                )
                                                            }
                                                        >
                                                            {t("adminNews.delete")}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </AdminLayout>
    );
}

export default AdminBreakingNews;

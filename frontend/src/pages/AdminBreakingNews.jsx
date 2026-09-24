import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminBreakingNews() {
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
                    "Failed to load news"
                );
            }

            if (!breakingResponse.ok) {
                throw new Error(
                    breakingData.message ||
                    "Failed to load breaking news"
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
            setError("Headline is required.");
            return;
        }

        if (
            startsAt &&
            endsAt &&
            new Date(startsAt) >= new Date(endsAt)
        ) {
            setError(
                "End time must be later than start time."
            );
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
                    "Failed to create breaking news"
                );
            }

            setMessage(
                "Breaking news created successfully."
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
                    "Failed to update breaking news"
                );
            }

            setMessage(
                "Breaking news status updated."
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
            "Are you sure you want to delete this breaking news item?"
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
                    "Failed to delete breaking news"
                );
            }

            setMessage(
                "Breaking news deleted successfully."
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
                        LIVE CONTENT
                    </span>

                    <h1>Breaking News</h1>

                    <p>
                        Manage urgent news alerts displayed
                        across the public website.
                    </p>
                </div>

                <div className="admin-breaking-count">
                    <span>
                        {breakingNews.length}
                    </span>

                    <small>
                        {breakingNews.length === 1
                            ? "Alert"
                            : "Alerts"}
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
                                        Action completed
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
                                        Something went wrong
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
                                    Create Breaking Alert
                                </h2>

                                <p>
                                    Publish an urgent headline
                                    to the site's breaking news
                                    area.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleCreate}
                            className="admin-breaking-form"
                        >
                            <div className="admin-breaking-field">
                                <label htmlFor="headline">
                                    Headline
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
                                    placeholder="Enter breaking news headline"
                                    maxLength="300"
                                    required
                                />

                                <div className="admin-breaking-field-meta">
                                    <small>
                                        Keep the headline concise
                                        and easy to scan.
                                    </small>

                                    <span>
                                        {headline.length}/300
                                    </span>
                                </div>
                            </div>

                            <div className="admin-breaking-field">
                                <label htmlFor="newsId">
                                    Related Article
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
                                        No related article
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
                                    Optionally connect this alert
                                    to an existing article.
                                </small>
                            </div>

                            <div className="admin-breaking-field">
                                <label htmlFor="linkUrl">
                                    Link URL
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
                                    Optional external destination
                                    for the breaking alert.
                                </small>
                            </div>

                            <div className="admin-breaking-datetime-grid">
                                <div className="admin-breaking-field">
                                    <label>
                                        Start Time
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
                                        End Time
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
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="admin-breaking-button-icon">
                                                +
                                            </span>
                                            Create Breaking News
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
                            About Breaking Alerts
                        </h3>

                        <p>
                            Breaking news alerts are designed
                            for important stories that need
                            immediate visibility.
                        </p>

                        <div className="admin-breaking-info-list">
                            <div>
                                <span>01</span>

                                <p>
                                    Use a short, clear headline
                                    that can be understood quickly.
                                </p>
                            </div>

                            <div>
                                <span>02</span>

                                <p>
                                    Connect an existing article
                                    when a full story is available.
                                </p>
                            </div>

                            <div>
                                <span>03</span>

                                <p>
                                    Set start and end times when
                                    an alert should only appear
                                    temporarily.
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
                                        Breaking News Alerts
                                    </h2>

                                    <p>
                                        Manage your existing
                                        breaking news alerts.
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
                                    ? "total alert"
                                    : "total alerts"}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-breaking-state">
                            <span className="admin-breaking-large-spinner"></span>

                            <h3>
                                Loading breaking news
                            </h3>

                            <p>
                                Please wait while the alert
                                list is loaded.
                            </p>
                        </div>
                    ) : breakingNews.length === 0 ? (
                        <div className="admin-breaking-state">
                            <div className="admin-breaking-empty-icon">
                                !
                            </div>

                            <h3>
                                No breaking news alerts
                            </h3>

                            <p>
                                Create a breaking news alert
                                using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-breaking-table-wrapper">
                            <table className="admin-breaking-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Headline
                                        </th>

                                        <th>
                                            Related Article
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Schedule
                                        </th>

                                        <th>
                                            Actions
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
                                                                    External
                                                                    link
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="admin-breaking-related">
                                                        {
                                                            item.news_title ||
                                                            "No related article"
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
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="admin-breaking-schedule">
                                                        <div>
                                                            <span>
                                                                START
                                                            </span>

                                                            <strong>
                                                                {item.starts_at
                                                                    ? new Date(
                                                                        item.starts_at
                                                                    ).toLocaleString()
                                                                    : "Immediately"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                END
                                                            </span>

                                                            <strong>
                                                                {item.ends_at
                                                                    ? new Date(
                                                                        item.ends_at
                                                                    ).toLocaleString()
                                                                    : "No end time"}
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
                                                                ? "Deactivate"
                                                                : "Activate"}
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
                                                            Delete
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
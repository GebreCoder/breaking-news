import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function CreateNews() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [categories, setCategories] = useState([]);
    const [media, setMedia] = useState([]);

    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [featuredImage, setFeaturedImage] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [status, setStatus] = useState("draft");
    const [isFeatured, setIsFeatured] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/categories"
                );

                const data = await response.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error(
                    "Error loading categories:",
                    error
                );
            }
        };

        const loadMedia = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/media",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (Array.isArray(data)) {
                    setMedia(data);
                }
            } catch (error) {
                console.error(
                    "Error loading media:",
                    error
                );
            }
        };

        loadCategories();
        loadMedia();
    }, [token]);

    const handleMediaSelect = (event) => {
        const selectedMediaId = event.target.value;

        if (!selectedMediaId) {
            setFeaturedImage("");
            return;
        }

        const selectedMedia = media.find(
            (item) =>
                String(item.media_id) === selectedMediaId
        );

        if (selectedMedia) {
            setFeaturedImage(
                `http://localhost:5000${selectedMedia.file_url}`
            );

            if (
                !imageCaption &&
                selectedMedia.alt_text
            ) {
                setImageCaption(
                    selectedMedia.alt_text
                );
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/news",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        categoryId: Number(categoryId),
                        title,
                        summary,
                        content,
                        featuredImage,
                        imageCaption,
                        status,
                        isFeatured
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        t("createNews.createError")
                );
                return;
            }

            setSuccess(t("createNews.successText"));

            setTimeout(() => {
                navigate("/admin/news");
            }, 1000);

        } catch (error) {
            console.error(
                "Error creating article:",
                error
            );

            setError(t("createNews.connectionError"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>

            {/* PAGE HEADER */}
            <header className="admin-topbar create-news-topbar">

                <div>
                    <span className="admin-page-eyebrow">
                        {t("createNews.eyebrow")}
                    </span>

                    <h1>
                        {t("createNews.title")}
                    </h1>

                    <p>
                        {t("createNews.subtitle")}
                    </p>
                </div>

                <LanguageToggle
                    className="lang-toggle-light admin-header-language"
                />

                <Link
                    to="/admin/news"
                    className="admin-secondary-button"
                >
                    ← {t("createNews.backToNews")}
                </Link>

            </header>

            <main className="admin-content">

                <form
                    className="create-news-form"
                    onSubmit={handleSubmit}
                >

                    {/* ALERTS */}

                    {error && (
                        <div
                            className="create-news-alert create-news-alert-error"
                            role="alert"
                        >
                            <span className="create-news-alert-icon">
                                !
                            </span>

                            <div>
                                <strong>
                                    {t("createNews.errorTitle")}
                                </strong>

                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div
                            className="create-news-alert create-news-alert-success"
                            role="status"
                        >
                            <span className="create-news-alert-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    {t("createNews.successTitle")}
                                </strong>

                                <p>
                                    {t("createNews.successText")}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="create-news-layout">

                        {/* MAIN EDITOR */}

                        <div className="create-news-main">

                            <section className="create-news-section">

                                <div className="create-news-section-heading">
                                    <div className="create-news-section-number">
                                        01
                                    </div>

                                    <div>
                                        <h2>
                                            {t(
                                                "createNews.infoTitle"
                                            )}
                                        </h2>

                                        <p>
                                            {t(
                                                "createNews.infoText"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="title">
                                        {t("createNews.titleLabel")}
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(
                                                event.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "createNews.titlePlaceholder"
                                        )}
                                        maxLength="300"
                                        required
                                    />

                                    <div className="create-news-field-footer">
                                        <small>
                                            {t(
                                                "createNews.titleHelp"
                                            )}
                                        </small>

                                        <span>
                                            {title.length}/300
                                        </span>
                                    </div>

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="category">
                                        {t("createNews.categoryLabel")}
                                        <span>*</span>
                                    </label>

                                    <select
                                        id="category"
                                        value={categoryId}
                                        onChange={(event) =>
                                            setCategoryId(
                                                event.target.value
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            {t(
                                                "createNews.selectCategory"
                                            )}
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.category_id
                                                    }
                                                    value={
                                                        category.category_id
                                                    }
                                                >
                                                    {category.name}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    {categories.length === 0 && (
                                        <small className="create-news-help">
                                            {t(
                                                "createNews.noCategories"
                                            )}{" "}
                                            <Link to="/admin/categories">
                                                {t(
                                                    "createNews.createCategoryLink"
                                                )}
                                            </Link>
                                        </small>
                                    )}

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="summary">
                                        {t("createNews.summaryLabel")}
                                    </label>

                                    <textarea
                                        id="summary"
                                        value={summary}
                                        onChange={(event) =>
                                            setSummary(
                                                event.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "createNews.summaryPlaceholder"
                                        )}
                                        rows="4"
                                    />

                                    <small className="create-news-help">
                                        {t("createNews.summaryHelp")}
                                    </small>

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="content">
                                        {t("createNews.contentLabel")}
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        id="content"
                                        className="create-news-content-editor"
                                        value={content}
                                        onChange={(event) =>
                                            setContent(
                                                event.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "createNews.contentPlaceholder"
                                        )}
                                        rows="18"
                                        required
                                    />

                                    <div className="create-news-field-footer">
                                        <small>
                                            {t(
                                                "createNews.contentHelp"
                                            )}
                                        </small>

                                        <span>
                                            {content.length} {t(
                                                "createNews.characters"
                                            )}
                                        </span>
                                    </div>

                                </div>

                            </section>

                            {/* IMAGE SECTION */}

                            <section className="create-news-section">

                                <div className="create-news-section-heading">
                                    <div className="create-news-section-number">
                                        02
                                    </div>

                                    <div>
                                        <h2>
                                            {t(
                                                "createNews.imageTitle"
                                            )}
                                        </h2>

                                        <p>
                                            {t(
                                                "createNews.imageText"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="media">
                                        {t("createNews.mediaLabel")}
                                    </label>

                                    <select
                                        id="media"
                                        onChange={handleMediaSelect}
                                        defaultValue=""
                                    >
                                        <option value="">
                                            {t(
                                                "createNews.selectMedia"
                                            )}
                                        </option>

                                        {media.map((item) => (
                                            <option
                                                key={item.media_id}
                                                value={item.media_id}
                                            >
                                                {item.file_name}
                                            </option>
                                        ))}
                                    </select>

                                    {media.length === 0 && (
                                        <small className="create-news-help">
                                            {t(
                                                "createNews.noImages"
                                            )}{" "}
                                            <Link to="/admin/media">
                                                {t(
                                                    "createNews.openMediaLink"
                                                )}
                                            </Link>
                                        </small>
                                    )}

                                </div>

                                {featuredImage && (
                                    <div className="create-news-image-preview">

                                        <img
                                            src={featuredImage}
                                            alt={
                                                imageCaption ||
                                                t(
                                                    "createNews.previewAlt"
                                                )
                                            }
                                        />

                                        <div className="create-news-image-preview-label">
                                            {t(
                                                "createNews.previewLabel"
                                            )}
                                        </div>

                                    </div>
                                )}

                                <div className="create-news-form-group">

                                    <label htmlFor="featuredImage">
                                        {t("createNews.imageUrl")}
                                    </label>

                                    <input
                                        id="featuredImage"
                                        type="url"
                                        value={featuredImage}
                                        onChange={(event) =>
                                            setFeaturedImage(
                                                event.target.value
                                            )
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />

                                    <small className="create-news-help">
                                        {t("createNews.imageUrlHelp")}
                                    </small>

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="imageCaption">
                                        {t("createNews.captionLabel")}
                                    </label>

                                    <input
                                        id="imageCaption"
                                        type="text"
                                        value={imageCaption}
                                        onChange={(event) =>
                                            setImageCaption(
                                                event.target.value
                                            )
                                        }
                                        placeholder={t(
                                            "createNews.captionPlaceholder"
                                        )}
                                    />

                                </div>

                            </section>

                        </div>

                        {/* SIDEBAR */}

                        <aside className="create-news-sidebar">

                            <section className="create-news-sidebar-card">

                                <div className="create-news-sidebar-heading">
                                    <span className="create-news-sidebar-icon">
                                        P
                                    </span>

                                    <div>
                                        <h2>
                                            {t("createNews.publishing")}
                                        </h2>

                                        <p>
                                            {t(
                                                "createNews.publishingText"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="status">
                                        {t("createNews.status")}
                                    </label>

                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(event) =>
                                            setStatus(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="draft">
                                            {t(
                                                "createNews.draft"
                                            )}
                                        </option>

                                        <option value="published">
                                            {t(
                                                "createNews.published"
                                            )}
                                        </option>
                                    </select>

                                </div>

                                <label className="create-news-featured-toggle">

                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(event) =>
                                            setIsFeatured(
                                                event.target.checked
                                            )
                                        }
                                    />

                                    <span className="create-news-custom-check">
                                        ✓
                                    </span>

                                    <span className="create-news-toggle-text">
                                        <strong>
                                            {t(
                                                "createNews.featureToggle"
                                            )}
                                        </strong>

                                        <small>
                                            {t(
                                                "createNews.featureToggleText"
                                            )}
                                        </small>
                                    </span>

                                </label>

                            </section>

                            {/* ARTICLE TIPS */}

                            <section className="create-news-sidebar-card create-news-tips">

                                <div className="create-news-sidebar-heading">

                                    <span className="create-news-sidebar-icon">
                                        i
                                    </span>

                                    <div>
                                        <h2>
                                            {t(
                                                "createNews.tipsTitle"
                                            )}
                                        </h2>

                                        <p>
                                            {t(
                                                "createNews.tipsText"
                                            )}
                                        </p>
                                    </div>

                                </div>

                                <ul>
                                    <li>
                                        {t(
                                            "createNews.tip1"
                                        )}
                                    </li>

                                    <li>
                                        {t(
                                            "createNews.tip2"
                                        )}
                                    </li>

                                    <li>
                                        {t(
                                            "createNews.tip3"
                                        )}
                                    </li>

                                    <li>
                                        {t(
                                            "createNews.tip4"
                                        )}
                                    </li>
                                </ul>

                            </section>

                        </aside>

                    </div>

                    {/* ACTIONS */}

                    <div className="create-news-actions">

                        <Link
                            to="/admin/news"
                            className="admin-secondary-button"
                        >
                            {t("createNews.cancel")}
                        </Link>

                        <button
                            type="submit"
                            className="admin-primary-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="create-news-button-spinner"></span>
                                    {t("createNews.saving")}
                                </>
                            ) : (
                                <>
                                    {t("createNews.createAction")}
                                    <span className="create-news-submit-arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </main>

        </AdminLayout>
    );
}

export default CreateNews;

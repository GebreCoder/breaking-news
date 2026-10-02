import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function EditNews() {
    const { id } = useParams();
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("adminToken");

    // ============================================================
    // LOAD ARTICLE + CATEGORIES + MEDIA
    // ============================================================

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    articleResponse,
                    categoriesResponse,
                    mediaResponse
                ] = await Promise.all([
                    fetch(
                        `http://localhost:5000/api/news/admin/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),

                    fetch(
                        "http://localhost:5000/api/categories"
                    ),

                    fetch(
                        "http://localhost:5000/api/media",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ]);

                const articleData =
                    await articleResponse.json();

                const categoriesData =
                    await categoriesResponse.json();

                const mediaData =
                    await mediaResponse.json();

                if (!articleResponse.ok) {
                    throw new Error(
                        articleData.message ||
                            t("editNews.loadFailed")
                    );
                }

                if (!categoriesResponse.ok) {
                    throw new Error(
                        categoriesData.message ||
                            t("editNews.loadCategoriesFailed")
                    );
                }

                if (!mediaResponse.ok) {
                    throw new Error(
                        mediaData.message ||
                            t("editNews.loadMediaFailed")
                    );
                }

                const article = articleData;

                setTitle(article.title || "");

                setCategoryId(
                    article.category_id
                        ? String(article.category_id)
                        : ""
                );

                setSummary(article.summary || "");
                setContent(article.content || "");

                setFeaturedImage(
                    article.featured_image || ""
                );

                setImageCaption(
                    article.image_caption || ""
                );

                setStatus(
                    article.status || "draft"
                );

                setIsFeatured(
                    Boolean(article.is_featured)
                );

                setCategories(
                    Array.isArray(categoriesData)
                        ? categoriesData
                        : []
                );

                setMedia(
                    Array.isArray(mediaData)
                        ? mediaData
                        : []
                );
            } catch (error) {
                console.error(
                    "Error loading edit data:",
                    error
                );

                setError(
                    error.message ||
                        t("editNews.loadError")
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, t, token]);

    // ============================================================
    // MEDIA SELECT
    // ============================================================

    const handleMediaSelect = (event) => {
        const selectedMediaId =
            event.target.value;

        if (!selectedMediaId) {
            return;
        }

        const selectedMedia = media.find(
            (item) =>
                String(item.media_id) ===
                selectedMediaId
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

    // ============================================================
    // SAVE CHANGES
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!categoryId) {
            setError(t("editNews.validationCategory"));
            return;
        }

        if (!title.trim()) {
            setError(t("editNews.validationTitle"));
            return;
        }

        if (!content.trim()) {
            setError(t("editNews.validationContent"));
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `http://localhost:5000/api/news/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        categoryId: Number(categoryId),
                        title: title.trim(),
                        summary: summary.trim(),
                        content,
                        featuredImage:
                            featuredImage.trim(),
                        imageCaption:
                            imageCaption.trim(),
                        status,
                        isFeatured
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("editNews.updateError")
                );
            }

            setSuccess(t("editNews.updated"));

            setTimeout(() => {
                navigate("/admin/news");
            }, 1000);
        } catch (error) {
            console.error(
                "Error updating article:",
                error
            );

            setError(
                error.message ||
                    t("editNews.updateError")
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <AdminLayout>
                <div className="edit-news-loading-page">
                    <div className="edit-news-spinner"></div>

                    <h2>
                        {t("editNews.loading")}
                    </h2>

                    <p>
                        {t("editNews.loadingText")}
                    </p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="edit-news-page">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="edit-news-header">

                    <div className="edit-news-header-content">

                        <span className="edit-news-eyebrow">
                            {t("editNews.eyebrow")}
                        </span>

                        <h1>
                            {t("editNews.title")}
                        </h1>

                        <p>
                            {t("editNews.subtitle")}
                        </p>

                    </div>

                    <LanguageToggle
                        className="lang-toggle-light admin-header-language"
                    />

                    <Link
                        to="/admin/news"
                        className="edit-news-back"
                    >
                        <span>←</span>
                        {t("editNews.backToNews")}
                    </Link>

                </div>

                {/* ==================================================
                    ALERTS
                ================================================== */}

                {error && (
                    <div className="edit-news-alert edit-news-alert-error">

                        <span className="edit-news-alert-icon">
                            !
                        </span>

                        <span className="edit-news-alert-message">
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label={t("admin.closeError")}
                        >
                            ×
                        </button>

                    </div>
                )}

                {success && (
                    <div className="edit-news-alert edit-news-alert-success">

                        <span className="edit-news-alert-icon">
                            ✓
                        </span>

                        <span className="edit-news-alert-message">
                            {success}
                        </span>

                    </div>
                )}

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="edit-news-form"
                >

                    {/* ==================================================
                        MAIN CONTENT
                    ================================================== */}

                    <div className="edit-news-main">

                        {/* ==================================================
                            ARTICLE INFORMATION
                        ================================================== */}

                        <section className="edit-news-section">

                            <div className="edit-news-section-heading">

                                <span className="edit-news-section-number">
                                    01
                                </span>

                                <div>
                                    <h2>
                                        {t("editNews.infoTitle")}
                                    </h2>

                                    <p>
                                        {t("editNews.infoText")}
                                    </p>
                                </div>

                            </div>

                            {/* TITLE */}

                            <div className="edit-news-field">

                                <div className="edit-news-label-row">

                                    <label htmlFor="title">
                                        {t("editNews.titleLabel")}
                                    </label>

                                    <span>
                                        {title.length}/200
                                    </span>

                                </div>

                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    maxLength={200}
                                    placeholder={t(
                                        "editNews.titlePlaceholder"
                                    )}
                                    required
                                />

                            </div>

                            {/* CATEGORY */}

                            <div className="edit-news-field">

                                <label htmlFor="category">
                                    {t("editNews.categoryLabel")}
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
                                            "editNews.selectCategory"
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

                            </div>

                            {/* SUMMARY */}

                            <div className="edit-news-field">

                                <div className="edit-news-label-row">

                                    <label htmlFor="summary">
                                        {t("editNews.summaryLabel")}
                                    </label>

                                    <span>
                                        {summary.length}/500
                                    </span>

                                </div>

                                <textarea
                                    id="summary"
                                    value={summary}
                                    onChange={(event) =>
                                        setSummary(
                                            event.target.value
                                        )
                                    }
                                    maxLength={500}
                                    rows={4}
                                    placeholder={t(
                                        "editNews.summaryPlaceholder"
                                    )}
                                />

                            </div>

                            {/* CONTENT */}

                            <div className="edit-news-field">

                                <div className="edit-news-label-row">

                                    <label htmlFor="content">
                                        {t("editNews.contentLabel")}
                                    </label>

                                    <span>
                                        {t(
                                            "editNews.characters",
                                            {
                                                count:
                                                    content.length
                                            }
                                        )}
                                    </span>

                                </div>

                                <textarea
                                    id="content"
                                    className="edit-news-content"
                                    value={content}
                                    onChange={(event) =>
                                        setContent(
                                            event.target.value
                                        )
                                    }
                                    rows={18}
                                    placeholder={t(
                                        "editNews.contentPlaceholder"
                                    )}
                                    required
                                />

                            </div>

                        </section>

                        {/* ==================================================
                            FEATURED IMAGE
                        ================================================== */}

                        <section className="edit-news-section">

                            <div className="edit-news-section-heading">

                                <span className="edit-news-section-number">
                                    02
                                </span>

                                <div>
                                    <h2>
                                        {t("editNews.imageTitle")}
                                    </h2>

                                    <p>
                                        {t("editNews.imageText")}
                                    </p>
                                </div>

                            </div>

                            {/* MEDIA LIBRARY */}

                            <div className="edit-news-field">

                                <label htmlFor="media">
                                    {t("editNews.mediaLabel")}
                                </label>

                                <select
                                    id="media"
                                    value=""
                                    onChange={
                                        handleMediaSelect
                                    }
                                >

                                    <option value="">
                                        {t("editNews.selectMedia")}
                                    </option>

                                    {media.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.media_id
                                                }
                                                value={
                                                    item.media_id
                                                }
                                            >
                                                {
                                                    item.original_name ||
                                                    item.file_name ||
                                                    t(
                                                        "editNews.mediaFallback",
                                                        {
                                                            id: item.media_id
                                                        }
                                                    )
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* IMAGE PREVIEW */}

                            {featuredImage && (
                                <div className="edit-news-image-preview">

                                    <div className="edit-news-image-preview-media">

                                        <img
                                            src={
                                                featuredImage.startsWith(
                                                    "http"
                                                )
                                                    ? featuredImage
                                                    : `http://localhost:5000${featuredImage}`
                                            }
                                            alt={
                                                imageCaption ||
                                                title ||
                                                t(
                                                    "adminNews.featured"
                                                )
                                            }
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    </div>

                                    <div className="edit-news-image-preview-info">

                                        <strong>
                                            {t(
                                                "editNews.currentImage"
                                            )}
                                        </strong>

                                        <p>
                                            {t(
                                                "editNews.currentImageText"
                                            )}
                                        </p>

                                    </div>

                                </div>
                            )}

                            {/* IMAGE URL */}

                            <div className="edit-news-field">

                                <label htmlFor="featuredImage">
                                    {t("editNews.imageUrl")}
                                </label>

                                <input
                                    id="featuredImage"
                                    type="text"
                                    value={featuredImage}
                                    onChange={(event) =>
                                        setFeaturedImage(
                                            event.target.value
                                        )
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />

                            </div>

                            {/* CAPTION */}

                            <div className="edit-news-field">

                                <label htmlFor="imageCaption">
                                    {t("editNews.captionLabel")}
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
                                        "editNews.captionPlaceholder"
                                    )}
                                />

                            </div>

                        </section>

                    </div>

                    {/* ==================================================
                        SIDEBAR
                    ================================================== */}

                    <aside className="edit-news-sidebar">

                        {/* PUBLISHING */}

                        <section className="edit-news-side-card">

                            <div className="edit-news-side-heading">

                                <div className="edit-news-side-icon">
                                    ◉
                                </div>

                                <div>
                                    <h3>
                                        {t("editNews.publishing")}
                                    </h3>

                                    <p>
                                        {t(
                                            "editNews.publishingText"
                                        )}
                                    </p>
                                </div>

                            </div>

                            <div className="edit-news-field">

                                <label htmlFor="status">
                                    {t("editNews.status")}
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
                                        {t("editNews.draft")}
                                    </option>

                                    <option value="published">
                                        {t("editNews.published")}
                                    </option>

                                </select>

                            </div>

                            {/* FEATURED TOGGLE */}

                            <label className="edit-news-toggle">

                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(event) =>
                                        setIsFeatured(
                                            event.target.checked
                                        )
                                    }
                                />

                                <span className="edit-news-toggle-slider"></span>

                                <span className="edit-news-toggle-content">

                                    <strong>
                                        {t(
                                            "editNews.featuredArticle"
                                        )}
                                    </strong>

                                    <small>
                                        {t(
                                            "editNews.featuredText"
                                        )}
                                    </small>

                                </span>

                            </label>

                        </section>

                        {/* BEFORE SAVING */}

                        <section className="edit-news-side-card edit-news-tips">

                            <div className="edit-news-side-heading">

                                <div className="edit-news-side-icon">
                                    ✓
                                </div>

                                <div>
                                    <h3>
                                        {t("editNews.beforeSaving")}
                                    </h3>

                                    <p>
                                        {t(
                                            "editNews.beforeSavingText"
                                        )}
                                    </p>
                                </div>

                            </div>

                            <ul>

                                <li>
                                    {t("editNews.check1")}
                                </li>

                                <li>
                                    {t("editNews.check2")}
                                </li>

                                <li>
                                    {t("editNews.check3")}
                                </li>

                                <li>
                                    {t("editNews.check4")}
                                </li>

                                <li>
                                    {t("editNews.check5")}
                                </li>

                            </ul>

                        </section>

                    </aside>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="edit-news-actions">

                        <Link
                            to="/admin/news"
                            className="edit-news-cancel"
                        >
                            {t("editNews.cancel")}
                        </Link>

                        <button
                            type="submit"
                            className="edit-news-submit"
                            disabled={saving}
                        >

                            {saving ? (
                                <>
                                    <span className="edit-news-button-spinner"></span>

                                    {t("editNews.saving")}
                                </>
                            ) : (
                                <>
                                    {t("editNews.save")}

                                    <span>
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>
        </AdminLayout>
    );
}

export default EditNews;

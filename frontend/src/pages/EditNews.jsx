import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function EditNews() {
    const { id } = useParams();
    const navigate = useNavigate();

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
                        "Failed to load article."
                    );
                }

                if (!categoriesResponse.ok) {
                    throw new Error(
                        categoriesData.message ||
                        "Failed to load categories."
                    );
                }

                if (!mediaResponse.ok) {
                    throw new Error(
                        mediaData.message ||
                        "Failed to load media."
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
                    "Unable to load the article."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, token]);

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
            setError("Please select a category.");
            return;
        }

        if (!title.trim()) {
            setError("Article title is required.");
            return;
        }

        if (!content.trim()) {
            setError("Article content is required.");
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
                    "Failed to update article."
                );
            }

            setSuccess(
                "Article updated successfully."
            );

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
                "Unable to update the article."
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
                        Loading article...
                    </h2>

                    <p>
                        Please wait while the article
                        is being loaded.
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
                            CONTENT MANAGEMENT
                        </span>

                        <h1>
                            Edit Article
                        </h1>

                        <p>
                            Update your article content,
                            media, category, and publishing
                            settings.
                        </p>

                    </div>

                    <Link
                        to="/admin/news"
                        className="edit-news-back"
                    >
                        <span>←</span>
                        Back to News
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
                            aria-label="Close error"
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
                                        Article Information
                                    </h2>

                                    <p>
                                        Update the main
                                        information for this
                                        article.
                                    </p>
                                </div>

                            </div>


                            {/* TITLE */}

                            <div className="edit-news-field">

                                <div className="edit-news-label-row">

                                    <label htmlFor="title">
                                        Article Title
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
                                    placeholder="Enter article headline"
                                    required
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="edit-news-field">

                                <label htmlFor="category">
                                    Category
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
                                        Select a category
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
                                        Summary
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
                                    placeholder="Write a short summary of the article..."
                                />

                            </div>


                            {/* CONTENT */}

                            <div className="edit-news-field">

                                <div className="edit-news-label-row">

                                    <label htmlFor="content">
                                        Article Content
                                    </label>

                                    <span>
                                        {content.length.toLocaleString()} characters
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
                                    placeholder="Write the full article content..."
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
                                        Featured Image
                                    </h2>

                                    <p>
                                        Choose an image from
                                        the media library or
                                        provide an image URL.
                                    </p>
                                </div>

                            </div>


                            {/* MEDIA LIBRARY */}

                            <div className="edit-news-field">

                                <label htmlFor="media">
                                    Media Library
                                </label>

                                <select
                                    id="media"
                                    value=""
                                    onChange={
                                        handleMediaSelect
                                    }
                                >

                                    <option value="">
                                        Select an image
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
                                                    `Media ${item.media_id}`
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
                                                "Featured"
                                            }
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    </div>

                                    <div className="edit-news-image-preview-info">

                                        <strong>
                                            Current Featured Image
                                        </strong>

                                        <p>
                                            This image will
                                            appear with the
                                            published article.
                                        </p>

                                    </div>

                                </div>
                            )}


                            {/* IMAGE URL */}

                            <div className="edit-news-field">

                                <label htmlFor="featuredImage">
                                    Image URL
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
                                    Image Caption
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
                                    placeholder="Describe the featured image..."
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
                                        Publishing
                                    </h3>

                                    <p>
                                        Control article visibility
                                    </p>
                                </div>

                            </div>


                            <div className="edit-news-field">

                                <label htmlFor="status">
                                    Status
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
                                        Draft
                                    </option>

                                    <option value="published">
                                        Published
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
                                        Featured Article
                                    </strong>

                                    <small>
                                        Highlight this article
                                        on the homepage.
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
                                        Before Saving
                                    </h3>

                                    <p>
                                        Quick checklist
                                    </p>
                                </div>

                            </div>

                            <ul>

                                <li>
                                    Check the article title.
                                </li>

                                <li>
                                    Make sure the correct
                                    category is selected.
                                </li>

                                <li>
                                    Review the article content.
                                </li>

                                <li>
                                    Verify the publishing
                                    status.
                                </li>

                                <li>
                                    Check the featured image.
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
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="edit-news-submit"
                            disabled={saving}
                        >

                            {saving ? (
                                <>
                                    <span className="edit-news-button-spinner"></span>

                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    Save Changes

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
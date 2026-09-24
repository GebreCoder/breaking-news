import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function CreateNews() {
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
                    "Failed to create article."
                );
                return;
            }

            setSuccess(
                "Article created successfully."
            );

            setTimeout(() => {
                navigate("/admin/news");
            }, 1000);

        } catch (error) {
            console.error(
                "Error creating article:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
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
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Create Article</h1>

                    <p>
                        Write and publish a new news article.
                    </p>
                </div>

                <Link
                    to="/admin/news"
                    className="admin-secondary-button"
                >
                    ← Back to News
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
                                    Unable to create article
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
                                    Article created successfully
                                </strong>

                                <p>
                                    Redirecting you to News Management...
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
                                            Article Information
                                        </h2>

                                        <p>
                                            Add the main information for
                                            your news article.
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="title">
                                        Article Title
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
                                        placeholder="Enter a clear and engaging headline"
                                        maxLength="300"
                                        required
                                    />

                                    <div className="create-news-field-footer">
                                        <small>
                                            Write a concise headline that
                                            clearly describes the story.
                                        </small>

                                        <span>
                                            {title.length}/300
                                        </span>
                                    </div>

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="category">
                                        Category
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

                                    {categories.length === 0 && (
                                        <small className="create-news-help">
                                            No categories exist yet.{" "}
                                            <Link to="/admin/categories">
                                                Create a category first.
                                            </Link>
                                        </small>
                                    )}

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="summary">
                                        Summary
                                    </label>

                                    <textarea
                                        id="summary"
                                        value={summary}
                                        onChange={(event) =>
                                            setSummary(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Write a short summary that introduces the story..."
                                        rows="4"
                                    />

                                    <small className="create-news-help">
                                        A short summary helps readers
                                        understand the story before opening
                                        the full article.
                                    </small>

                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="content">
                                        Article Content
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
                                        placeholder="Write the full article here..."
                                        rows="18"
                                        required
                                    />

                                    <div className="create-news-field-footer">
                                        <small>
                                            Write the complete article content.
                                        </small>

                                        <span>
                                            {content.length} characters
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
                                            Featured Image
                                        </h2>

                                        <p>
                                            Choose the main image displayed
                                            with this article.
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

                                    <label htmlFor="media">
                                        Media Library
                                    </label>

                                    <select
                                        id="media"
                                        onChange={handleMediaSelect}
                                        defaultValue=""
                                    >
                                        <option value="">
                                            Select an uploaded image
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
                                            No images uploaded yet.{" "}
                                            <Link to="/admin/media">
                                                Open Media Library
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
                                                "Selected article image"
                                            }
                                        />

                                        <div className="create-news-image-preview-label">
                                            Featured Image Preview
                                        </div>

                                    </div>
                                )}

                                <div className="create-news-form-group">

                                    <label htmlFor="featuredImage">
                                        Image URL
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
                                        Select an uploaded image above or
                                        enter an external image URL.
                                    </small>

                                </div>

                                <div className="create-news-form-group">

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
                                        placeholder="Describe the image..."
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
                                            Publishing
                                        </h2>

                                        <p>
                                            Control how this article appears.
                                        </p>
                                    </div>
                                </div>

                                <div className="create-news-form-group">

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
                                            Feature this article
                                        </strong>

                                        <small>
                                            Highlight this article on the
                                            website.
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
                                            Writing Tips
                                        </h2>

                                        <p>
                                            Create stronger articles.
                                        </p>
                                    </div>

                                </div>

                                <ul>
                                    <li>
                                        Use a clear and informative headline.
                                    </li>

                                    <li>
                                        Keep the summary short and useful.
                                    </li>

                                    <li>
                                        Use the featured image that best
                                        represents the story.
                                    </li>

                                    <li>
                                        Review the article before publishing.
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
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="admin-primary-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="create-news-button-spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Create Article
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
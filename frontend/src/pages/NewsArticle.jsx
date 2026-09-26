import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";

function NewsArticle() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadArticlePage = async () => {
            setLoading(true);
            setError("");

            try {
                const [articleResponse, categoriesResponse, breakingResponse] =
                    await Promise.all([
                        fetch(`http://localhost:5000/api/news/${slug}`),
                        fetch("http://localhost:5000/api/categories"),
                        fetch("http://localhost:5000/api/breaking-news/active"),
                    ]);

                if (!articleResponse.ok) {
                    throw new Error("Article not found");
                }

                const articleData = await articleResponse.json();
                setArticle(articleData);

                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();

                    setCategories(
                        Array.isArray(categoriesData)
                            ? categoriesData
                            : []
                    );
                }

                if (breakingResponse.ok) {
                    const breakingData = await breakingResponse.json();

                    setBreakingNews(
                        Array.isArray(breakingData)
                            ? breakingData
                            : []
                    );
                }
            } catch (error) {
                console.error("Error loading article:", error);
                setError("Unable to load this article.");
            } finally {
                setLoading(false);
            }
        };

        loadArticlePage();
    }, [slug]);

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const input = form.querySelector("input");
        const query = input?.value.trim();

        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    if (loading) {
        return (
            <div className="site">
                <header className="site-header">
                    <div className="header-container">
                        <Link to="/" className="logo">
                            BREAKING <span>NEWS</span>
                        </Link>

                        <nav className="main-nav">
                            <Link to="/" className="active">
                                Home
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="article-page">
                    <div className="article-container article-loading">
                        <div className="loading-spinner"></div>

                        <h2>Loading article...</h2>

                        <p>
                            Please wait while we load the latest story.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="site">
                <header className="site-header">
                    <div className="header-container">
                        <Link to="/" className="logo">
                            BREAKING <span>NEWS</span>
                        </Link>

                        <nav className="main-nav">
                            <Link to="/" className="active">
                                Home
                            </Link>
                        </nav>

                        <form
                            className="header-search"
                            onSubmit={handleSearch}
                        >
                            <input
                                type="search"
                                placeholder="Search news..."
                                aria-label="Search news"
                            />

                            <button type="submit">
                                Search
                            </button>
                        </form>
                    </div>
                </header>

                <main className="article-page">
                    <div className="article-container article-not-found">
                        <div className="article-error-icon">
                            404
                        </div>

                        <p className="section-label">
                            STORY NOT FOUND
                        </p>

                        <h1>Article Not Found</h1>

                        <p>
                            The article you are looking for could not
                            be found or may no longer be available.
                        </p>

                        <Link
                            to="/"
                            className="article-back-link article-back-button"
                        >
                            ← Back to Breaking News
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="site">
            {/* HEADER */}
            <header className="site-header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        BREAKING <span>NEWS</span>
                    </Link>

                    <nav className="main-nav">
                        <Link to="/" className="active">
                            Home
                        </Link>

                        {categories.map((category) => (
                            <Link
                                to={`/category/${category.slug}`}
                                key={category.category_id}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    <form
                        className="header-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            placeholder="Search news..."
                            aria-label="Search news"
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>
                </div>
            </header>

            {/* BREAKING NEWS */}
            {breakingNews.length > 0 && (
                <div className="breaking-bar">
                    <div className="breaking-container">
                        <div className="breaking-label">
                            BREAKING
                        </div>

                        <div className="breaking-text">
                            {breakingNews[0].news_slug ? (
                                <Link
                                    to={`/news/${breakingNews[0].news_slug}`}
                                >
                                    {breakingNews[0].headline}
                                </Link>
                            ) : (
                                <span>
                                    {breakingNews[0].headline}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ARTICLE */}
            <main className="article-page">
                <div className="article-container">
                    <Link
                        to="/"
                        className="article-back-link"
                    >
                        ← Back to Latest News
                    </Link>

                    <article className="article-card">
                        <header className="article-header">
                            {article.category_name && (
                                <Link
                                    to={`/category/${article.category_slug || ""}`}
                                    className="category-label article-category"
                                >
                                    {article.category_name}
                                </Link>
                            )}

                            <h1>{article.title}</h1>

                            <div className="article-meta">
                                {article.published_at && (
                                    <>
                                        <span>
                                            Published{" "}
                                            {formatDate(
                                                article.published_at
                                            )}
                                        </span>

                                        <span className="article-meta-separator">
                                            •
                                        </span>

                                        <span>
                                            {formatTime(
                                                article.published_at
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>

                            {article.summary && (
                                <p className="article-summary">
                                    {article.summary}
                                </p>
                            )}
                        </header>

                        {article.featured_image && (
                            <figure className="article-image-wrapper">
                                <img
                                    src={article.featured_image}
                                    alt={
                                        article.image_caption ||
                                        article.title
                                    }
                                    className="article-image"
                                />

                                {article.image_caption && (
                                    <figcaption>
                                        {article.image_caption}
                                    </figcaption>
                                )}
                            </figure>
                        )}

                        <div className="article-content">
                            {article.content}
                        </div>
                    </article>

                    <div className="article-footer-navigation">
                        <Link
                            to="/"
                            className="article-back-link"
                        >
                            ← Back to Latest News
                        </Link>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="logo">
                            BREAKING <span>NEWS</span>
                        </div>

                        <p>
                            Reliable news, important stories,
                            and the latest developments.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Quick Links</h3>

                        <Link to="/">
                            Home
                        </Link>

                        {categories.slice(0, 5).map((category) => (
                            <Link
                                to={`/category/${category.slug}`}
                                key={category.category_id}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} Breaking News.
                        All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default NewsArticle;
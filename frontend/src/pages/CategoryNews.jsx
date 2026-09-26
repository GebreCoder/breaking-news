import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";

function CategoryNews() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCategory = async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    categoryResponse,
                    newsResponse,
                    categoriesResponse,
                    breakingResponse,
                ] = await Promise.all([
                    fetch(
                        `http://localhost:5000/api/categories/${slug}`
                    ),
                    fetch("http://localhost:5000/api/news"),
                    fetch("http://localhost:5000/api/categories"),
                    fetch("http://localhost:5000/api/breaking-news/active"),
                ]);

                if (!categoryResponse.ok) {
                    throw new Error("Category not found");
                }

                if (!newsResponse.ok) {
                    throw new Error("Unable to load news");
                }

                const categoryData =
                    await categoryResponse.json();

                const newsData =
                    await newsResponse.json();

                setCategory(categoryData);

                const categoryArticles = Array.isArray(newsData)
                    ? newsData.filter(
                          (article) =>
                              article.category_slug === slug
                      )
                    : [];

                setArticles(categoryArticles);

                if (categoriesResponse.ok) {
                    const categoriesData =
                        await categoriesResponse.json();

                    setCategories(
                        Array.isArray(categoriesData)
                            ? categoriesData
                            : []
                    );
                }

                if (breakingResponse.ok) {
                    const breakingData =
                        await breakingResponse.json();

                    setBreakingNews(
                        Array.isArray(breakingData)
                            ? breakingData
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Error loading category:",
                    error
                );

                setError(
                    "Unable to load this category."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCategory();
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
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const input = form.querySelector("input");
        const query = input?.value.trim();

        if (query) {
            navigate(
                `/search?q=${encodeURIComponent(query)}`
            );
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
                            <Link to="/">
                                Home
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="main-content">
                    <div className="category-page-loading">
                        <div className="loading-spinner"></div>

                        <h2>
                            Loading category...
                        </h2>

                        <p>
                            Please wait while we load the latest
                            stories.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="site">
                <header className="site-header">
                    <div className="header-container">
                        <Link to="/" className="logo">
                            BREAKING <span>NEWS</span>
                        </Link>

                        <nav className="main-nav">
                            <Link
                                to="/"
                                className="active"
                            >
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

                <main className="main-content">
                    <div className="category-not-found">
                        <div className="category-error-icon">
                            404
                        </div>

                        <p className="section-label">
                            CATEGORY NOT FOUND
                        </p>

                        <h1>
                            Category Not Found
                        </h1>

                        <p>
                            The category you are looking for
                            could not be found or may no longer
                            be available.
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
                        <Link to="/">
                            Home
                        </Link>

                        {categories.map((item) => (
                            <Link
                                to={`/category/${item.slug}`}
                                key={item.category_id}
                                className={
                                    item.slug === slug
                                        ? "active"
                                        : ""
                                }
                            >
                                {item.name}
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

            {/* CATEGORY CONTENT */}
            <main className="main-content category-page">
                <section className="page-heading category-heading">
                    <p className="section-label">
                        CATEGORY
                    </p>

                    <h1>
                        {category.name}
                    </h1>

                    {category.description && (
                        <p>
                            {category.description}
                        </p>
                    )}
                </section>

                {articles.length === 0 ? (
                    <div className="empty-news category-empty">
                        <div className="empty-news-icon">
                            📰
                        </div>

                        <h2>
                            No news in this category yet
                        </h2>

                        <p>
                            Published articles in this
                            category will appear here.
                        </p>

                        <Link
                            to="/"
                            className="article-back-link article-back-button"
                        >
                            ← Browse Latest News
                        </Link>
                    </div>
                ) : (
                    <section className="category-news-grid">
                        {articles.map((article) => (
                            <article
                                className="category-news-card"
                                key={article.news_id}
                            >
                                <Link
                                    to={`/news/${article.slug}`}
                                    className="category-news-image-link"
                                >
                                    {article.featured_image ? (
                                        <img
                                            src={
                                                article.featured_image
                                            }
                                            alt={
                                                article.image_caption ||
                                                article.title
                                            }
                                            className="category-news-image"
                                        />
                                    ) : (
                                        <div className="category-news-image category-news-placeholder">
                                            NEWS
                                        </div>
                                    )}
                                </Link>

                                <div className="category-news-content">
                                    {article.category_name && (
                                        <span className="category-label">
                                            {article.category_name}
                                        </span>
                                    )}

                                    <h2>
                                        <Link
                                            to={`/news/${article.slug}`}
                                        >
                                            {article.title}
                                        </Link>
                                    </h2>

                                    {article.summary && (
                                        <p>
                                            {article.summary}
                                        </p>
                                    )}

                                    <div className="category-news-footer">
                                        <span className="story-date">
                                            {formatDate(
                                                article.published_at
                                            )}
                                        </span>

                                        <Link
                                            to={`/news/${article.slug}`}
                                            className="read-story-link"
                                        >
                                            Read Story →
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
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
                        <h3>
                            Quick Links
                        </h3>

                        <Link to="/">
                            Home
                        </Link>

                        {categories.slice(0, 5).map((item) => (
                            <Link
                                to={`/category/${item.slug}`}
                                key={item.category_id}
                            >
                                {item.name}
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

export default CategoryNews;
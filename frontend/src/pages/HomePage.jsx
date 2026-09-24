import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function HomePage() {
    const navigate = useNavigate();

    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomePage = async () => {
            try {
                const [newsResponse, categoriesResponse, breakingResponse] =
                    await Promise.all([
                        fetch("http://localhost:5000/api/news"),
                        fetch("http://localhost:5000/api/categories"),
                        fetch("http://localhost:5000/api/breaking-news/active"),
                    ]);

                if (newsResponse.ok) {
                    const newsData = await newsResponse.json();
                    setNews(Array.isArray(newsData) ? newsData : []);
                }

                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(
                        Array.isArray(categoriesData) ? categoriesData : []
                    );
                }

                if (breakingResponse.ok) {
                    const breakingData = await breakingResponse.json();
                    setBreakingNews(
                        Array.isArray(breakingData) ? breakingData : []
                    );
                }
            } catch (error) {
                console.error("Error loading homepage:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHomePage();
    }, []);

    const featuredNews =
        news.find((item) => item.is_featured) || news[0] || null;

    const sideNews = news
        .filter(
            (item) =>
                item.news_id !== featuredNews?.news_id
        )
        .slice(0, 4);

    const latestNews = news
        .filter(
            (item) =>
                item.news_id !== featuredNews?.news_id &&
                !sideNews.some(
                    (sideItem) => sideItem.news_id === item.news_id
                )
        )
        .slice(0, 6);

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
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="site">

            {/* =========================
                HEADER
            ========================== */}
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

            {/* =========================
                BREAKING NEWS
            ========================== */}
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

            {/* =========================
                MAIN CONTENT
            ========================== */}
            <main className="main-content">

                {/* Page Introduction */}
                <section className="page-heading">
                    <p className="section-label">
                        TOP STORIES
                    </p>

                    <h1>
                        Latest News
                    </h1>

                    <p>
                        Stay informed with the latest headlines,
                        breaking stories, and important developments.
                    </p>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="empty-news">
                        <div className="loading-spinner"></div>

                        <h2>
                            Loading latest news...
                        </h2>
                    </div>
                )}

                {/* No News */}
                {!loading && news.length === 0 && (
                    <div className="empty-news">
                        <div className="empty-news-icon">
                            📰
                        </div>

                        <h2>
                            No news published yet
                        </h2>

                        <p>
                            Published news articles will appear here.
                        </p>
                    </div>
                )}

                {/* =========================
                    FEATURED STORIES
                ========================== */}
                {!loading && featuredNews && (
                    <section className="news-grid">

                        {/* Featured Story */}
                        <Link
                            to={`/news/${featuredNews.slug}`}
                            className="main-story"
                        >
                            <div className="story-image-wrapper">

                                {featuredNews.featured_image ? (
                                    <img
                                        src={featuredNews.featured_image}
                                        alt={
                                            featuredNews.image_caption ||
                                            featuredNews.title
                                        }
                                        className="story-image"
                                    />
                                ) : (
                                    <div className="story-image story-image-placeholder">
                                        <span>NEWS</span>
                                    </div>
                                )}

                                <div className="featured-badge">
                                    FEATURED
                                </div>

                            </div>

                            <div className="story-content">

                                {featuredNews.category_name && (
                                    <span className="category-label">
                                        {featuredNews.category_name}
                                    </span>
                                )}

                                <h2>
                                    {featuredNews.title}
                                </h2>

                                {featuredNews.summary && (
                                    <p>
                                        {featuredNews.summary}
                                    </p>
                                )}

                                <span className="story-date">
                                    {formatDate(
                                        featuredNews.published_at
                                    )}
                                </span>

                            </div>
                        </Link>

                        {/* Side Stories */}
                        {sideNews.length > 0 && (
                            <div className="side-stories">

                                {sideNews.map((item) => (
                                    <Link
                                        to={`/news/${item.slug}`}
                                        className="small-story"
                                        key={item.news_id}
                                    >

                                        <div className="small-story-media">
                                            {item.featured_image ? (
                                                <img
                                                    src={item.featured_image}
                                                    alt={
                                                        item.image_caption ||
                                                        item.title
                                                    }
                                                    className="small-story-image"
                                                />
                                            ) : (
                                                <div className="small-story-image small-story-placeholder">
                                                    NEWS
                                                </div>
                                            )}
                                        </div>

                                        <div className="small-story-content">

                                            {item.category_name && (
                                                <span className="category-label">
                                                    {item.category_name}
                                                </span>
                                            )}

                                            <h3>
                                                {item.title}
                                            </h3>

                                            <span className="story-date">
                                                {formatDate(
                                                    item.published_at
                                                )}
                                            </span>

                                        </div>

                                    </Link>
                                ))}

                            </div>
                        )}

                    </section>
                )}

                {/* =========================
                    LATEST STORIES
                ========================== */}
                {!loading && latestNews.length > 0 && (
                    <section className="latest-section">

                        <div className="section-heading-row">

                            <div>
                                <p className="section-label">
                                    MORE STORIES
                                </p>

                                <h2>
                                    Latest Updates
                                </h2>
                            </div>

                        </div>

                        <div className="latest-news-grid">

                            {latestNews.map((item) => (
                                <Link
                                    to={`/news/${item.slug}`}
                                    className="latest-card"
                                    key={item.news_id}
                                >

                                    <div className="latest-card-image">
                                        {item.featured_image ? (
                                            <img
                                                src={item.featured_image}
                                                alt={
                                                    item.image_caption ||
                                                    item.title
                                                }
                                            />
                                        ) : (
                                            <div className="latest-image-placeholder">
                                                NEWS
                                            </div>
                                        )}
                                    </div>

                                    <div className="latest-card-content">

                                        {item.category_name && (
                                            <span className="category-label">
                                                {item.category_name}
                                            </span>
                                        )}

                                        <h3>
                                            {item.title}
                                        </h3>

                                        {item.summary && (
                                            <p>
                                                {item.summary}
                                            </p>
                                        )}

                                        <span className="story-date">
                                            {formatDate(
                                                item.published_at
                                            )}
                                        </span>

                                    </div>

                                </Link>
                            ))}

                        </div>

                    </section>
                )}

            </main>

            {/* =========================
                FOOTER
            ========================== */}
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

export default HomePage;
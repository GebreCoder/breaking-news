import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

function SearchNews() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(initialQuery));
    const [error, setError] = useState("");

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        const loadSearchPage = async () => {
            try {
                const [categoriesResponse, breakingResponse] =
                    await Promise.all([
                        fetch("http://localhost:5000/api/categories"),
                        fetch(
                            "http://localhost:5000/api/breaking-news/active"
                        ),
                    ]);

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
                    "Error loading search page:",
                    error
                );
            }
        };

        loadSearchPage();
    }, []);

    useEffect(() => {
        if (!initialQuery.trim()) {
            setArticles([]);
            setSearched(false);
            setLoading(false);
            setError("");
            return;
        }

        const searchNews = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    "http://localhost:5000/api/news"
                );

                if (!response.ok) {
                    throw new Error("Unable to load news");
                }

                const data = await response.json();

                const searchTerm = initialQuery
                    .trim()
                    .toLowerCase();

                const results = Array.isArray(data)
                    ? data.filter((article) => {
                          const title =
                              article.title?.toLowerCase() || "";

                          const summary =
                              article.summary?.toLowerCase() || "";

                          const content =
                              article.content?.toLowerCase() || "";

                          const category =
                              article.category_name?.toLowerCase() ||
                              "";

                          return (
                              title.includes(searchTerm) ||
                              summary.includes(searchTerm) ||
                              content.includes(searchTerm) ||
                              category.includes(searchTerm)
                          );
                      })
                    : [];

                setArticles(results);
                setSearched(true);
            } catch (error) {
                console.error(
                    "Error searching news:",
                    error
                );

                setError(
                    "Unable to search news right now."
                );
            } finally {
                setLoading(false);
            }
        };

        searchNews();
    }, [initialQuery]);

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

    const handleSubmit = (event) => {
        event.preventDefault();

        const cleanQuery = query.trim();

        if (!cleanQuery) {
            setSearchParams({});
            return;
        }

        setSearchParams({
            q: cleanQuery,
        });
    };

    const handleHeaderSearch = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const input = form.querySelector("input");
        const searchValue = input?.value.trim();

        if (searchValue) {
            navigate(
                `/search?q=${encodeURIComponent(searchValue)}`
            );
        }
    };

    return (
        <div className="site">
            {/* HEADER */}
            <header className="site-header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        BREAKING <span>NEWS</span>
                    </Link>

                    <nav className="main-nav">
                        <Link
                            to="/"
                            className={!searched ? "active" : ""}
                        >
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
                        onSubmit={handleHeaderSearch}
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

            {/* SEARCH CONTENT */}
            <main className="main-content search-page">
                <section className="page-heading search-page-heading">
                    <p className="section-label">
                        SEARCH
                    </p>

                    <h1>
                        Search News
                    </h1>

                    <p>
                        Find the latest stories, headlines,
                        and important developments.
                    </p>
                </section>

                {/* SEARCH FORM */}
                <form
                    className="news-search-form search-main-form"
                    onSubmit={handleSubmit}
                >
                    <div className="search-input-wrapper">
                        <input
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Search news..."
                            aria-label="Search news"
                        />
                    </div>

                    <button type="submit">
                        Search
                    </button>
                </form>

                {/* SEARCHING */}
                {loading && (
                    <div className="search-status">
                        <div className="loading-spinner"></div>

                        <h2>
                            Searching news...
                        </h2>

                        <p>
                            Looking through published
                            articles.
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="search-error">
                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSearchParams({
                                    q: query.trim(),
                                })
                            }
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* INITIAL STATE */}
                {!loading &&
                    !error &&
                    !searched && (
                        <div className="search-empty">
                            <div className="search-empty-icon">
                                🔎
                            </div>

                            <h2>
                                Search for a story
                            </h2>

                            <p>
                                Enter a keyword, topic, or
                                category above to find
                                published news.
                            </p>
                        </div>
                    )}

                {/* NO RESULTS */}
                {!loading &&
                    !error &&
                    searched &&
                    articles.length === 0 && (
                        <div className="search-empty">
                            <div className="search-empty-icon">
                                🔎
                            </div>

                            <p className="section-label">
                                NO RESULTS
                            </p>

                            <h2>
                                No results found
                            </h2>

                            <p>
                                No published articles matched
                                <strong>
                                    {" "}
                                    "{initialQuery}"
                                </strong>
                                .
                            </p>

                            <button
                                type="button"
                                className="search-clear-button"
                                onClick={() =>
                                    setSearchParams({})
                                }
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                {/* RESULTS */}
                {!loading &&
                    !error &&
                    articles.length > 0 && (
                        <section className="search-results">
                            <div className="search-results-header">
                                <div>
                                    <p className="section-label">
                                        RESULTS
                                    </p>

                                    <h2>
                                        Search Results
                                    </h2>
                                </div>

                                <span className="search-result-count">
                                    {articles.length}{" "}
                                    {articles.length === 1
                                        ? "article"
                                        : "articles"}
                                </span>
                            </div>

                            <div className="category-news-grid">
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
                                                    {
                                                        article.category_name
                                                    }
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
                                                    {
                                                        article.summary
                                                    }
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
                            </div>
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

export default SearchNews;
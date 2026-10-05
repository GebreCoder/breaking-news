import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { API_URL } from "../api";
import BreakingBar from "../components/BreakingBar";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function SearchNews() {
    const { t, locale } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialQuery = searchParams.get("q") || "";

    const [queryDraft, setQueryDraft] = useState(() => ({
        search: initialQuery,
        value: initialQuery,
    }));
    const query = queryDraft.search === initialQuery
        ? queryDraft.value
        : initialQuery;
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(initialQuery));
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSearchPage = async () => {
            try {
                const [categoriesResponse, breakingResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/api/categories`),
                        fetch(
                            `${API_URL}/api/breaking-news/active`
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
            return;
        }

        const searchNews = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `${API_URL}/api/news`
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

                setError(t("search.errorText"));
            } finally {
                setLoading(false);
            }
        };

        searchNews();
    }, [initialQuery, t]);

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleDateString(locale, {
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

    const hasSearchQuery = Boolean(initialQuery.trim());
    const visibleArticles = hasSearchQuery ? articles : [];
    const visibleLoading = hasSearchQuery && loading;
    const visibleSearched = hasSearchQuery && searched;
    const visibleError = hasSearchQuery ? error : "";

    return (
        <div className="site">
            <SiteHeader
                categories={categories}
                homeActive={!visibleSearched}
            />

            <BreakingBar items={breakingNews} />

            {/* SEARCH CONTENT */}
            <main className="main-content search-page">
                <section className="page-heading search-page-heading">
                    <p className="section-label">
                        {t("search.label")}
                    </p>

                    <h1>
                        {t("search.title")}
                    </h1>

                    <p>
                        {t("search.intro")}
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
                                setQueryDraft({
                                    search: initialQuery,
                                    value: event.target.value,
                                })
                            }
                            placeholder={t(
                                "nav.searchPlaceholder"
                            )}
                            aria-label={t("nav.search")}
                        />
                    </div>

                    <button type="submit">
                        {t("nav.search")}
                    </button>
                </form>

                {/* SEARCHING */}
                {visibleLoading && (
                    <div className="search-status">
                        <div className="loading-spinner"></div>

                        <h2>
                            {t("search.searching")}
                        </h2>

                        <p>
                            {t("search.searchingText")}
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {!visibleLoading && visibleError && (
                    <div className="search-error">
                        <h2>
                            {t("search.errorTitle")}
                        </h2>

                        <p>
                            {visibleError}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSearchParams({
                                    q: query.trim(),
                                })
                            }
                        >
                            {t("search.tryAgain")}
                        </button>
                    </div>
                )}

                {/* INITIAL STATE */}
                {!visibleLoading &&
                    !visibleError &&
                    !visibleSearched && (
                        <div className="search-empty">
                            <div className="search-empty-icon">
                                🔎
                            </div>

                            <h2>
                                {t("search.emptyTitle")}
                            </h2>

                            <p>
                                {t("search.emptyText")}
                            </p>
                        </div>
                    )}

                {/* NO RESULTS */}
                {!visibleLoading &&
                    !visibleError &&
                    visibleSearched &&
                    visibleArticles.length === 0 && (
                        <div className="search-empty">
                            <div className="search-empty-icon">
                                🔎
                            </div>

                            <p className="section-label">
                                {t("search.noResultsLabel")}
                            </p>

                            <h2>
                                {t("search.noResultsTitle")}
                            </h2>

                            <p>
                                {t("search.noResultsText")}
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
                                {t("search.clear")}
                            </button>
                        </div>
                    )}

                {/* RESULTS */}
                {!visibleLoading &&
                    !visibleError &&
                    visibleArticles.length > 0 && (
                        <section className="search-results">
                            <div className="search-results-header">
                                <div>
                                    <p className="section-label">
                                        {t("search.resultsLabel")}
                                    </p>

                                    <h2>
                                        {t("search.resultsTitle")}
                                    </h2>
                                </div>

                                <span className="search-result-count">
                                    {visibleArticles.length}{" "}
                                    {visibleArticles.length === 1
                                        ? t("search.countOne")
                                        : t("search.countMany")}
                                </span>
                            </div>

                            <div className="category-news-grid">
                                {visibleArticles.map((article) => (
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
                                                    {t(
                                                        "brand.placeholder"
                                                    )}
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
                                                    {t(
                                                        "search.readStory"
                                                    )}
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
            </main>

            <SiteFooter categories={categories} />
        </div>
    );
}

export default SearchNews;

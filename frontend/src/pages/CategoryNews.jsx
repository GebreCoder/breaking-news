import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BreakingBar from "../components/BreakingBar";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function CategoryNews() {
    const { slug } = useParams();
    const { t, locale } = useLanguage();

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

                setError(t("category.loadError"));
            } finally {
                setLoading(false);
            }
        };

        loadCategory();
    }, [slug, t]);

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

    if (loading) {
        return (
            <div className="site">
                <SiteHeader />

                <main className="main-content">
                    <div className="category-page-loading">
                        <div className="loading-spinner"></div>

                        <h2>
                            {t("category.loading")}
                        </h2>

                        <p>
                            {t("category.loadingText")}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="site">
                <SiteHeader categories={categories} />

                <main className="main-content">
                    <div className="category-not-found">
                        <div className="category-error-icon">
                            404
                        </div>

                        <p className="section-label">
                            {t("category.notFoundLabel")}
                        </p>

                        <h1>
                            {t("category.notFoundTitle")}
                        </h1>

                        <p>
                            {t("category.notFoundText")}
                        </p>

                        <Link
                            to="/"
                            className="article-back-link article-back-button"
                        >
                            {t("category.backHome")}
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="site">
            <SiteHeader
                categories={categories}
                activeCategorySlug={slug}
            />

            <BreakingBar items={breakingNews} />

            {/* CATEGORY CONTENT */}
            <main className="main-content category-page">
                <section className="page-heading category-heading">
                    <p className="section-label">
                        {t("category.label")}
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
                            {t("category.emptyTitle")}
                        </h2>

                        <p>
                            {t("category.emptyText")}
                        </p>

                        <Link
                            to="/"
                            className="article-back-link article-back-button"
                        >
                            {t("category.browseLatest")}
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
                                            {t("brand.placeholder")}
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
                                            {t("category.readStory")}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            <SiteFooter categories={categories} />
        </div>
    );
}

export default CategoryNews;

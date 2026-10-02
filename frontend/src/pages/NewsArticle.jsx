import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BreakingBar from "../components/BreakingBar";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function NewsArticle() {
    const { slug } = useParams();
    const { t, locale } = useLanguage();

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
                setError(t("article.loadError"));
            } finally {
                setLoading(false);
            }
        };

        loadArticlePage();
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

        return parsedDate.toLocaleTimeString(locale, {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="site">
                <SiteHeader />

                <main className="article-page">
                    <div className="article-container article-loading">
                        <div className="loading-spinner"></div>

                        <h2>{t("article.loading")}</h2>

                        <p>
                            {t("article.loadingText")}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="site">
                <SiteHeader categories={categories} />

                <main className="article-page">
                    <div className="article-container article-not-found">
                        <div className="article-error-icon">
                            404
                        </div>

                        <p className="section-label">
                            {t("article.notFoundLabel")}
                        </p>

                        <h1>{t("article.notFoundTitle")}</h1>

                        <p>
                            {t("article.notFoundText")}
                        </p>

                        <Link
                            to="/"
                            className="article-back-link article-back-button"
                        >
                            {t("article.backHome")}
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="site">
            <SiteHeader categories={categories} />

            <BreakingBar items={breakingNews} />

            {/* ARTICLE */}
            <main className="article-page">
                <div className="article-container">
                    <Link
                        to="/"
                        className="article-back-link"
                    >
                        {t("article.backLatest")}
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
                                            {t("article.published")} {" "}
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
                            {t("article.backLatest")}
                        </Link>
                    </div>
                </div>
            </main>

            <SiteFooter categories={categories} />
        </div>
    );
}

export default NewsArticle;

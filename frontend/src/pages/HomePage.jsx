import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_URL } from "../api";
import BreakingBar from "../components/BreakingBar";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function HomePage() {
    const { t, locale } = useLanguage();

    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [breakingNews, setBreakingNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomePage = async () => {
            try {
                const [newsResponse, categoriesResponse, breakingResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/api/news`),
                        fetch(`${API_URL}/api/categories`),
                        fetch(`${API_URL}/api/breaking-news/active`),
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

        return parsedDate.toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="site">

            <SiteHeader categories={categories} />

            <BreakingBar items={breakingNews} />

            {/* =========================
                MAIN CONTENT
            ========================== */}
            <main className="main-content">

                {/* Page Introduction */}
                <section className="page-heading">
                    <p className="section-label">
                        {t("home.topStories")}
                    </p>

                    <h1>
                        {t("home.latestNews")}
                    </h1>

                    <p>
                        {t("home.intro")}
                    </p>
                </section>

                {/* Loading */}
                {loading && (
                    <div className="empty-news">
                        <div className="loading-spinner"></div>

                        <h2>
                            {t("home.loading")}
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
                            {t("home.noNewsTitle")}
                        </h2>

                        <p>
                            {t("home.noNewsText")}
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
                                        <span>
                                            {t("brand.placeholder")}
                                        </span>
                                    </div>
                                )}

                                <div className="featured-badge">
                                    {t("home.featured")}
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
                                                    {t("brand.placeholder")}
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
                                    {t("home.moreStories")}
                                </p>

                                <h2>
                                    {t("home.latestUpdates")}
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
                                                {t("brand.placeholder")}
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

            <SiteFooter categories={categories} />

        </div>
    );
}

export default HomePage;

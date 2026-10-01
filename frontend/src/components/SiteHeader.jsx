import { Link, useNavigate } from "react-router-dom";

import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";

function SiteHeader({
    categories = [],
    homeActive = true,
    activeCategorySlug = null,
    showSearch = true
}) {
    const { t } = useLanguage();
    const navigate = useNavigate();

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
        <header className="site-header">
            <div className="header-container">

                <Link to="/" className="logo">
                    {t("brand.name")} {" "}
                    <span>{t("brand.nameAccent")}</span>
                </Link>

                <nav className="main-nav">
                    <Link
                        to="/"
                        className={homeActive ? "active" : ""}
                    >
                        {t("nav.home")}
                    </Link>

                    {categories.map((category) => (
                        <Link
                            to={`/category/${category.slug}`}
                            key={category.category_id}
                            className={
                                category.slug === activeCategorySlug
                                    ? "active"
                                    : ""
                            }
                        >
                            {category.name}
                        </Link>
                    ))}
                </nav>

                {showSearch && (
                    <form
                        className="header-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            placeholder={t(
                                "nav.searchPlaceholder"
                            )}
                            aria-label={t("nav.search")}
                        />

                        <button type="submit">
                            {t("nav.search")}
                        </button>
                    </form>
                )}

                <LanguageToggle />

            </div>
        </header>
    );
}

export default SiteHeader;

import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/useLanguage.js";

function SiteFooter({ categories = [] }) {
    const { t } = useLanguage();

    return (
        <footer className="site-footer">
            <div className="footer-container">

                <div className="footer-brand">
                    <div className="logo">
                        {t("brand.name")} {" "}
                        <span>{t("brand.nameAccent")}</span>
                    </div>

                    <p>{t("brand.tagline")}</p>
                </div>

                <div className="footer-links">

                    <h3>{t("nav.quickLinks")}</h3>

                    <Link to="/">
                        {t("nav.home")}
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
                    © {new Date().getFullYear()} {t("brand.full")}. {" "}
                    {t("footer.rights")}
                </p>
            </div>
        </footer>
    );
}

export default SiteFooter;

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleSignOut = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
    };

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">
                    {t("brand.name")} {" "}
                    <span>{t("brand.nameAccent")}</span>
                </div>

                <div className="admin-sidebar-title">
                    {t("admin.administration")}
                </div>

                <nav className="admin-nav">

                    <Link
                        to="/admin"
                        className={
                            isActive("/admin")
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.dashboard")}
                    </Link>

                    <Link
                        to="/admin/news"
                        className={
                            location.pathname.startsWith(
                                "/admin/news"
                            )
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.news")}
                    </Link>

                    <Link
                        to="/admin/breaking-news"
                        className={
                            isActive("/admin/breaking-news")
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.breakingNews")}
                    </Link>

                    <Link
                        to="/admin/categories"
                        className={
                            isActive("/admin/categories")
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.categories")}
                    </Link>

                    <Link
                        to="/admin/media"
                        className={
                            isActive("/admin/media")
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.media")}
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={
                            isActive("/admin/settings")
                                ? "active"
                                : ""
                        }
                    >
                        {t("admin.siteSettings")}
                    </Link>

                </nav>

                <div className="admin-sidebar-bottom">

                    <Link
                        to="/"
                        className="admin-view-site"
                    >
                        {t("admin.viewWebsite")}
                    </Link>

                    <button
                        type="button"
                        className="admin-signout"
                        onClick={handleSignOut}
                    >
                        {t("admin.signOut")}
                    </button>

                </div>

            </aside>

            {/* Page Content */}
            <div className="admin-main">
                {children}
            </div>

        </div>
    );
}

export default AdminLayout;

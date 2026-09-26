
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

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
                    BREAKING <span>NEWS</span>
                </div>

                <div className="admin-sidebar-title">
                    Administration
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
                        Dashboard
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
                        News
                    </Link>

                    <Link
                        to="/admin/breaking-news"
                        className={
                            isActive("/admin/breaking-news")
                                ? "active"
                                : ""
                        }
                    >
                        Breaking News
                    </Link>

                    <Link
                        to="/admin/categories"
                        className={
                            isActive("/admin/categories")
                                ? "active"
                                : ""
                        }
                    >
                        Categories
                    </Link>

                    <Link
                        to="/admin/media"
                        className={
                            isActive("/admin/media")
                                ? "active"
                                : ""
                        }
                    >
                        Media
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={
                            isActive("/admin/settings")
                                ? "active"
                                : ""
                        }
                    >
                        Site Settings
                    </Link>

                </nav>

                <div className="admin-sidebar-bottom">

                    <Link
                        to="/"
                        className="admin-view-site"
                    >
                        View Website
                    </Link>

                    <button
                        type="button"
                        className="admin-signout"
                        onClick={handleSignOut}
                    >
                        Sign Out
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


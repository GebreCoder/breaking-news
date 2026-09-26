import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    const firstName = admin?.fullName
        ? admin.fullName.split(" ")[0]
        : "";

    return (
        <AdminLayout>

            <header className="admin-topbar">
                <div>
                    <span className="admin-page-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Dashboard</h1>

                    <p>
                        Manage and monitor your BREAKING NEWS website.
                    </p>
                </div>
            </header>

            <main className="admin-content">

                {/* WELCOME SECTION */}
                <section className="admin-dashboard-welcome">

                    <div className="dashboard-welcome-content">
                        <span className="dashboard-welcome-label">
                            ADMINISTRATOR
                        </span>

                        <h2>
                            Welcome back
                            {firstName ? `, ${firstName}` : ""}
                        </h2>

                        <p>
                            Manage your news, categories, breaking alerts,
                            media, and website settings from one place.
                        </p>
                    </div>

                    <div className="dashboard-welcome-mark">
                        BN
                    </div>

                </section>

                {/* MANAGEMENT SECTION */}
                <section className="dashboard-management">

                    <div className="dashboard-section-header">
                        <div>
                            <h2>Content Management</h2>

                            <p>
                                Quick access to your administration tools.
                            </p>
                        </div>
                    </div>

                    <div className="admin-dashboard-grid">

                        <Link
                            to="/admin/news"
                            className="admin-dashboard-card"
                        >
                            <div className="dashboard-card-top">
                                <span className="dashboard-card-icon">
                                    N
                                </span>

                                <span className="dashboard-card-label">
                                    NEWS
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    News Management
                                </h3>

                                <p>
                                    Create, edit, publish, and manage
                                    news articles.
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                Manage News
                                <span>→</span>
                            </div>
                        </Link>

                        <Link
                            to="/admin/breaking-news"
                            className="admin-dashboard-card"
                        >
                            <div className="dashboard-card-top">
                                <span className="dashboard-card-icon dashboard-alert-icon">
                                    !
                                </span>

                                <span className="dashboard-card-label">
                                    ALERTS
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    Breaking News
                                </h3>

                                <p>
                                    Manage urgent headlines and breaking
                                    news alerts.
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                Manage Alerts
                                <span>→</span>
                            </div>
                        </Link>

                        <Link
                            to="/admin/categories"
                            className="admin-dashboard-card"
                        >
                            <div className="dashboard-card-top">
                                <span className="dashboard-card-icon">
                                    C
                                </span>

                                <span className="dashboard-card-label">
                                    CONTENT
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    Categories
                                </h3>

                                <p>
                                    Organize your news content with
                                    categories.
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                Manage Categories
                                <span>→</span>
                            </div>
                        </Link>

                        <Link
                            to="/admin/media"
                            className="admin-dashboard-card"
                        >
                            <div className="dashboard-card-top">
                                <span className="dashboard-card-icon">
                                    M
                                </span>

                                <span className="dashboard-card-label">
                                    MEDIA
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    Media Library
                                </h3>

                                <p>
                                    Upload and manage images used across
                                    your news website.
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                Open Media Library
                                <span>→</span>
                            </div>
                        </Link>

                        <Link
                            to="/admin/settings"
                            className="admin-dashboard-card"
                        >
                            <div className="dashboard-card-top">
                                <span className="dashboard-card-icon">
                                    S
                                </span>

                                <span className="dashboard-card-label">
                                    SETTINGS
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    Site Settings
                                </h3>

                                <p>
                                    Manage website information, links,
                                    and configuration.
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                Open Settings
                                <span>→</span>
                            </div>
                        </Link>

                    </div>

                </section>

            </main>

        </AdminLayout>
    );
}

export default AdminDashboard;
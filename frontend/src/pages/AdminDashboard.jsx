import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";

function AdminDashboard() {
    const { t } = useLanguage();

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
                        {t("dashboard.eyebrow")}
                    </span>

                    <h1>{t("dashboard.title")}</h1>

                    <p>
                        {t("dashboard.subtitle")}
                    </p>
                </div>

                <LanguageToggle
                    className="lang-toggle-light admin-header-language"
                />
            </header>

            <main className="admin-content">

                {/* WELCOME SECTION */}
                <section className="admin-dashboard-welcome">

                    <div className="dashboard-welcome-content">
                        <span className="dashboard-welcome-label">
                            {t("dashboard.welcomeLabel")}
                        </span>

                        <h2>
                            {t("dashboard.welcome")}
                            {firstName ? `, ${firstName}` : ""}
                        </h2>

                        <p>
                            {t("dashboard.welcomeText")}
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
                            <h2>
                                {t(
                                    "dashboard.contentManagement"
                                )}
                            </h2>

                            <p>
                                {t(
                                    "dashboard.contentManagementText"
                                )}
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
                                    {t("dashboard.cardNewsLabel")}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    {t("dashboard.cardNewsTitle")}
                                </h3>

                                <p>
                                    {t("dashboard.cardNewsText")}
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                {t("dashboard.cardNewsAction")}
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
                                    {t(
                                        "dashboard.cardAlertsLabel"
                                    )}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    {t("dashboard.cardAlertsTitle")}
                                </h3>

                                <p>
                                    {t("dashboard.cardAlertsText")}
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                {t("dashboard.cardAlertsAction")}
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
                                    {t(
                                        "dashboard.cardContentLabel"
                                    )}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    {t("dashboard.cardContentTitle")}
                                </h3>

                                <p>
                                    {t("dashboard.cardContentText")}
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                {t("dashboard.cardContentAction")}
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
                                    {t("dashboard.cardMediaLabel")}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    {t("dashboard.cardMediaTitle")}
                                </h3>

                                <p>
                                    {t("dashboard.cardMediaText")}
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                {t("dashboard.cardMediaAction")}
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
                                    {t(
                                        "dashboard.cardSettingsLabel"
                                    )}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <h3>
                                    {t("dashboard.cardSettingsTitle")}
                                </h3>

                                <p>
                                    {t("dashboard.cardSettingsText")}
                                </p>
                            </div>

                            <div className="dashboard-card-action">
                                {t("dashboard.cardSettingsAction")}
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

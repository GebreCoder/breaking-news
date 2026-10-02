import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminLogin() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || data.message || t("login.failed")
                );
                return;
            }

            localStorage.setItem("adminToken", data.token);
            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            navigate("/admin");
        } catch (error) {
            console.error("Login error:", error);
            setError(t("login.connectionError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-language">
                <LanguageToggle className="lang-toggle-light" />
            </div>

            <div className="admin-login-card">

                {/* BRAND */}
                <div className="admin-login-brand">
                    <div className="admin-login-logo">
                        {t("brand.name")} {" "}
                        <span>{t("brand.nameAccent")}</span>
                    </div>

                    <div className="admin-login-brand-line"></div>

                    <p>{t("login.portal")}</p>
                </div>

                {/* HEADER */}
                <div className="admin-login-header">
                    <h1>{t("login.title")}</h1>
                    <p>
                        {t("login.subtitle")}
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div
                        className="login-error"
                        role="alert"
                    >
                        <span className="login-error-icon">!</span>

                        <span>{error}</span>
                    </div>
                )}

                {/* LOGIN FORM */}
                <form onSubmit={handleSubmit}>

                    <div className="login-field">
                        <label htmlFor="email">
                            {t("login.email")}
                        </label>

                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                @
                            </span>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder={t(
                                    "login.emailPlaceholder"
                                )}
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            {t("login.password")}
                        </label>

                        <div className="login-input-wrapper">
                            <span className="login-input-icon password-icon">
                                •
                            </span>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder={t(
                                    "login.passwordPlaceholder"
                                )}
                                autoComplete="current-password"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner"></span>
                                {t("login.signingIn")}
                            </>
                        ) : (
                            <>
                                {t("login.signIn")}
                                <span className="login-button-arrow">
                                    →
                                </span>
                            </>
                        )}
                    </button>

                </form>

                {/* FOOTER */}
                <div className="admin-login-footer">
                    <Link to="/">
                        <span>←</span>
                        {t("login.backToSite")}
                    </Link>
                </div>

            </div>

            <div className="admin-login-copyright">
                © {new Date().getFullYear()} {t("brand.full")}.{" "}
                {t("footer.rights")}
            </div>

        </div>
    );
}

export default AdminLogin;

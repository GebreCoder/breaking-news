import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function AdminLogin() {
    const navigate = useNavigate();

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
                setError(data.message || "Login failed.");
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
            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                {/* BRAND */}
                <div className="admin-login-brand">
                    <div className="admin-login-logo">
                        BREAKING <span>NEWS</span>
                    </div>

                    <div className="admin-login-brand-line"></div>

                    <p>Administration Portal</p>
                </div>

                {/* HEADER */}
                <div className="admin-login-header">
                    <h1>Welcome Back</h1>
                    <p>
                        Sign in to access your news administration dashboard.
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
                            Email Address
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
                                placeholder="Enter your email address"
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
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
                                placeholder="Enter your password"
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
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
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
                        Back to Breaking News
                    </Link>
                </div>

            </div>

            <div className="admin-login-copyright">
                © {new Date().getFullYear()} Breaking News. All rights reserved.
            </div>

        </div>
    );
}

export default AdminLogin;
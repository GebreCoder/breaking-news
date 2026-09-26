import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminSiteSettings() {
    const [settings, setSettings] = useState([]);
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadSettings = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/site-settings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load settings"
                );
            }

            setSettings(data);

            const settingValues = {};

            data.forEach((setting) => {
                settingValues[setting.setting_key] =
                    setting.setting_value || "";
            });

            setValues(settingValues);

        } catch (error) {
            console.error(
                "Error loading site settings:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleChange = (key, value) => {
        setValues((previous) => ({
            ...previous,
            [key]: value
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");
        setSaving(true);

        try {
            for (const setting of settings) {

                const response = await fetch(
                    `http://localhost:5000/api/site-settings/${setting.setting_key}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            value:
                                values[
                                    setting.setting_key
                                ] || ""
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        `Failed to update ${setting.setting_key}`
                    );
                }
            }

            setMessage(
                "Site settings saved successfully."
            );

            await loadSettings();

        } catch (error) {
            console.error(
                "Error saving site settings:",
                error
            );

            setError(error.message);

        } finally {
            setSaving(false);
        }
    };

    const getLabel = (key) => {
        const labels = {
            site_name: "Site Name",
            site_description: "Site Description",
            contact_email: "Contact Email",
            logo_url: "Logo URL",
            facebook_url: "Facebook URL",
            x_url: "X / Twitter URL",
            telegram_url: "Telegram URL"
        };

        return labels[key] || key;
    };

    return (
        <AdminLayout>

            <header className="admin-topbar">

                <div>

                    <h1>
                        Site Settings
                    </h1>

                    <p>
                        Manage the information and links displayed across the website.
                    </p>

                </div>

            </header>

            <main className="admin-content">

                {loading ? (

                    <div className="admin-table-message">
                        Loading settings...
                    </div>

                ) : (

                    <form
                        className="news-form"
                        onSubmit={handleSave}
                    >

                        {message && (
                            <div className="form-success">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        {/* General Settings */}
                        <div className="form-section">

                            <h2>
                                General Settings
                            </h2>

                            {settings
                                .filter((setting) =>
                                    [
                                        "site_name",
                                        "site_description",
                                        "contact_email",
                                        "logo_url"
                                    ].includes(
                                        setting.setting_key
                                    )
                                )
                                .map((setting) => (

                                    <div
                                        className="form-group"
                                        key={
                                            setting.setting_key
                                        }
                                    >

                                        <label
                                            htmlFor={
                                                setting.setting_key
                                            }
                                        >
                                            {getLabel(
                                                setting.setting_key
                                            )}
                                        </label>

                                        <input
                                            id={
                                                setting.setting_key
                                            }
                                            type={
                                                setting.setting_key ===
                                                "contact_email"
                                                    ? "email"
                                                    : "text"
                                            }
                                            value={
                                                values[
                                                    setting.setting_key
                                                ] || ""
                                            }
                                            onChange={(event) =>
                                                handleChange(
                                                    setting.setting_key,
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                ))}

                        </div>

                        {/* Social Media */}
                        <div className="form-section">

                            <h2>
                                Social Media
                            </h2>

                            {settings
                                .filter((setting) =>
                                    [
                                        "facebook_url",
                                        "x_url",
                                        "telegram_url"
                                    ].includes(
                                        setting.setting_key
                                    )
                                )
                                .map((setting) => (

                                    <div
                                        className="form-group"
                                        key={
                                            setting.setting_key
                                        }
                                    >

                                        <label
                                            htmlFor={
                                                setting.setting_key
                                            }
                                        >
                                            {getLabel(
                                                setting.setting_key
                                            )}
                                        </label>

                                        <input
                                            id={
                                                setting.setting_key
                                            }
                                            type="url"
                                            value={
                                                values[
                                                    setting.setting_key
                                                ] || ""
                                            }
                                            onChange={(event) =>
                                                handleChange(
                                                    setting.setting_key,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="https://"
                                        />

                                    </div>

                                ))}

                        </div>

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Settings"}
                            </button>

                        </div>

                    </form>

                )}

            </main>

        </AdminLayout>
    );
}

export default AdminSiteSettings;
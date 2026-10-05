import { useEffect, useEffectEvent, useState } from "react";
import { API_URL } from "../api";
import AdminLayout from "../components/AdminLayout";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminSiteSettings() {
    const { t } = useLanguage();

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
                `${API_URL}/api/site-settings`,
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
                        t("adminSettings.loadError")
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

    const loadSettingsOnMount = useEffectEvent(() => {
        loadSettings();
    });

    useEffect(() => {
        Promise.resolve().then(loadSettingsOnMount);
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
                    `${API_URL}/api/site-settings/${setting.setting_key}`,
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
                            t("adminSettings.saveError", {
                                key: setting.setting_key
                            })
                    );
                }
            }

            setMessage(t("adminSettings.saved"));

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
        const labelKey = `adminSettings.field.${key}`;

        const translated = t(labelKey);

        return translated === labelKey ? key : translated;
    };

    return (
        <AdminLayout>

            <header className="admin-topbar">

                <div>

                    <h1>
                        {t("adminSettings.title")}
                    </h1>

                    <p>
                        {t("adminSettings.subtitle")}
                    </p>

                </div>

                <LanguageToggle
                    className="lang-toggle-light admin-header-language"
                />

            </header>

            <main className="admin-content">

                {loading ? (

                    <div className="admin-table-message">
                        {t("adminSettings.loading")}
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
                                {t("adminSettings.general")}
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
                                {t("adminSettings.social")}
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
                                    ? t("adminSettings.saving")
                                    : t("adminSettings.save")}
                            </button>

                        </div>

                    </form>

                )}

            </main>

        </AdminLayout>
    );
}

export default AdminSiteSettings;

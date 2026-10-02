import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminCategories() {
    const { t } = useLanguage();

    const [categories, setCategories] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadCategories = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/categories"
            );

            const data = await response.json();

            setCategories(data);
        } catch (error) {
            console.error(
                "Error loading categories:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                "http://localhost:5000/api/categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        displayOrder
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        t("adminCategories.createError")
                );
                return;
            }

            setSuccess(t("adminCategories.createSuccess"));

            setName("");
            setDescription("");
            setDisplayOrder(0);

            await loadCategories();
        } catch (error) {
            console.error(
                "Error creating category:",
                error
            );

            setError(t("adminCategories.connectionError"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <header className="admin-topbar admin-categories-topbar">
                <div>
                    <span className="admin-page-eyebrow">
                        {t("adminCategories.eyebrow")}
                    </span>

                    <h1>
                        {t("adminCategories.title")}
                    </h1>

                    <p>
                        {t("adminCategories.subtitle")}
                    </p>
                </div>

                <div className="admin-category-count">
                    <span>{categories.length}</span>

                    <small>
                        {categories.length === 1
                            ? t("adminCategories.countOne")
                            : t("adminCategories.countMany")}
                    </small>
                </div>
            </header>

            <main className="admin-content">
                <div className="admin-categories-layout">

                    {/* CREATE CATEGORY */}
                    <section className="admin-category-create-card">
                        <div className="admin-section-heading">
                            <div className="admin-section-number">
                                01
                            </div>

                            <div>
                                <h2>
                                    {t("adminCategories.createTitle")}
                                </h2>

                                <p>
                                    {t(
                                        "adminCategories.createText"
                                    )}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="admin-category-alert admin-category-alert-error">
                                <span className="admin-category-alert-icon">
                                    !
                                </span>

                                <div>
                                    <strong>
                                        {t(
                                            "adminCategories.errorTitle"
                                        )}
                                    </strong>

                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="admin-category-alert admin-category-alert-success">
                                <span className="admin-category-alert-icon">
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        {t(
                                            "adminCategories.successTitle"
                                        )}
                                    </strong>

                                    <p>{success}</p>
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="admin-category-form"
                        >
                            <div className="admin-category-field">
                                <label htmlFor="categoryName">
                                    {t(
                                        "adminCategories.nameLabel"
                                    )}
                                    <span>*</span>
                                </label>

                                <input
                                    id="categoryName"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder={t(
                                        "adminCategories.namePlaceholder"
                                    )}
                                    required
                                />

                                <small>
                                    {t(
                                        "adminCategories.nameHelp"
                                    )}
                                </small>
                            </div>

                            <div className="admin-category-field">
                                <label htmlFor="categoryDescription">
                                    {t(
                                        "adminCategories.descLabel"
                                    )}
                                </label>

                                <textarea
                                    id="categoryDescription"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder={t(
                                        "adminCategories.descPlaceholder"
                                    )}
                                    rows="5"
                                />

                                <small>
                                    {t(
                                        "adminCategories.descHelp"
                                    )}
                                </small>
                            </div>

                            <div className="admin-category-field">
                                <label htmlFor="displayOrder">
                                    {t(
                                        "adminCategories.orderLabel"
                                    )}
                                </label>

                                <input
                                    id="displayOrder"
                                    type="number"
                                    value={displayOrder}
                                    onChange={(event) =>
                                        setDisplayOrder(
                                            event.target.value
                                        )
                                    }
                                    min="0"
                                />

                                <small>
                                    {t("adminCategories.orderHelp")}
                                </small>
                            </div>

                            <button
                                type="submit"
                                className="admin-category-create-button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="admin-category-spinner"></span>
                                        {t(
                                            "adminCategories.creating"
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="admin-category-button-icon">
                                            +
                                        </span>
                                        {t(
                                            "adminCategories.createAction"
                                        )}
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    {/* CATEGORY LIST */}
                    <section className="admin-category-list-card">
                        <div className="admin-category-list-heading">
                            <div>
                                <span className="admin-section-number">
                                    02
                                </span>

                                <h2>
                                    {t(
                                        "adminCategories.listTitle"
                                    )}
                                </h2>

                                <p>
                                    {t(
                                        "adminCategories.listText"
                                    )}
                                </p>
                            </div>

                            <div className="admin-category-total">
                                <strong>
                                    {categories.length}
                                </strong>

                                <span>
                                    {categories.length === 1
                                        ? t(
                                              "adminCategories.activeOne"
                                          )
                                        : t(
                                              "adminCategories.activeMany"
                                          )}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="admin-category-state">
                                <span className="admin-category-large-spinner"></span>

                                <h3>
                                    {t(
                                        "adminCategories.loading"
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        "adminCategories.loadingText"
                                    )}
                                </p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="admin-category-state">
                                <div className="admin-category-empty-icon">
                                    +
                                </div>

                                <h3>
                                    {t("adminCategories.emptyTitle")}
                                </h3>

                                <p>
                                    {t("adminCategories.emptyText")}
                                </p>
                            </div>
                        ) : (
                            <div className="admin-category-table-wrapper">
                                <table className="admin-category-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                {t(
                                                    "adminCategories.thCategory"
                                                )}
                                            </th>

                                            <th>
                                                {t(
                                                    "adminCategories.thSlug"
                                                )}
                                            </th>

                                            <th>
                                                {t(
                                                    "adminCategories.thDescription"
                                                )}
                                            </th>

                                            <th>
                                                {t(
                                                    "adminCategories.thOrder"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {categories.map(
                                            (category) => (
                                                <tr
                                                    key={
                                                        category.category_id
                                                    }
                                                >
                                                    <td>
                                                        <div className="admin-category-name-cell">
                                                            <div className="admin-category-avatar">
                                                                {category.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        category.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {t(
                                                                        "adminCategories.rowCategory"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <code>
                                                            /
                                                            {
                                                                category.slug
                                                            }
                                                        </code>
                                                    </td>

                                                    <td>
                                                        <span className="admin-category-description">
                                                            {category.description ||
                                                                t(
                                                                    "adminCategories.noDescription"
                                                                )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="admin-category-order">
                                                            {
                                                                category.display_order
                                                            }
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </AdminLayout>
    );
}

export default AdminCategories;

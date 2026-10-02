import { Fragment, useEffect, useEffectEvent, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmationDialog from "../components/ConfirmationDialog";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminCategories() {
    const { t } = useLanguage();

    const [categories, setCategories] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [editingCategory, setEditingCategory] = useState(null);
    const [viewingCategoryId, setViewingCategoryId] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadCategories = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/categories/admin",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || t("adminCategories.loadError")
                );
            }

            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "Error loading categories:",
                error
            );
            setError(error.message || t("adminCategories.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const loadCategoriesOnMount = useEffectEvent(() => {
        loadCategories();
    });

    useEffect(() => {
        Promise.resolve().then(loadCategoriesOnMount);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const token = localStorage.getItem("adminToken");

            const isEditing = Boolean(editingCategory);
            const response = await fetch(
                isEditing
                    ? `http://localhost:5000/api/categories/${editingCategory.category_id}`
                    : "http://localhost:5000/api/categories",
                {
                    method: isEditing ? "PUT" : "POST",
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
                        t(
                            isEditing
                                ? "adminCategories.updateError"
                                : "adminCategories.createError"
                        )
                );
                return;
            }

            setSuccess(
                t(
                    isEditing
                        ? "adminCategories.updateSuccess"
                        : "adminCategories.createSuccess"
                )
            );

            setName("");
            setDescription("");
            setDisplayOrder(0);
            setEditingCategory(null);

            await loadCategories();
        } catch (error) {
            console.error(
                "Error creating category:",
                error
            );

            setError(error.message || t("adminCategories.connectionError"));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || "");
        setDisplayOrder(category.display_order);
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setName("");
        setDescription("");
        setDisplayOrder(0);
        setError("");
    };

    const handleCategoryStatus = (category, isActive) => {
        if (!isActive) {
            setStatusTarget(category);
            return;
        }

        updateCategoryStatus(category, true);
    };

    const confirmCategoryDeactivation = () => {
        if (!statusTarget) {
            return;
        }

        const category = statusTarget;
        setStatusTarget(null);
        updateCategoryStatus(category, false);
    };

    const handleCategoryDelete = (category) => {
        setDeleteTarget(category);
    };

    const confirmCategoryDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        const category = deleteTarget;
        setDeleteTarget(null);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${category.category_id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || t("adminCategories.deleteError")
                );
            }

            setSuccess(t("adminCategories.deleteSuccess"));
            await loadCategories();
        } catch (error) {
            setError(error.message || t("adminCategories.deleteError"));
        }
    };

    const updateCategoryStatus = async (category, isActive) => {

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/categories/${category.category_id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    body: JSON.stringify({ isActive })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || t("adminCategories.actionError")
                );
            }

            setSuccess(
                t(
                    isActive
                        ? "adminCategories.activateSuccess"
                        : "adminCategories.deactivateSuccess"
                )
            );
            await loadCategories();
        } catch (error) {
            setError(error.message || t("adminCategories.actionError"));
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

                <LanguageToggle
                    className="lang-toggle-light admin-header-language"
                />

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
                                    {t(
                                        editingCategory
                                            ? "adminCategories.editTitle"
                                            : "adminCategories.createTitle"
                                    )}
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
                                            editingCategory
                                                ? "adminCategories.updateError"
                                                : "adminCategories.errorTitle"
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
                                            editingCategory
                                                ? "adminCategories.updateSuccess"
                                                : "adminCategories.successTitle"
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

                            <div className="admin-category-form-actions">
                                <button
                                    type="submit"
                                    className="admin-category-create-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="admin-category-spinner"></span>
                                            {t("adminCategories.saving")}
                                        </>
                                    ) : (
                                        <>
                                            <span className="admin-category-button-icon">
                                                {editingCategory ? "✓" : "+"}
                                            </span>
                                            {t(
                                                editingCategory
                                                    ? "adminCategories.saveChanges"
                                                    : "adminCategories.createAction"
                                            )}
                                        </>
                                    )}
                                </button>

                                {editingCategory && (
                                    <button
                                        type="button"
                                        className="admin-category-cancel-button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        {t("adminCategories.cancelEdit")}
                                    </button>
                                )}
                            </div>
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
                                              "adminCategories.totalOne"
                                          )
                                        : t(
                                              "adminCategories.totalMany"
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
                                            <th>
                                                {t(
                                                    "adminCategories.thStatus"
                                                )}
                                            </th>
                                            <th>
                                                {t(
                                                    "adminCategories.thActions"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {categories.map(
                                            (category) => (
                                                <Fragment key={category.category_id}>
                                                <tr>
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

                                                    <td>
                                                        <span className={`admin-category-status ${category.is_active ? "active" : "inactive"}`}>
                                                            {t(category.is_active ? "adminCategories.statusActive" : "adminCategories.statusInactive")}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="admin-category-row-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-category-action-button"
                                                                aria-expanded={viewingCategoryId === category.category_id}
                                                                onClick={() => setViewingCategoryId(
                                                                    viewingCategoryId === category.category_id
                                                                        ? null
                                                                        : category.category_id
                                                                )}
                                                            >
                                                                {t(viewingCategoryId === category.category_id ? "adminCategories.hideDetails" : "adminCategories.details")}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-category-action-button"
                                                                onClick={() => handleEdit(category)}
                                                            >
                                                                {t("adminCategories.edit")}
                                                            </button>
                                                            {category.is_active ? (
                                                                <button
                                                                    type="button"
                                                                    className="admin-category-action-button danger"
                                                                    onClick={() => handleCategoryStatus(category, false)}
                                                                >
                                                                    {t("adminCategories.deactivate")}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="admin-category-action-button restore"
                                                                    onClick={() => handleCategoryStatus(category, true)}
                                                                >
                                                                    {t("adminCategories.activate")}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="admin-category-action-button danger"
                                                                onClick={() => handleCategoryDelete(category)}
                                                            >
                                                                {t("adminCategories.delete")}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {viewingCategoryId === category.category_id && (
                                                    <tr className="admin-category-details-row">
                                                        <td colSpan="6">
                                                            <div className="admin-category-details">
                                                                <span><strong>{t("adminCategories.detailsStatus")}:</strong> {t(category.is_active ? "adminCategories.statusActive" : "adminCategories.statusInactive")}</span>
                                                                <span><strong>{t("adminCategories.articleCount")}:</strong> {category.article_count}</span>
                                                                <span><strong>{t("adminCategories.createdAt")}:</strong> {category.created_at ? new Date(category.created_at).toLocaleDateString() : "-"}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                </Fragment>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <ConfirmationDialog
                open={Boolean(statusTarget)}
                title={t("adminCategories.deactivateTitle")}
                description={`${t("adminCategories.deactivateConfirm")}\n\n${statusTarget?.name || ""}`}
                confirmLabel={t("confirmation.deactivate")}
                cancelLabel={t("confirmation.cancel")}
                onConfirm={confirmCategoryDeactivation}
                onCancel={() => setStatusTarget(null)}
            />
            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title={t("adminCategories.permanentDeleteTitle")}
                description={`${t("adminCategories.permanentDeleteConfirm")}\n\n${deleteTarget?.name || ""}`}
                confirmLabel={t("confirmation.delete")}
                cancelLabel={t("confirmation.cancel")}
                onConfirm={confirmCategoryDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}

export default AdminCategories;

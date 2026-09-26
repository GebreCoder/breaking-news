import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminCategories() {
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
                    "Failed to create category."
                );
                return;
            }

            setSuccess(
                "Category created successfully."
            );

            setName("");
            setDescription("");
            setDisplayOrder(0);

            await loadCategories();
        } catch (error) {
            console.error(
                "Error creating category:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <header className="admin-topbar admin-categories-topbar">
                <div>
                    <span className="admin-page-eyebrow">
                        CONTENT ORGANIZATION
                    </span>

                    <h1>Categories</h1>

                    <p>
                        Organize your news content into clear,
                        easy-to-navigate categories.
                    </p>
                </div>

                <div className="admin-category-count">
                    <span>{categories.length}</span>
                    <small>
                        {categories.length === 1
                            ? "Category"
                            : "Categories"}
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
                                <h2>Create Category</h2>

                                <p>
                                    Add a new category for organizing
                                    published news.
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
                                        Unable to create category
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
                                        Category created
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
                                    Category Name
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
                                    placeholder="Example: World"
                                    required
                                />

                                <small>
                                    Use a short, recognizable name
                                    for the category.
                                </small>
                            </div>

                            <div className="admin-category-field">
                                <label htmlFor="categoryDescription">
                                    Description
                                </label>

                                <textarea
                                    id="categoryDescription"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Optional category description"
                                    rows="5"
                                />

                                <small>
                                    A short description can help
                                    explain what stories belong here.
                                </small>
                            </div>

                            <div className="admin-category-field">
                                <label htmlFor="displayOrder">
                                    Display Order
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
                                    Lower numbers appear earlier in
                                    the category order.
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <span className="admin-category-button-icon">
                                            +
                                        </span>
                                        Create Category
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

                                <h2>Existing Categories</h2>

                                <p>
                                    Review and manage the categories
                                    currently available on the site.
                                </p>
                            </div>

                            <div className="admin-category-total">
                                <strong>
                                    {categories.length}
                                </strong>

                                <span>
                                    {categories.length === 1
                                        ? "active category"
                                        : "active categories"}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="admin-category-state">
                                <span className="admin-category-large-spinner"></span>

                                <h3>
                                    Loading categories
                                </h3>

                                <p>
                                    Please wait while the category
                                    list is loaded.
                                </p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="admin-category-state">
                                <div className="admin-category-empty-icon">
                                    +
                                </div>

                                <h3>
                                    No categories yet
                                </h3>

                                <p>
                                    Create your first category using
                                    the form to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="admin-category-table-wrapper">
                                <table className="admin-category-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Slug</th>
                                            <th>Description</th>
                                            <th>Order</th>
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
                                                                    Category
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
                                                                "No description provided"}
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
import { useEffect, useState } from "react";
import "../App.css";

function AdminUsers() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadAdmins = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load admin users"
                );
            }

            setAdmins(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/admin/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create admin account"
                );
            }

            setMessage("Admin account created successfully.");

            setFullName("");
            setEmail("");
            setPassword("");
            setShowForm(false);

            loadAdmins();

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (adminId, isActive) => {
        try {
            setMessage("");
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/admin/users/${adminId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        isActive
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update admin account"
                );
            }

            setMessage(data.message);

            loadAdmins();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="admin-page">

            <div className="admin-page-header">
                <div>
                    <h1>User Management</h1>
                    <p>
                        Manage administrator accounts and access.
                    </p>
                </div>

                <button
                    className="admin-primary-button"
                    onClick={() => {
                        setShowForm(!showForm);
                        setMessage("");
                        setError("");
                    }}
                >
                    {showForm ? "Cancel" : "+ Add Admin"}
                </button>
            </div>

            {message && (
                <div className="admin-success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="admin-error-message">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="admin-card admin-user-form-card">

                    <h2>Create Admin Account</h2>

                    <form onSubmit={handleCreateAdmin}>

                        <div className="admin-form-grid">

                            <div className="admin-form-group">
                                <label>Full Name</label>

                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Email</label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Password</label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Minimum 8 characters"
                                    minLength="8"
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="admin-primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Creating..."
                                : "Create Admin"}
                        </button>

                    </form>
                </div>
            )}

            <div className="admin-card">

                <div className="admin-card-header">
                    <div>
                        <h2>Administrator Accounts</h2>
                        <p>
                            {admins.length} administrator
                            {admins.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        Loading administrator accounts...
                    </div>
                ) : admins.length === 0 ? (
                    <div className="admin-empty">
                        No administrator accounts found.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {admins.map((admin) => (
                                    <tr key={admin.admin_id}>

                                        <td>
                                            <strong>
                                                {admin.full_name}
                                            </strong>
                                        </td>

                                        <td>
                                            {admin.email}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    admin.is_active
                                                        ? "admin-status active"
                                                        : "admin-status inactive"
                                                }
                                            >
                                                {admin.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                admin.created_at
                                            ).toLocaleDateString()}
                                        </td>

                                        <td>

                                            {admin.is_active ? (
                                                <button
                                                    className="admin-danger-button"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            admin.admin_id,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    className="admin-secondary-button"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            admin.admin_id,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Activate
                                                </button>
                                            )}

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default AdminUsers;
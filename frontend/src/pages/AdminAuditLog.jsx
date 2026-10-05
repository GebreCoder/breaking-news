import { useEffect, useState } from "react";
import { API_URL } from "../api";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminAuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_URL}/api/admin/audit-logs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load audit logs"
                );
            }

            setLogs(data);

        } catch (error) {
            console.error("Audit log error:", error);

            setError(
                error.message || "Failed to load audit logs"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };

    return (
        <AdminLayout>
        <div className="admin-page">

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Audit Log</h1>

                    <p>
                        Review administrative actions performed
                        in the system.
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-message">
                    {error}
                </div>
            )}

            {/* Audit Log Card */}
            <div className="admin-card">

                <div className="admin-card-header">
                    <div>
                        <h2>Activity History</h2>

                        <p>
                            A record of important administrative
                            actions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={loadAuditLogs}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        Loading audit logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="admin-empty">
                        No audit logs found.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Admin</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Description</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.audit_log_id}>

                                        <td>
                                            {formatDate(
                                                log.created_at
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                {log.admin_name ||
                                                    "Unknown"}
                                            </strong>

                                            <div className="audit-admin-email">
                                                {log.admin_email ||
                                                    "-"}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="audit-action">
                                                {log.action}
                                            </span>
                                        </td>

                                        <td>
                                            {log.entity_type || "-"}
                                            {log.entity_id
                                                ? ` #${log.entity_id}`
                                                : ""}
                                        </td>

                                        <td>
                                            {log.description || "-"}
                                        </td>

                                        <td>
                                            <span className="audit-ip">
                                                {log.ip_address || "-"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
        </AdminLayout>
    );
}

export default AdminAuditLog;
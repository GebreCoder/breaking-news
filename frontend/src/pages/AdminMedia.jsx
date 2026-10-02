import { useEffect, useEffectEvent, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmationDialog from "../components/ConfirmationDialog";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/useLanguage.js";
import "../App.css";

function AdminMedia() {
    const { t } = useLanguage();

    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [altText, setAltText] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("adminToken");

    const loadMedia = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/media",
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
                        t("adminMedia.loadError")
                );
            }

            setMedia(data);

        } catch (error) {
            console.error(
                "Error loading media:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    const loadMediaOnMount = useEffectEvent(() => {
        loadMedia();
    });

    useEffect(() => {
        Promise.resolve().then(loadMediaOnMount);
    }, []);

    const handleUpload = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!file) {
            setError(t("adminMedia.selectFile"));

            return;
        }

        const formData = new FormData();

        formData.append(
            "image",
            file
        );

        formData.append(
            "altText",
            altText
        );

        setUploading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/media/upload",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("adminMedia.uploadError")
                );
            }

            setMessage(t("adminMedia.uploadSuccess"));

            setFile(null);
            setAltText("");

            event.target.reset();

            await loadMedia();

        } catch (error) {
            console.error(
                "Error uploading media:",
                error
            );

            setError(error.message);

        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (item) => {
        setDeleteTarget(item);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        const { media_id: id } = deleteTarget;
        setDeleteTarget(null);

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/media/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        t("adminMedia.deleteError")
                );
            }

            setMessage(t("adminMedia.deleteSuccess"));

            await loadMedia();

        } catch (error) {
            console.error(
                "Error deleting media:",
                error
            );

            setError(error.message);
        }
    };

    return (
        <AdminLayout>

            <header className="admin-topbar">

                <div>

                    <h1>
                        {t("adminMedia.title")}
                    </h1>

                    <p>
                        {t("adminMedia.subtitle")}
                    </p>

                </div>

                <LanguageToggle
                    className="lang-toggle-light admin-header-language"
                />

            </header>

            <main className="admin-content">

                {/* Upload Section */}
                <div className="form-section">

                    <div className="admin-page-header">

                        <div>

                            <h2>
                                {t("adminMedia.uploadTitle")}
                            </h2>

                            <p>
                                {t("adminMedia.uploadText")}
                            </p>

                        </div>

                    </div>

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

                    <form onSubmit={handleUpload}>

                        <div className="form-group">

                            <label htmlFor="mediaFile">
                                {t("adminMedia.image")}
                            </label>

                            <input
                                id="mediaFile"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(event) =>
                                    setFile(
                                        event.target.files[0]
                                    )
                                }
                            />

                        </div>

                        <div className="form-group">

                            <label htmlFor="altText">
                                {t("adminMedia.altText")}
                            </label>

                            <input
                                id="altText"
                                type="text"
                                value={altText}
                                onChange={(event) =>
                                    setAltText(
                                        event.target.value
                                    )
                                }
                                placeholder={t(
                                    "adminMedia.altPlaceholder"
                                )}
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={uploading}
                            >
                                {uploading
                                    ? t("adminMedia.uploading")
                                    : t("adminMedia.uploadAction")}
                            </button>

                        </div>

                    </form>

                </div>

                {/* Media Library */}
                <div className="admin-page-header media-library-header">

                    <div>

                        <h2>
                            {t("adminMedia.library")}
                        </h2>

                        <p>
                            {media.length}{" "}
                            {media.length === 1
                                ? t("adminMedia.countOne")
                                : t("adminMedia.countMany")}
                        </p>

                    </div>

                </div>

                {loading ? (

                    <div className="admin-table-message">
                        {t("adminMedia.loading")}
                    </div>

                ) : media.length === 0 ? (

                    <div className="admin-table-message">

                        <h3>
                            {t("adminMedia.emptyTitle")}
                        </h3>

                        <p>
                            {t("adminMedia.emptyText")}
                        </p>

                    </div>

                ) : (

                    <div className="media-grid">

                        {media.map((item) => (

                            <div
                                className="media-card"
                                key={item.media_id}
                            >

                                <div className="media-preview">

                                    <img
                                        src={`http://localhost:5000${item.file_url}`}
                                        alt={
                                            item.alt_text ||
                                            item.file_name
                                        }
                                    />

                                </div>

                                <div className="media-card-content">

                                    <strong>
                                        {item.file_name}
                                    </strong>

                                    {item.alt_text && (
                                        <p>
                                            {item.alt_text}
                                        </p>
                                    )}

                                    <small>
                                        {item.file_type}
                                    </small>

                                    <button
                                        type="button"
                                        className="table-action delete"
                                        onClick={() =>
                                            handleDelete(item)
                                        }
                                    >
                                        {t("adminMedia.delete")}
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

            <ConfirmationDialog
                open={Boolean(deleteTarget)}
                title={t("adminMedia.deleteConfirmTitle")}
                description={`${t("adminMedia.deleteConfirm")}\n\n${deleteTarget?.file_name || ""}`}
                confirmLabel={t("confirmation.delete")}
                cancelLabel={t("confirmation.cancel")}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}

export default AdminMedia;

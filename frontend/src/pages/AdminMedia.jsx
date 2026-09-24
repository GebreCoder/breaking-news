import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../App.css";

function AdminMedia() {
    const [media, setMedia] = useState([]);
    const [file, setFile] = useState(null);
    const [altText, setAltText] = useState("");

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
                    "Failed to load media"
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

    useEffect(() => {
        loadMedia();
    }, []);

    const handleUpload = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!file) {
            setError(
                "Please select an image."
            );

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
                    "Upload failed"
                );
            }

            setMessage(
                "Image uploaded successfully."
            );

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

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmed) {
            return;
        }

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
                    "Failed to delete media"
                );
            }

            setMessage(
                "Image deleted successfully."
            );

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
                        Media Management
                    </h1>

                    <p>
                        Upload and manage images used by your news articles.
                    </p>

                </div>

            </header>

            <main className="admin-content">

                {/* Upload Section */}
                <div className="form-section">

                    <div className="admin-page-header">

                        <div>

                            <h2>
                                Upload Image
                            </h2>

                            <p>
                                Supported formats: JPG, PNG, WEBP and GIF.
                                Maximum size: 5 MB.
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
                                Image
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
                                Alt Text
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
                                placeholder="Describe the image"
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={uploading}
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Image"}
                            </button>

                        </div>

                    </form>

                </div>

                {/* Media Library */}
                <div className="admin-page-header media-library-header">

                    <div>

                        <h2>
                            Media Library
                        </h2>

                        <p>
                            {media.length}{" "}
                            {media.length === 1
                                ? "image"
                                : "images"}
                        </p>

                    </div>

                </div>

                {loading ? (

                    <div className="admin-table-message">
                        Loading media...
                    </div>

                ) : media.length === 0 ? (

                    <div className="admin-table-message">

                        <h3>
                            No media uploaded yet
                        </h3>

                        <p>
                            Upload your first image to build your media library.
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
                                            handleDelete(
                                                item.media_id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </AdminLayout>
    );
}

export default AdminMedia;
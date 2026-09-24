
const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getMedia,
    uploadMedia,
    deleteMedia
} = require("../controllers/mediaController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// =========================
// MULTER STORAGE
// =========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, uniqueName);
    }

});


// =========================
// FILE FILTER
// =========================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG, WEBP, and GIF images are allowed"
            )
        );
    }
};


// =========================
// UPLOAD CONFIGURATION
// =========================

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// =========================
// ROUTES
// =========================

// Get all media
router.get(
    "/",
    authenticateToken,
    getMedia
);


// Upload image
router.post(
    "/upload",
    authenticateToken,
    upload.single("image"),
    uploadMedia
);


// Delete image
router.delete(
    "/:id",
    authenticateToken,
    deleteMedia
);


module.exports = router;


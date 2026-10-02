const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadsDirectory = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    callback(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleMediaUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : error.message;

    res.status(400).json({ message });
  });
};

module.exports = {
  handleMediaUpload,
  uploadsDirectory,
};

const multer = require("multer");
const path = require("path");

function getPath(imageType) {
  if (imageType == "user_profile") {
    return "uploads/user_profiles";
  } else if (imageType == "store_profiles") {
    return "uploads/store_profile";
  } else if (imageType == "product_thumbnails") {
    return "uploads/product_thumbnails";
  } else {
    return "uploads";
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getPath(file.fieldname));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimeType && extname) {
      return cb(null, true); // Accept the file
    } else {
      return cb(
        new ClientError("Hanya file .jpeg, .jpg, dan .png yang diperbolehkan")
      );
    }
  },
});

function uploadSingleImage(imageType) {
  return upload.single(imageType);
}

module.exports = { uploadSingleImage };

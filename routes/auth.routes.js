const express = require("express");

const { registerUser, login } = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");
const validateCreateUser = require("../middleware/validation/create-user.validation");

const router = express.Router();

router.post(
  "/new",
  uploadSingleImage("user_profile"),
  validateCreateUser,
  registerUser
);

router.post("/login", login);

module.exports = router;

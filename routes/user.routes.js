const express = require("express");

const {
  addNewUser,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers");

const validateCreateUser = require("../middleware/validation/create-user.validation");
const validateUpdateUser = require("../middleware/validation/update-user.validation");
const { uploadSingleImage } = require("../middleware/imageUpload");

const router = express.Router();

router.get("/users/all", getAllUser);
router.get("/user/:id", getUserById);

router.post(
  "/user/new",
  uploadSingleImage("user_profile"),
  validateCreateUser,
  addNewUser
);

router.delete("/user/:id", deleteUserById);
router.put("/user/:id", validateUpdateUser, updateUserById);

module.exports = router;

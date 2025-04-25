const express = require("express");

const {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers");

const validateUpdateUser = require("../middleware/validation/update-user.validation");

const authorization = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/users/all", getAllUser);
router.get("/user/:id", getUserById);

router.delete("/user/:id", deleteUserById);
router.put("/user/:id", validateUpdateUser, updateUserById);

module.exports = router;

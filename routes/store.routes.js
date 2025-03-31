const express = require("express");

const {
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
} = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");

const router = express.Router();

router.post("/store/new/:id", uploadSingleImage("store_picture"), addNewStore);

module.exports = router;

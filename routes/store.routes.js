const express = require("express");
const authorization = require("../middleware/auth.middleware.js");

const {
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
  getManyStores,
  getStoreProduct,
} = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");

const router = express.Router();

router.post(
  "/store/new/",
  authorization(["User"]),
  uploadSingleImage("store_picture"),
  addNewStore
);

router.get("/store/:storeId", getStoreInfoById);

router.get("/store/:storeId/products", getStoreProduct);

router.get("/stores", getManyStores);

router.delete("/store", authorization(["Store_owner"]), deleteStore);

module.exports = router;

const express = require("express");

const {
  addNewProduct,
  searchProduct,
  getProductDetail,
} = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");
const authorization = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/product/new/",
  authorization(["Store_owner"]),
  uploadSingleImage("product_thumbnail"),
  addNewProduct
);

router.get("/product/search", searchProduct);
router.get("/product/detail/:productId", getProductDetail);

module.exports = router;

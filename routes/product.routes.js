const express = require("express");

const {
  addNewProduct,
  searchProduct,
  getProductDetail,
  deleteProduct,
} = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");
const authorization = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/product/new",
  authorization(["Store_owner"]),
  uploadSingleImage("product_thumbnail"),
  addNewProduct
);

router.delete("/product/:productId", deleteProduct);
router.get("/product/:productId", getProductDetail);

router.get("/product/search", searchProduct);

module.exports = router;

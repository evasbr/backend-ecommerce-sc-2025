const express = require("express");

const { addNewProduct, searchProduct } = require("../controllers");

const { uploadSingleImage } = require("../middleware/imageUpload");

const router = express.Router();

router.post(
  "/product/new/:id",
  uploadSingleImage("product_thumbnail"),
  addNewProduct
);

router.get("/product/search", searchProduct);

module.exports = router;

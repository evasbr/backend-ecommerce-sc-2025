const userRoutes = require("./user.routes");
const storeRoutes = require("./store.routes");
const productRoutes = require("./product.routes");

const express = require("express");

const Router = express.Router();

Router.use(userRoutes);
Router.use(storeRoutes);
Router.use(productRoutes);

module.exports = Router;

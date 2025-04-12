const userRoutes = require("./user.routes");
const storeRoutes = require("./store.routes");
const productRoutes = require("./product.routes");
const authRoutes = require("./auth.routes");

const express = require("express");

const Router = express.Router();

Router.use(userRoutes);
Router.use(storeRoutes);
Router.use(productRoutes);
Router.use("/auth", authRoutes);

module.exports = Router;

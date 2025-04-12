const {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("./user.controllers");

const {
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
} = require("./store.controllers");

const { addNewProduct, searchProduct } = require("./products.controllers");

const { registerUser, login } = require("./auth.controllers");

module.exports = {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
  addNewProduct,
  searchProduct,
  registerUser,
  login,
};

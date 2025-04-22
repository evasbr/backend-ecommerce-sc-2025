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
  getManyStores,
  getStoreProduct,
} = require("./store.controllers");

const {
  addNewProduct,
  searchProduct,
  getProductDetail,
} = require("./products.controllers");

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
  getStoreProduct,
  getProductDetail,
  getManyStores,
  addNewProduct,
  searchProduct,
  registerUser,
  login,
};

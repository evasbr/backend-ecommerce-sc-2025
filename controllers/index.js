const {
  addNewUser,
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

module.exports = {
  addNewUser,
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
};

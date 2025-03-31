const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addNewStore(req, res) {
  try {
    const id = req.params.id;

    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!userData) {
      throw new Error("User tidak ditemukan. Gagal membuat toko.");
    }

    //cek apakah user sudah memiliki toko
    let userStore = await prisma.store.findUnique({
      where: {
        id_user: id,
      },
    });

    if (userStore != null) {
      throw new Error("User sudah memiliki toko.");
    }

    const { store_name, store_description } = req.body;

    userStore = await prisma.store.create({
      data: {
        id_user: id,
        store_name,
        store_description,
        store_picture: req.file.path.replace(/\\/g, "/"),
        created_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Berhasil membuat toko",
      data: userStore,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function editStoreInfo(req, res) {}

async function deleteStore(req, res) {}

async function getStoreInfoById(req, res) {}

module.exports = {
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
};

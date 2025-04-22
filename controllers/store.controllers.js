const { PrismaClient } = require("@prisma/client");
const uploadToCloudinary = require("../utils/upload-to-cloudinary");

const prisma = new PrismaClient();

async function addNewStore(req, res) {
  try {
    const { store_name, store_description } = req.body;

    const userId = req.user.id_user;
    // Check if user exists
    const userData = await prisma.user.findUnique({
      where: { id_user: userId },
    });

    if (!userData) {
      throw new Error("User tidak ditemukan");
    }

    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
      where: { id_user: userId },
    });

    if (existingStore) {
      throw new Error("User sudah memiliki toko");
    }

    // Upload image
    let imageUrl = null;
    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "store_picture",
        req.file.originalname
      );
    }

    // Get store_owner level
    const ownerLevel = await prisma.userLevel.findFirst({
      where: {
        name: {
          equals: "store_owner",
          mode: "insensitive",
        },
      },
    });

    if (!ownerLevel) {
      throw new Error("Level 'store_owner' tidak ditemukan");
    }

    // Create store & update user in transaction
    /*transaction adalah metode dalam prisma dimana 
      semua operasi dalam transaksi harus berhasil semua,
      jika tidak, maka seluruh transaksi dibatalkan.   
    */
    const [userStore] = await prisma.$transaction([
      prisma.store.create({
        data: {
          id_user: userId,
          store_name,
          store_description,
          store_picture: imageUrl || null,
          created_at: new Date(),
        },
      }),
      prisma.user.update({
        where: { id_user: userId },
        data: { id_level: ownerLevel.id },
      }),
    ]);

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

async function deleteStore(req, res) {
  try {
    // Cek apakah user memiliki toko lewat user id yang ada di token
    let storeData = await prisma.store.findUnique({
      where: {
        id_user: req.user.id_user,
      },
    });

    // Jika data toko tidak ditemukan
    if (!storeData) {
      throw new Error("Toko tidak ditemukan");
    }

    const deletedStore = await prisma.store.update({
      where: {
        id_user: req.user.id_user,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Toko berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Toko gagal dihapus",
    });
  }
}

async function getStoreProduct(req, res) {
  try {
    const storeId = req.params.storeId;

    const productDatas = await prisma.product.findMany({
      where: {
        id_store: storeId,
        deleted_at: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Success to retrieve store's product",
      data: productDatas,
    });
  } catch (error) {
    console.log("getStoreProduc", error.message);
    res.status(400).json({
      success: false,
      message: "Failed to fetch store's product",
    });
  }
}

async function getStoreInfoById(req, res) {
  try {
    const storeId = req.params.storeId;

    let storeData = await prisma.store.findUnique({
      where: {
        id_store: storeId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil info toko",
      data: storeData,
    });
  } catch (error) {
    console.log("getStoreInfo By Id : ", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getManyStores(req, res) {
  try {
    const { key } = req.params;
    console.log("haha");
    // jika key tidak diberikan, tampilkan seluruh data toko
    const storeData = await prisma.store.findMany({
      where: key
        ? {
            store_name: {
              contains: key,
              mode: "insensitive",
            },
          }
        : {},
    });
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil toko",
      data: storeData,
    });
  } catch (error) {
    console.log("getManyStore By Id : ", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  addNewStore,
  editStoreInfo,
  deleteStore,
  getStoreInfoById,
  getManyStores,
  getStoreProduct,
};

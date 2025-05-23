const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllUser(req, res) {
  try {
    const allUserData = await prisma.user.findMany({
      where: {
        deleted_at: null,
      },
    });

    if (!allUserData) {
      throw new Error("Data user tidak ditemukan");
    }

    res.status(200).json({ success: true, data: allUserData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!userData) {
      throw new Error("Data pengguna tidak ditemukan");
    }

    if (userData.user_profile) {
      // Add the full URL for the image
      userData.user_profile = `http://localhost:3000/${userData.user_profile}`;
    }

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateUserById(req, res) {
  try {
    //mengambil id dari url parameter
    const id = req.params.id;
    console.log(id);

    //mencari apakah ada data sesuai id
    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });

    //cek jika userData tidak ada, maka kembalikan error
    if (!userData) {
      throw new Error("Data user tidak ditemukan");
    }

    // ambil data perubahan dari body request
    const { user_name, user_birthday } = req.body;
    console.log(user_name);
    console.log(user_birthday);

    const newData = {
      ...userData,
      user_name,
    };

    if (user_birthday) {
      newData.user_birthday = new Date(user_birthday);
    }

    await prisma.user.update({
      where: {
        id_user: id,
      },
      data: {
        ...newData,
      },
    });

    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diubah",
      data: newData,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteUserById(req, res) {
  try {
    //ambil id dari parameter url
    const id = req.params.id;

    //cari apakah data dengan id tersebut ada
    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
        deleted_at: null,
      },
    });

    // jika data tidak ditemukan, kirim error
    if (!userData) {
      throw new Error("Data pengguna tidak ditemukan. Gagal menghapus data");
    }

    //hapus data
    await prisma.user.update({
      where: {
        id_user: id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
};

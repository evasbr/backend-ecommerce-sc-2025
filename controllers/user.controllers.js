const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addNewUser(req, res) {
  try {
    //mengambil data dari body
    const {
      user_name,
      user_birthday,
      user_email,
      user_password,
      user_profile,
    } = req.body;

    //periksa apakah sudah ada email yang sama
    const dataUser = await prisma.user.findUnique({
      where: {
        user_email,
      },
    });

    if (dataUser) {
      throw new Error(
        "Email sudah ada. Masuk atau gunakan email lain untuk mendaftar"
      );
    }

    // mengirim data ke database
    const data = await prisma.user.create({
      data: {
        user_name,
        user_birthday: new Date(user_birthday),
        user_email,
        user_password,
        user_profile,
        created_at: new Date(),
        id_level: "1",
      },
    });

    if (!data) {
      throw new Error("Gagal membuat akun baru");
    }

    res.status(201).json({
      success: true,
      message: "Berhasil membuat akun",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllUser(req, res) {
  try {
    const allUserData = await prisma.user.findMany();

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

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateUserById(req, res) {
  try {
    //mengambil id dari url parameter
    const id = req.params.id;

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
    const { user_name, user_birthday, user_profile } = req.body;

    const newData = {
      ...userData,
      user_name,
      user_profile,
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
      },
    });

    // jika data tidak ditemukan, kirim error
    if (!userData) {
      throw new Error("Data pengguna tidak ditemukan. Gagal menghapus data");
    }

    //hapus data
    await prisma.user.delete({
      where: {
        id_user: id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Data pengguna berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  addNewUser,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
};

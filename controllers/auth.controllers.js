const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require("../utils/upload-to-cloudinary.js");

const prisma = new PrismaClient();

async function registerUser(req, res) {
  try {
    const { user_name, user_birthday, user_email, user_password } = req.body;

    // Cek apakah field yang wajib sudah lengkap
    if (!user_name || !user_email || !user_password) {
      throw new Error("Username, email, dan password harus ada");
    }

    // Check if email is already used
    const dataUser = await prisma.user.findUnique({
      where: { user_email },
    });

    if (dataUser) {
      throw new Error(
        "Email sudah ada. Masuk atau gunakan email lain untuk mendaftar"
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    const level = await prisma.userLevel.findFirst({
      where: {
        name: { equals: "User", mode: "insensitive" },
      },
      select: { id: true },
    });

    let imageUrl = null;
    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "user_profile",
        req.file.originalname
      );
    }

    const userData = await prisma.user.create({
      data: {
        user_name,
        user_birthday: new Date(user_birthday),
        user_email,
        user_password: hashedPassword,
        created_at: new Date(),
        user_profile: imageUrl ? imageUrl : null,
        id_level: level.id,
      },
    });

    // jangan sertakan password di response
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "Successfully registered a user",
      data: userData,
    });
  } catch (error) {
    console.error("registerUser error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create new user.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    let dataUser = await prisma.user.findUnique({
      where: { user_email: email },
      select: {
        id_user: true,
        user_name: true,
        user_birthday: true,
        user_email: true,
        user_password: true,
        level: {
          select: { name: true },
        },
      },
    });

    if (!dataUser) {
      throw new Error("Email not found");
    }

    const match = await bcrypt.compare(password, dataUser.user_password);
    if (!match) {
      throw new Error("Password not valid");
    }

    const id_user = dataUser.id_user;
    const userLevel = dataUser.level.name;

    const token = jwt.sign(
      { id_user, role: userLevel },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // tidak menyertakan password pada response
    delete dataUser.user_password;
    dataUser.level = userLevel;

    res
      .cookie("token", token, {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || false,
      })
      .status(200)
      .json({
        success: true,
        message: "Successfully logged in",
        data: dataUser,
        token,
      });
  } catch (error) {
    console.log("login error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to login.",
    });
  }
}

async function logout(req, res, next) {
  try {
    // Clear the token by setting it to expire in the past
    // res.cookie("token", "", {
    //   expires: new Date(0),
    //   httpOnly: true,
    // });

    // Optionally, clear the cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    console.log("logout error: " + error);
    next(error);
  }
}

module.exports = { registerUser, login, logout };

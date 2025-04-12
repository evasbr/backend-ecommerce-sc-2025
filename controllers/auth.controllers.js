const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

async function registerUser(req, res) {
  let uploadedFilePath;

  try {
    const { user_name, user_birthday, user_email, user_password } = req.body;

    // Store the uploaded file path if multer has stored a file
    if (req.file) {
      uploadedFilePath = req.file.path.replace(/\\/g, "/");
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

    const userData = await prisma.user.create({
      data: {
        user_name,
        user_birthday: new Date(user_birthday),
        user_email,
        user_password: hashedPassword,
        created_at: new Date(),
        user_profile: uploadedFilePath || null,
        id_level: level.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully registered a user",
      data: userData,
    });
  } catch (error) {
    // Delete uploaded file if an error occurred
    if (uploadedFilePath) {
      const absolutePath = path.join(__dirname, "..", uploadedFilePath); // Adjust ".." if needed
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

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

    // Check if the email exist
    let dataUser = await prisma.user.findUnique({
      where: {
        user_email: email,
      },
      select: {
        id_user: true,
        user_name: true,
        user_birthday: true,
        user_email: true,
        user_password: true,
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    // Check if the password given match the password stored in database
    // we have to decrypt the password in database to its original form
    const match = await bcrypt.compare(password, dataUser.user_password);
    if (!match) {
      throw new Error("Password not valid");
    }

    // we will store the user_id and level to the token, so we have to extract it first.
    const id_user = dataUser.user_id;
    const userLevel = dataUser.level.name;

    // Generate a token based on user data
    const token = jwt.sign(
      { id_user, role: userLevel },
      process.env.JWT_SECRET,
      {
        expiresIn: "60s",
      }
    );

    dataUser = {
      ...dataUser,
      level: dataUser.level.name,
    };


    //  localstorage, sessioin storage
    res
      // .cookie("token", token, { signed: true, httpOnly: true })
      .status(200)
      .json({
        success: true,
        message: "Successfully login",
        data: dataUser,
        token,
      });
  } catch (error) {
    console.log("login : " + error);
    res.status(400).json({
      success: false,
      message: "Failed to login.",
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

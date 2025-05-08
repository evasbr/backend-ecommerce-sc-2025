const express = require("express");
const Router = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const allowedOrigins = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    method: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.urlencoded({ extended: true }));

app.use(Router);

app.listen(5000, () => {
  console.log(`Server berjalan di http://localhost:5000/`);
});

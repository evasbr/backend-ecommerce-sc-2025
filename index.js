const express = require("express");
const Router = require("./routes");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(Router);

app.listen(3000, () => {
  console.log(`Server berjalan di http://localhost:3000/`);
});

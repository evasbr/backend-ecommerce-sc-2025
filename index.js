const express = require("express");
const Router = require("./routes");

const app = express();

app.use(express.json());

app.use(Router);

app.listen(3000, () => {
  console.log(`Server berjalan di http://localhost:3000/`);
});

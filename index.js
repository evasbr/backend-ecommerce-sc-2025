const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.listen(3000, () => {
  console.log(`Server berjalan di http://localhost:3000/`);
});

const express = require("express");
const app = express();
const cors = require("cors");
const { connection } = require("./configs/db");
const PORT = process.env.PORT || 1010;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "OK" });
});

(async () => {
  try {
    await connection;
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();

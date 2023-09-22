const express = require("express");
const app = express();
const cors = require("cors");
const { connection } = require("./configs/db");
const { userRouter } = require("./routes/user.router");
const { categoryRouter } = require("./routes/category.router");
const { productRouter } = require("./routes/product.router");
const { authentication } = require("./middlewares/authentication.middleware");
const PORT = process.env.PORT || 1010;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api", userRouter);
app.use("/api", authentication, categoryRouter);
app.use("/api", authentication, productRouter);

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

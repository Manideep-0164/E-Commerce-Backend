const productRouter = require("express").Router();
const mongoose = require("mongoose");
require("dotenv").config();
const { ProductModel } = require("../models/product.model");
const { authorize } = require("../middlewares/authorization.middleware");
const { authentication } = require("../middlewares/authentication.middleware");

productRouter.post(
  "/add-products",
  authentication,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const payload = req.body;

      const totalProducts = await ProductModel.insertMany(payload);

      res.status(201).json({ message: "Products added." });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again later." });
    }
  }
);

productRouter.get("/get-products/:id", async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id);

    const products = await ProductModel.aggregate([
      { $match: { category: categoryId } },
      { $project: { category: 0, createdAt: 0, __v: 0 } },
    ]);

    if (products.length === 0)
      return res.status(404).json({ message: "No products found." });

    res.status(200).json(products);
  } catch (error) {
    console.log("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

productRouter.get("/get-product/:id", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    const product = await ProductModel.aggregate([
      { $match: { _id: id } },
      { $project: { category: 0, createdAt: 0, __v: 0 } },
    ]);

    if (product.length === 0)
      return res.status(404).json({ message: "Product does not exist." });

    res.status(200).json(product);
  } catch (error) {
    console.log("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  productRouter,
};

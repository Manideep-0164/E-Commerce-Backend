const categoryRouter = require("express").Router();
require("dotenv").config();
const { CategoryModel } = require("../models/category.model");
const { authorize } = require("../middlewares/authorization.middleware");
const { authentication } = require("../middlewares/authentication.middleware");

categoryRouter.post(
  "/add-category",
  authentication,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      const category = await CategoryModel.findOne({ name });

      if (category)
        return res.status(409).json({ message: "Category already exists." });

      const newCategory = new CategoryModel({
        name,
        description,
      });

      await newCategory.save();

      res.status(201).json({ message: "Category added." });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again later." });
    }
  }
);

categoryRouter.post(
  "/add-categories",
  authentication,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const payload = req.body;

      const cartegories = await CategoryModel.insertMany(payload);

      console.log(cartegories);

      res.status(201).json({ message: "Categories added." });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again later." });
    }
  }
);

categoryRouter.get("/get-categories", async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    if (categories.length === 0)
      return res.status(404).json({ message: "No categories found" });

    res.status(200).json(categories);
  } catch (error) {
    console.log("Error fetching categories:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  categoryRouter,
};

const orderRouter = require("express").Router();
const mongoose = require("mongoose");
require("dotenv").config();
const { CartModel } = require("../models/cart.model");
const { ProductModel } = require("../models/product.model");
const { OrderModel } = require("../models/order.model");

orderRouter.post("/place-order", async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user;

    // Find the user's cart
    const userCart = await CartModel.findOne({ user: userId });

    if (!userCart) return res.status(404).json({ message: "Cart not found." });
    if (userCart.items.length === 0)
      return res.status(200).send({ message: "Cart is empty." });

    // order Info
    const orderInfo = {
      user: userId,
      items: [...userCart.items],
      totalQuantity: userCart.totalQuantity,
      totalPrice: userCart.totalPrice,
      address: address,
    };

    const orderInstance = new OrderModel(orderInfo);

    // Clear user's cart
    userCart.items = [];
    userCart.totalPrice = 0;
    userCart.totalQuantity = 0;

    await userCart.save();
    await orderInstance.save();

    return res.status(201).json({ message: "Order placed successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  orderRouter,
};

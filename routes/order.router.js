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

orderRouter.get("/get-orders", async (req, res) => {
  try {
    const userId = req.user;

    const orders = await OrderModel.find({ user: userId })
      .select(
        "_id user totalQuantity totalPrice address status createdAt items"
      )
      .populate({
        path: "items.product",
        select: "title brand price imageUrl",
      });

    if (orders.length === 0)
      return res.status(404).json({ message: "Orders not found." });

    if (orders[0].items.length === 0)
      return res.status(204).json({ message: "Order is empty" });

    res.status(200).json(orders);
  } catch (error) {
    console.log("Error fetching cart:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

orderRouter.get("/get-order/:orderId", async (req, res) => {
  try {
    const userId = req.user;
    const { orderId } = req.params;

    const order = await OrderModel.find({ _id: orderId, user: userId })
      .select(
        "_id user totalQuantity totalPrice address status createdAt items"
      )
      .populate({
        path: "items.product",
        select: "title brand price imageUrl",
      });

    if (order.length === 0)
      return res.status(404).json({ message: "Order not found." });

    if (order[0].items.length === 0)
      return res.status(204).json({ message: "Order is empty" });

    res.status(200).json(order);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID." });
    }
    console.log("Error fetching cart:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  orderRouter,
};

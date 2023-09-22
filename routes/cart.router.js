const cartRouter = require("express").Router();
const mongoose = require("mongoose");
require("dotenv").config();
const { CartModel } = require("../models/cart.model");
const { ProductModel } = require("../models/product.model");

cartRouter.post("/add-to-cart/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;

    // Find the product
    const isProductExists = await ProductModel.findOne({
      _id: productId,
    });

    if (!isProductExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (isProductExists.availability === "Out of Stock") {
      return res.status(404).json({ message: "Product is out of stock." });
    }

    // Find the user's cart
    const userCart = await CartModel.findOne({ user: userId });

    // cart payload
    const cartItem = {
      product: isProductExists._id,
      quantity: 1,
      price: isProductExists.price,
    };

    // creating the cart for the first time
    if (!userCart) {
      // decrease product's stock
      isProductExists.stock -= 1;

      if (isProductExists.stock === 0) {
        isProductExists.availability = "Out of Stock";
      }

      await isProductExists.save();

      const cartPayload = {
        user: userId,
        items: [cartItem],
        totalQuantity: 1,
        totalPrice: parseFloat(isProductExists.price),
      };

      const createCart = new CartModel(cartPayload);
      await createCart.save();

      return res.status(201).json({ message: "Item added to cart." });
    }

    // checking whether an item is already added to cart
    const isItemAlreadyExists = userCart.items.filter(
      (item, ind) => item.product.toString() === productId
    );

    if (isItemAlreadyExists.length !== 0)
      return res.status(409).json({ message: "Item already in the cart." });

    // decrease product's stock
    isProductExists.stock -= 1;

    if (isProductExists.stock === 0) {
      isProductExists.availability = "Out of Stock";
    }

    await isProductExists.save();

    // calculate the total price
    const finalPrice = (isProductExists.price + userCart.totalPrice).toFixed(2);

    userCart.items.push(cartItem);
    userCart.totalPrice = parseFloat(finalPrice);
    userCart.totalQuantity += 1;

    await userCart.save();

    return res.status(200).json({ message: "Item added to cart." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

cartRouter.get("/cart", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const userCart = await CartModel.aggregate([
      { $match: { user: userId } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product_info",
        },
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalPrice: 1,
          items: 1,
          product_info: { $arrayElemAt: ["$product_info", 0] },
        },
      },
    ]);

    if (userCart.length === 0)
      return res.status(204).json({ message: "Cart is empty." });

    if (userCart[0].items.length === 0)
      return res.status(204).json({ message: "Cart is empty" });

    res.status(200).json(userCart);
  } catch (error) {
    console.log("Error fetching cart:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

cartRouter.patch("/update-quantity/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { action } = req.body;
    const userId = req.user;

    // Find the product
    const isProductExists = await ProductModel.findOne({
      _id: productId,
    });

    if (!isProductExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the user's cart
    const userCart = await CartModel.findOne({ user: userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Check if the item exists in the userCart
    const cartItem = userCart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

    // Qty increament
    if (action === "increase") {
      // Out of stock, Validation.
      if (isProductExists.availability === "Out of Stock") {
        return res.status(404).json({ message: "Product is out of stock." });
      }

      isProductExists.stock -= 1;
      if (isProductExists.stock === 0) {
        isProductExists.availability = "Out of Stock";
      }
      await isProductExists.save();

      cartItem.quantity += 1;
      userCart.totalQuantity += 1;
      userCart.totalPrice += cartItem.price;

      // Qty decreament
    } else if (action === "decrease") {
      if (cartItem.quantity > 1) {
        isProductExists.stock += 1;
        if (isProductExists.availability === "Out of Stock") {
          isProductExists.availability = "In Stock";
        }
        await isProductExists.save();

        cartItem.quantity -= 1;
        userCart.totalQuantity -= 1;
        userCart.totalPrice -= cartItem.price;
      }
    } else {
      return res.status(400).json({ message: "Invalid action." });
    }

    // Update userCart.items to reflect changes in cartItem
    userCart.markModified("items");

    await userCart.save();

    return res.status(200).json({ message: "Cart quantity updated." });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

cartRouter.delete("/delete-item/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;

    // Find the product
    const isProductExists = await ProductModel.findOne({
      _id: productId,
    });

    if (!isProductExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the user's cart
    const userCart = await CartModel.findOne({ user: userId });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Check if the item exists in the userCart
    const cartItem = userCart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in the cart." });
    }

    // Increasing the product's stock
    isProductExists.stock += cartItem.quantity;
    if (isProductExists.availability === "Out of Stock") {
      isProductExists.availability = "In Stock";
    }
    await isProductExists.save();

    const updatedCartItems = userCart.items.filter(
      (item, ind) => item.product.toString() !== productId
    );

    const cartItemTotalPrice = cartItem.price * cartItem.quantity;

    userCart.items = updatedCartItems;
    userCart.totalQuantity -= cartItem.quantity;
    userCart.totalPrice -= cartItemTotalPrice;
    userCart.totalPrice = parseFloat(userCart.totalPrice.toFixed(2));

    await userCart.save();

    return res.status(200).json({ message: "Cart item successfully removed." });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = {
  cartRouter,
};

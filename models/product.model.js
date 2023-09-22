const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categorie",
    required: true,
  },
  brand: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
  },
  specifications: {
    type: Object,
  },
  availability: {
    type: String,
    required: true,
    enum: ["In Stock", "Out of Stock", "Limited Quantity"],
    default: "In Stock",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = { ProductModel };

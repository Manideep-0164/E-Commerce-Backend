const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const CategoryModel = mongoose.model("Categorie", categorySchema);

module.exports = {
  CategoryModel,
};

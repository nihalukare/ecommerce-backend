const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  rating: { type: Number, required: true },
  actualPrice: { type: Number, required: true },
  discount: { type: Number, default: 0, required: true },
  discountedPrice: { type: Number, default: 0, required: true },
  warranty: { type: Number, default: 0, required: true },
  imageUrl: { type: String, required: true },
  description: { type: [String], default: [], required: true },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

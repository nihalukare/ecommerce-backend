const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
});

const Categories = mongoose.model("Categories", categoriesSchema);
module.exports = Categories;

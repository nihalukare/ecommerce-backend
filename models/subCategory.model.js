const mongoose = require("mongoose");

const subCategoriesSchema = new mongoose.Schema({
  subCategoryName: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const SubCategory = mongoose.model("SubCategory", subCategoriesSchema);
module.exports = SubCategory;

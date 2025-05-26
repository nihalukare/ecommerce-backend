const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: { type: [Object], required: true },
    address: { type: Object, required: true },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", orderSchema);
module.exports = Orders;

const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  country: { type: String, required: true, default: "India" },
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  flatOrHouse: {
    type: String,
    required: true,
  },
  areaOrStreet: { type: String, required: true },
  landmark: { type: String, required: false },
  townOrCity: { type: String, required: true },
  state: { type: String, required: true },
  isDefaultAddress: { type: Boolean, required: true },
});

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;

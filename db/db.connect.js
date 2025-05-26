const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB;

async function initializeDatabase() {
  await mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Database connected successfully.");
    })
    .catch((error) => {
      console.log("Error connecting to database.", error);
    });
}

module.exports = { initializeDatabase };

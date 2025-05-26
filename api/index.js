const { initializeDatabase } = require("../db/db.connect");
const express = require("express");
const serverless = require("serverless-http");

require("dotenv").config();

const cors = require("cors");

const Product = require("../models/products.model");
const SubCategory = require("../models/subCategory.model");
const Categories = require("../models/category.model");
const Address = require("../models/address.model");
const Orders = require("../models/orders.model");
const fs = require("fs");
const { console } = require("inspector/promises");

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

initializeDatabase();

const jsonData = fs.readFileSync("./data/products.json", "utf-8");
const products = JSON.parse(jsonData);

// function to seed all the products into Db
function seedProducts(products) {
  try {
    for (const product of products) {
      const newProduct = new Product({
        productName: product.productName,
        category: product.category,
        subCategory: product.subCategory,
        rating: product.rating,
        actualPrice: product.actualPrice,
        discount: product.discount,
        discountedPrice: product.discountedPrice,
        warranty: product.warranty,
        imageUrl: product.imageUrl,
        description: product.description,
      });

      newProduct.save();
    }
  } catch (error) {
    console.log("Error seeding data:", error);
  }
}
// seedProducts(products);

// function to seed sub categories into Db
async function seedProductsBySubCategory() {
  try {
    const distinctSubCategories = await Product.distinct("subCategory");

    distinctSubCategories.map(async (subCategoryValue) => {
      const productIdsBySubCategory = await Product.find(
        {
          subCategory: subCategoryValue,
        },
        { _id: 1 }
      );

      const productIds = productIdsBySubCategory.map(
        (productObject) => productObject._id
      );

      const newSubCategory = new SubCategory({
        subCategoryName: subCategoryValue,
        products: productIds,
      });

      newSubCategory.save();
    });
  } catch (error) {
    console.log(error);
  }
}
// seedProductsBySubCategory();

// function to seed categories into Db
async function seedCategories() {
  try {
    const distinctCategories = await Product.distinct("category");

    distinctCategories.map(async (categoryValue) => {
      const subCategoriesNames = await Product.distinct("subCategory", {
        category: categoryValue,
      });

      const subCategoryIdsObjs = await Promise.all(
        subCategoriesNames.map(
          async (subCategory) =>
            await SubCategory.find({ subCategoryName: subCategory }, { _id: 1 })
        )
      );

      const subCategoryIds = subCategoryIdsObjs.flat().map((obj) => obj._id);

      const newCategory = new Categories({
        categoryName: categoryValue,
        subCategory: subCategoryIds,
      });

      newCategory.save();
    });
  } catch (error) {
    console.log(error);
  }
}
// seedCategories();

// function to get all products from the db
async function readAllProducts() {
  try {
    const allProducts = await Product.find();
    return allProducts;
  } catch (error) {
    console.log(error);
  }
}
// api to get all products
app.get("/api/products", async (req, res) => {
  try {
    const allProducts = await readAllProducts();

    if (allProducts.length != 0) {
      res.status(200).json({
        data: {
          products: allProducts,
        },
      });
    } else {
      res.status(404).json({ message: "No Products found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to get product by Id
async function readProductById(productId) {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
    console.log(error);
  }
}
// api to get product by Id
app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await readProductById(req.params.productId);

    if (product) {
      res.status(200).json({
        data: {
          product: product,
        },
      });
    } else {
      res.status(404).json({ message: "No Product found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to get all categories
async function readAllCategories() {
  try {
    const categories = await Categories.find();
    return categories;
  } catch (error) {
    console.log(error);
  }
}
// api to get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await readAllCategories();

    if (categories.length != 0) {
      res.status(200).json({
        data: {
          categories: categories,
        },
      });
    } else {
      res.status(404).json({ message: "No categories found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to get category by Id
async function readCategoryById(categoryId) {
  try {
    const category = await Categories.findById(categoryId).populate(
      "subCategory"
    );
    return category;
  } catch (error) {
    console.log(error);
  }
}
// api to get category by Id
app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const category = await readCategoryById(req.params.categoryId);

    if (category) {
      res.status(200).json({
        data: {
          category: category,
        },
      });
    } else {
      res.status(404).json({ message: "No Category found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to get sub category by Id
async function readSubCategoryById(subCategoryId) {
  try {
    const subCategory = await SubCategory.findById(subCategoryId).populate(
      "products"
    );
    return subCategory;
  } catch (error) {
    console.log(error);
  }
}
// api to read subCategory by Id
app.get("/api/subCategory/:subCategoryId", async (req, res) => {
  try {
    const subCategory = await readSubCategoryById(req.params.subCategoryId);
    if (subCategory) {
      res.status(200).json({
        data: {
          subCategory: subCategory,
        },
      });
    } else {
      res.status(404).json({ message: "No subCategory found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to get products by subCategory
async function readProductsBySubCategory(subCategory) {
  try {
    const products = await Product.find({ subCategory: subCategory });
    return products;
  } catch (error) {
    console.log(error);
  }
}
// api to get products by subCategory
app.get("/api/products/subCategory/:subCategoryName", async (req, res) => {
  try {
    const products = await readProductsBySubCategory(
      req.params.subCategoryName
    );
    if (products.length > 0) {
      res.status(200).json({
        message: "Products found successfully.",
        data: {
          products: products,
        },
      });
    } else {
      res.status(404).json({ message: "No products found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to create a new Address
async function createAddress(newAddress) {
  try {
    const address = new Address(newAddress);
    const saveAddress = await address.save();
    return saveAddress;
  } catch (error) {
    console.error("Mongoose validation error:", error);
    throw error;
  }
}
// api to create a new Address
app.post("/api/addresses", async (req, res) => {
  try {
    const savedAddress = await createAddress(req.body);
    if (savedAddress) {
      res.status(200).json({
        message: "Address Added successfully.",
        address: savedAddress,
      });
    }
  } catch (error) {
    console.log("Failed to create address", error);
    if (error.name === "validationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", details: error });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// function to read all addresses
async function readAllAddresses() {
  try {
    const addresses = await Address.find();
    return addresses;
  } catch (error) {
    console.log(error);
  }
}
// api to read all addresses
app.get("/api/addresses", async (req, res) => {
  try {
    const addresses = await readAllAddresses();
    if (addresses) {
      res
        .status(200)
        .json({ message: "Addresses found successfully", data: addresses });
    } else {
      res.status(404).json({ message: "No address found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to delete a address
async function deleteAddress(addressId) {
  try {
    const deletedAddress = await Address.findByIdAndDelete(addressId);
    return deletedAddress;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// Api to delete a address
app.delete("/api/addresses/:addressId", async (req, res) => {
  try {
    const deletedAddress = await deleteAddress(req.params.addressId);
    if (deletedAddress) {
      res.status(200).json({
        message: "Address deleted successfully.",
        data: deletedAddress,
      });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to read address by Id
async function readAddressById(addressId) {
  try {
    const address = await Address.findById(addressId);
    return address;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// api to get address by Id
app.get("/api/addresses/:addressId", async (req, res) => {
  try {
    const address = await readAddressById(req.params.addressId);
    if (address) {
      res
        .status(200)
        .json({ message: "Address found successfully!", data: address });
    } else {
      res.status(404).json({ message: "Address not found!" });
    }
  } catch (error) {
    console.log("Failed to find address", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// function to create a new order
async function createOrder(newOrder) {
  try {
    const order = new Orders(newOrder);
    const savedOrder = await order.save();
    return savedOrder;
  } catch (error) {
    console.log("Mongoose validation error", error);
    throw error;
  }
}
// Api to create new order
app.post("/api/orders", async (req, res) => {
  try {
    const savedOrder = createOrder(req.body);
    if (savedOrder) {
      res.status(200).json({
        message: "Order placed successfully.",
        savedOrder: savedOrder,
      });
    }
  } catch (error) {
    console.log("Falied to create a new address.", error);
    if (error.name === "validationError") {
      res.status(400).json({ message: "Validation failed", details: error });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// function to read all placed Orders
async function readAllOrders() {
  try {
    const orders = await Orders.find()
      .sort({ createdAt: -1 })
      .populate("address");
    return orders;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// Api to get all placed orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await readAllOrders();

    if (orders) {
      res
        .status(200)
        .json({ message: "Orders found successfully.", orders: orders });
    } else {
      res.status(404).json({ message: "No orders found." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// function to find addresses by Id and update
async function updateAddress(addressId, dataToUpdate) {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      dataToUpdate,
      { new: true, runValidators: true }
    );
    return updatedAddress;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// Api to update the address
app.put("/api/addresses/:addressId", async (req, res) => {
  try {
    const updatedAddress = await updateAddress(req.params.addressId, req.body);

    if (updatedAddress) {
      res.status(200).json({
        message: "Address updated successfully.",
        updatedAddress: updatedAddress,
      });
    } else {
      res.status(404).json({ message: "Address not found." });
    }
  } catch (error) {
    console.log(error);
    if ((error.name = "validationError")) {
      res.status(400).json({ message: "Validation failed", error: error });
    }
    res.status(500).json({ message: "Internal server error." });
  }
});

// server run
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log("server running on port", PORT);
// });

module.exports = app;
module.exports.handler = serverless(app);

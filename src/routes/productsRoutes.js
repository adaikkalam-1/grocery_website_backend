const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const {
  getProduct,
  createProduct,
  updateProduct,
  getProductById,
  updateProductStatus,
} = require("../controller/products/ProductsController");

router.get("/", getProduct);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.get("/:id", getProductById);
router.patch("/", authMiddleware, updateProductStatus);

module.exports = router;

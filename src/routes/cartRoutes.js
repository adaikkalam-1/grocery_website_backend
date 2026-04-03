const express = require("express");
const router = express.Router();
const {
  addToCart,
  incrementItem,
  decrementItem,
  getCart,
  clearCart,
  clearSingleItem,
} = require("../controller/cart/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addToCart);
router.post("/increment", authMiddleware, incrementItem);
router.post("/decrement", authMiddleware, decrementItem);
router.get("/:userId", authMiddleware, getCart);
router.delete("/:userId", authMiddleware, clearCart);
router.delete("/:userId/:productId", authMiddleware, clearSingleItem);

module.exports = router;

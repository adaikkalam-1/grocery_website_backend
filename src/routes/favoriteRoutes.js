const express = require("express");
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
} = require("../controller/favorite/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, toggleFavorite);
router.get("/:userId", authMiddleware, getFavorites);

module.exports = router;

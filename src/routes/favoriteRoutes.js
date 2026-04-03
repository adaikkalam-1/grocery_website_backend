const express = require("express");
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
} = require("../controller/favorite/favoriteController");

router.post("/", toggleFavorite);
router.get("/:userId", getFavorites);

module.exports = router;

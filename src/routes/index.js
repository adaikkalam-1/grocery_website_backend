const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/categories", require("./categoriesRoutes"));
router.use("/image", require("./imageUploadRoutes"));
router.use("/products", require("./productsRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/address", require("./addressRoutes"));
router.use("/checkout", require("./checkoutRoutes"));
router.use("/wishlist", require("./favoriteRoutes"));

module.exports = router;

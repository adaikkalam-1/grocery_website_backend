const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAddress,
  getAddressByID,
  getAllAddressUser,
} = require("../controller/addresses/addressController");
const router = express.Router();

router.post("/", authMiddleware, createAddress);
router.get("/:id", authMiddleware, getAddressByID);
router.get("/all/:user_id", authMiddleware, getAllAddressUser);

module.exports = router;

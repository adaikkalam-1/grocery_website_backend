const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAddress,
  getAddressByID,
  getAllAddressUser,
  updateAddress,
  updateDefaultAddress,
} = require("../controller/addresses/addressController");
const router = express.Router();

router.post("/", authMiddleware, createAddress);
router.get("/:id", authMiddleware, getAddressByID);
router.get("/all/:user_id", authMiddleware, getAllAddressUser);
router.put("/:id", authMiddleware, updateAddress);
router.patch("/", authMiddleware, updateDefaultAddress);

module.exports = router;

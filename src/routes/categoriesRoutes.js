const express = require("express");

const {
  getCategories,
  createCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} = require("../controller/category/categoriesController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", getCategories);

router.post("/", authMiddleware, createCategories);
router.put("/", authMiddleware, updateCategory);
router.get("/:id", authMiddleware, getCategoryById);
router.patch("/:id", authMiddleware, updateCategoryStatus);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;

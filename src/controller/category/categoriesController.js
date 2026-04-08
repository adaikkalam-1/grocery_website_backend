const db = require("../../../config/dbConfig");
const {
  categoriesSchema,
  upCategoriesSchema,
} = require("../../validations/categoriesValidation");

const getCategories = async (req, res) => {
  try {
    let [data] = await db.query(
      "SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id",
    );
    return res.status(200).json({
      message: "Categories fetched successfully",
      data: data,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

const createCategories = async (req, res) => {
  try {
    const { value, error } = categoriesSchema.validate(req.body);
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({
        status: false,
        message: message,
      });
    }
    const { category_name, description, category_slug, status, image_url } =
      value;

    const [existing] = await db.query(
      "SELECT * FROM categories WHERE category_name = ?",
      [category_name],
    );
    if (existing.length > 0) {
      return res
        .status(404)
        .json({ message: "Category name already Available" });
    }

    await db.query(
      "INSERT INTO categories (category_name,description,category_slug,status,image_url) VALUES (?,?,?,?,?)",
      [category_name, description, category_slug, status, image_url],
    );

    return res.status(201).json({
      status: true,
      message: "Categories created successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let [result] = await db.query("SELECT * FROM categories WHERE id = ? ", [
      id,
    ]);
    if (result.length == 0) {
      return res.status(404).json({
        status: "false",
        message: "Categories not found",
      });
    }
    return res.status(200).json({
      status: true,
      data: result,
      message: "Category Data is Successfully fetched ",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { value, error } = upCategoriesSchema.validate(req.body);
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");

      return res.status(404).json({
        status: false,
        message: message,
      });
    }
    let { id, category_name, description, category_slug, status, image_url } =
      value;
    let [data] = await db.query("SELECT * FROM categories WHERE id = ? ", [id]);
    if (data.length == 0) {
      return res.status(404).json({
        status: false,
        message: "Category data is not available",
      });
    }

    await db.query(
      "UPDATE categories  SET category_name =? , description= ? , category_slug= ?, status = ?, image_url= ? WHERE id = ?",
      [category_name, description, category_slug, status, image_url, id],
    );

    return res.status(201).json({
      status: true,
      message: "Categories update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Status must be 'active' or 'inactive'",
      });
    }

    await db.query("SELECT * FROM categories WHERE id =?", [id]);

    await db.query("UPDATE categories SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    return res.status(200).json({
      status: true,
      message: "Status Update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    if (result == 0) {
      return res.status(400).json({
        status: false,
        message: "category not found",
      });
    }
    await db.query("DELETE FROM categories WHERE id=?", [id]);
    res.status(200).json({
      status: true,
      message: "Categories deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategories,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};

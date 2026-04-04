const db = require("../../../config/dbConfig");
const { createProductSchema } = require("../../validations/productsValidation");

const getProduct = async (req, res) => {
  const { category_id, search } = req.query || {
    category_id: "all",
    search: "",
  };
  try {
    let result = [];
    if (category_id !== "all" && search !== "") {
      const [rows] = await db.query(
        "SELECT * FROM products WHERE category_id = ? AND product_name LIKE ? AND status = 'active'",
        [category_id, `%${search}%`],
      );
      result = rows;
    } else if (category_id !== "all") {
      const [rows] = await db.query(
        "SELECT * FROM products WHERE category_id = ? AND status = 'active'",
        [category_id],
      );
      result = rows;
    } else if (search !== "") {
      const [rows] = await db.query(
        "SELECT * FROM products WHERE product_name LIKE ? AND status = 'active'",
        [`%${search}%`],
      );
      result = rows;
    } else {
      const [rows] = await db.query(
        "SELECT * FROM products WHERE status = 'active'",
      );
      result = rows;
    }

    if (!result.length) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json({
      status: true,
      data: result,
      message: "Product fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("SELECT * FROM  products WHERE id=?", [id]);
    if (data.length == 0) {
      return res.status(400).json({
        status: false,
        message: "product not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: data,
      message: "Product fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.messages });
  }
};

const createProduct = async (req, res) => {
  try {
    const { error, value } = createProductSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(404).json({
        status: false,
        message: message,
      });
    }
    const {
      product_name,
      description,
      original_price,
      offer_price,
      stock,
      category_id,
      image_url,
      is_featured,
      is_trending,
      status,
      sku,
    } = value;
    const [duplicate] = await db.query(
      "SELECT id FROM products WHERE product_name = ? AND category_id = ?",
      [product_name, category_id],
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Product already exists in this category",
      });
    }

    await db.query(
      "INSERT INTO  products (product_name,description,original_price,offer_price,stock,category_id,image_url,is_featured,is_trending,status,sku) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        product_name,
        description,
        original_price,
        offer_price,
        stock,
        category_id,
        image_url,
        is_featured,
        is_trending,
        status,
        sku,
      ],
    );
    return res.status(201).json({
      status: true,
      message: "Product Created  successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = createProductSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");

      return res.status(404).json({
        status: false,
        message: message,
      });
    }

    const [existing] = await db.query("SELECT * FROM products WHERE id=?", [
      id,
    ]);
    if (existing == 0) {
      return res
        .status(400)
        .json({ status: false, message: "Product not found" });
    }
    const {
      product_name,
      description,
      original_price,
      offer_price,
      stock,
      category_id,
      image_url,
      is_featured,
      is_trending,
      status,
      sku,
    } = value;

    const [duplicate] = await db.query(
      "SELECT id FROM products WHERE product_name = ? AND category_id = ? AND id != ?",
      [product_name, category_id, id],
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Product already exists in this category",
      });
    }

    const [skuCheck] = await db.query(
      "SELECT id FROM products WHERE sku = ? AND id != ?",
      [sku, id],
    );

    if (skuCheck.length > 0) {
      return res.status(400).json({
        status: false,
        message: "SKU already exists",
      });
    }
    await db.query(
      "UPDATE products SET product_name=?, description=?, original_price=? , offer_price=?, stock=?,category_id=? ,image_url=?,is_featured=?, is_trending =?,status=?, sku=? WHERE id=?",
      [
        product_name,
        description,
        original_price,
        offer_price,
        stock,
        category_id,
        image_url,
        is_featured,
        is_trending,
        status,
        sku,
        id,
      ],
    );

    return res.status(200).json({
      status: true,
      message: "Product Update successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { id, status } = req.body || {};
    const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (existing == 0) {
      return res
        .status(400)
        .json({ status: false, message: "Product not found" });
    }
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Status must be 'active' or 'inactive'",
      });
    }

    await db.query("UPDATE products SET status=? WHERE id=?", [status, id]);
    return res.status(200).json({
      status: true,
      message: "Product status update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProduct,
  createProduct,
  updateProduct,
  getProductById,
  updateProductStatus,
};

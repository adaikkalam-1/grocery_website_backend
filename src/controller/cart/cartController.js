const db = require("../../../config/dbConfig");
const {
  addToCartSchema,
  updateCartSchema,
} = require("../../validations/cartValidation");

// ================= GET OR CREATE CART START =================
const getOrCreateCart = async (userId) => {
  const [cart] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
    userId,
  ]);

  if (cart.length > 0) return cart[0].id;

  const [newCart] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [
    userId,
    "active",
  ]);

  return newCart.insertId;
};
// ================= GET OR CREATE CART END =================

// ================= ADD TO CART START =================
const addToCart = async (req, res) => {
  try {
    const { error, value } = addToCartSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({ status: false, message });
    }
    // const userId = req.user.id;
    const { productId, quantity, userId } = value;

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const cartId = await getOrCreateCart(userId);

    const [existing] = await db.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId],
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?",
        [quantity, cartId, productId],
      );
    } else {
      const [product] = await db.query(
        "SELECT offer_price, product_name FROM products WHERE id = ?",
        [productId],
      );
      if (!product.length) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      await db.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [cartId, productId, quantity, product[0]?.offer_price],
      );
    }

    return res
      .status(201)
      .json({ status: true, message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
// ================= ADD TO CART END =================

// ================= INCREMENT START =================
const incrementItem = async (req, res) => {
  try {
    const { error, value } = updateCartSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({ status: false, message });
    }
    const { productId, userId, quantity } = value;
    // const userId = req.user.id;

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const [cart] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
      userId,
    ]);

    const cartId = cart[0]?.id;

    if (!cartId) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    await db.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?",
      [quantity, cartId, productId],
    );

    return res
      .status(201)
      .json({ status: true, message: "Quantity increased" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
// ================= INCREMENT END =================

// ================= DECREMENT START =================
const decrementItem = async (req, res) => {
  try {
    const { error, value } = updateCartSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({ status: false, message });
    }
    const { productId, userId, quantity } = value;
    // const userId = req.user.id;

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const [cart] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
      userId,
    ]);

    const cartId = cart[0]?.id;

    if (!cartId) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    const [item] = await db.query(
      "SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId],
    );

    if (!item.length) {
      return res.status(404).json({ status: false, message: "Item not found" });
    }

    if (item[0].quantity === 1) {
      await db.query(
        "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
        [cartId, productId],
      );
    } else {
      await db.query(
        "UPDATE cart_items SET quantity = quantity - ? WHERE cart_id = ? AND product_id = ?",
        [quantity, cartId, productId],
      );
    }

    return res
      .status(200)
      .json({ status: true, message: "Quantity decreased" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
// ================DECREMENT END =================

// ================= GET CART START =================
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    // const userId = req.user.id;
    const [cart] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
      userId,
    ]);

    console.log("cart", cart);
    const cartId = cart[0]?.id;

    if (!cartId) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    const [items] = await db.query(
      `SELECT ci.product_id, c.category_name, ci.quantity, ci.price, p.product_name, p.image_url ,p.original_price,p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE ci.cart_id = ?`,

      [cartId],
    );

    const total = items?.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const totalOriginal = items?.reduce(
      (sum, item) => sum + item.quantity * item.original_price,
      0,
    );
    const tax = totalOriginal * 0.05;
    const deliveryCharge = items?.length > 0 ? 10 : 0;
    const totalAmount = total + tax + deliveryCharge;

    return res.status(200).json({
      status: true,
      total,
      items,
      totalAmount,
      tax,
      deliveryCharge,
      subTotal: totalOriginal,
      totalItems: items?.length || 0,
      cartId,
      message: "Cart fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
// ================= GET CART END =================

// ================= CLEAR CART START =================
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    // const userId = req.user.id;
    const [existingUser] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!existingUser.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const [cart] = await db.query(
      "SELECT * FROM carts WHERE user_id = ? AND status = 'active'",
      [userId],
    );

    const cartId = cart[0]?.id;

    if (!cartId) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    await db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    return res
      .status(200)
      .json({ status: true, message: "Cart cleared successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
// ================= CLEAR CART END =================

const clearSingleItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    // const userId = req.user.id;
    const [existingUser] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!existingUser.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const [cart] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
      userId,
    ]);

    const cartId = cart[0]?.id;

    if (!cartId) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    await db.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId],
    );

    return res
      .status(200)
      .json({ status: true, message: "Item cleared successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  addToCart,
  incrementItem,
  decrementItem,
  getCart,
  clearCart,
  clearSingleItem,
};

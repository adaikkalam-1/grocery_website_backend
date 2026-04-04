const db = require("../../../config/dbConfig");
const { checkoutSchema } = require("../../validations/checkoutValidation");

const checkout = async (req, res) => {
  const connection = await db.getConnection();
  console.log("req.body", req.body);
  try {
    const { error, value } = checkoutSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({ status: false, message });
    }

    const { userId, cartId, addressId, payment_method } = value;

    await connection.beginTransaction();

    const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user.length) {
      await connection.rollback();
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const [cartData] = await connection.query(
      "SELECT * FROM carts WHERE id = ? AND user_id = ?",
      [cartId, userId],
    );

    console.log("cartData", cartData);
    if (!cartData.length) {
      await connection.rollback();
      return res.status(400).json({
        status: false,
        message: "Cart not found or inactive cart ",
      });
    }

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, ci.price, p.stock , p.original_price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cartId],
    );

    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({
        status: false,
        message: "Cart is empty",
      });
    }

    let subtotal = 0;

    for (let item of cartItems) {
      if (item.quantity > item.stock) {
        await connection.rollback();
        return res.status(400).json({
          status: false,
          message: "Insufficient stock",
        });
      }

      subtotal += item.price * item.quantity;
    }
    let address;
    if (addressId) {
      [address] = await connection.query(
        "SELECT * FROM addresses WHERE id = ? AND user_id = ? ",
        [addressId, userId],
      );
    } else {
      [address] = await connection.query(
        "SELECT * FROM addresses WHERE user_id = ? AND is_default = 1",
        [userId],
      );
    }
    if (!address.length) {
      await connection.rollback();
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }

    const fullAddress = `${address[0].address}, ${address[0].city}, ${address[0].state} - ${address[0].zip_code}`;
    const totalOriginal = cartItems?.reduce(
      (sum, item) => sum + item.quantity * item.original_price,
      0,
    );
    const tax = totalOriginal * 0.05;
    const deliveryCharge = 10;
    const totalAmount = subtotal + tax + deliveryCharge;
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, address, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, totalAmount, "pending", fullAddress, payment_method],
    );

    const orderId = orderResult.insertId;

    for (let item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price],
      );

      const [updateStock] = await connection.query(
        `UPDATE products 
         SET stock = stock - ? 
         WHERE id = ? AND stock >= ?`,
        [item.quantity, item.product_id, item.quantity],
      );

      if (updateStock.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          status: false,
          message: "Stock update failed (race condition)",
        });
      }
    }

    await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [
      cartId,
    ]);
    // await connection.query("UPDATE carts SET status = 'ordered' WHERE id = ?", [
    //   cartId,
    // ]);

    await connection.commit();

    return res.status(200).json({
      status: true,
      message: "Order placed successfully",
      orderId,
      totalAmount,
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  checkout,
};

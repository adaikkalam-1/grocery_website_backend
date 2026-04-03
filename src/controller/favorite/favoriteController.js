const db = require("../../../config/dbConfig");

const toggleFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
    if (!product.length) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    const [favorite] = await db.query(
      "SELECT * FROM favorites WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );
    if (favorite.length > 0) {
      await db.query(
        "DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
        [userId, productId],
      );
      return res
        .status(200)
        .json({ status: true, message: "Removed from favorites" });
    } else {
      await db.query(
        "INSERT INTO favorites (user_id, product_id) VALUES (?, ?)",
        [userId, productId],
      );
      return res
        .status(200)
        .json({ status: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.log("err", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    const [user] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (!user.length) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const [favorites] = await db.query(
      `
      SELECT 
        p.id AS product_id,
        p.product_name,
        p.description,
        p.original_price,
        p.offer_price,
        p.image_url,
        p.stock,
        p.status,
        f.id AS favorite_id,
        f.created_at AS favorite_created_at
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      `,
      [userId],
    );

    return res.status(200).json({
      status: true,
      count: favorites.length,
      data: favorites,
      message:
        favorites.length > 0
          ? "Favorites fetched successfully"
          : "No favorites found",
    });
  } catch (error) {
    console.log("err", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = { toggleFavorite, getFavorites };

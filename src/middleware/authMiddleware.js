const jwt = require("jsonwebtoken");
const db = require("../../config/dbConfig");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const parts = token.split(" ");
    if (parts[0] !== "Bearer" || !parts[1]) {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const rawToken = parts[1];
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    const [user] = await db.query("SELECT * FROM users WHERE  id = ? ", [
      decoded.id,
    ]);
    const userID = user[0];
    if (!userID) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;

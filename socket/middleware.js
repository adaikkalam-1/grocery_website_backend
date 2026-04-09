const jwt = require("jsonwebtoken");
const db = require("../config/dbConfig");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const parts = token.split(" ");
    const rawToken = parts[1];

    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    const [user] = await db.query("SELECT id FROM users WHERE id = ?", [
      decoded.id,
    ]);

    if (!user.length) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

module.exports = socketAuth;

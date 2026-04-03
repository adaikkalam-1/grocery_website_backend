const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(" MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error(" MySQL Connection Error:", err);
  }
})();

module.exports = pool;
